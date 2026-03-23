<?php
declare(strict_types=1);

final class ChatController
{
    public static function getMessages(PDO $pdo, int $projectId): void
    {
        AuthMiddleware::handle();
        $userId = (int)$_SESSION["user"]["id"];
        $role = $_SESSION["user"]["role"];

        // Check if user is part of the project
        if ($role !== 'ADMIN') {
            $stmt = $pdo->prepare("SELECT project_id FROM project_assignments WHERE project_id = ? AND (etudiant_id = ? OR encadreur_acad_id = ? OR encadreur_pro_id = ?)");
            $stmt->execute([$projectId, $userId, $userId, $userId]);
            if (!$stmt->fetch()) {
                http_response_code(403);
                echo json_encode(["error" => "Vous n'êtes pas autorisé à accéder à cette discussion."]);
                return;
            }
        }

        try {
            // Mark as read for this user
            $stmtMark = $pdo->prepare("UPDATE messages SET is_read = 1 WHERE project_id = ? AND sender_id != ?");
            $stmtMark->execute([$projectId, $userId]);

            $stmt = $pdo->prepare("
                SELECT m.id as message_id, m.project_id, m.sender_id, m.message, m.type, m.file_path, m.is_read, m.created_at, u.prenom, u.nom, u.role
                FROM messages m
                LEFT JOIN users u ON u.id = m.sender_id
                WHERE m.project_id = ?
                ORDER BY m.created_at ASC
            ");
            $stmt->execute([$projectId]);
            $messages = $stmt->fetchAll();

            header("Content-Type: application/json");
            echo json_encode(["messages" => $messages]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Erreur lors de la récupération des messages."]);
        }
    }

    public static function sendMessage(PDO $pdo, int $projectId): void
    {
        AuthMiddleware::handle();
        $userId = (int)$_SESSION["user"]["id"];
        $role = $_SESSION["user"]["role"];

        $data = json_decode(file_get_contents("php://input"), true) ?? $_POST;
        $messageText = trim($data["message"] ?? "");
        $type = $data["type"] ?? 'text';
        $filePath = $data["file_path"] ?? null;

        // Check for file upload (if using form-data)
        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            $allowedExtensions = ['pdf', 'doc', 'docx', 'zip', 'png', 'jpg', 'jpeg', 'gif'];
            $fileExtension = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));

            if (!in_array($fileExtension, $allowedExtensions)) {
                http_response_code(400);
                echo json_encode(["error" => "Type de fichier non autorisé."]);
                return;
            }

            $uploadDir = __DIR__ . "/../../../public/uploads/chat/";
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
            
            $fileName = uniqid('chat_', true) . '.' . $fileExtension;
            $targetPath = $uploadDir . $fileName;

            if (move_uploaded_file($_FILES['file']['tmp_name'], $targetPath)) {
                $filePath = "uploads/chat/" . $fileName;
                $type = in_array($fileExtension, ['jpg', 'jpeg', 'png', 'gif']) ? 'image' : 'file';
                if (empty($messageText)) {
                    $messageText = "A envoyé un " . ($type === 'image' ? "image" : "fichier") . ": " . $_FILES['file']['name'];
                }
            }
        }

        if (empty($messageText) && !$filePath) {
            http_response_code(400);
            echo json_encode(["error" => "Le message ne peut pas être vide."]);
            return;
        }

        // Check if user is part of the project
        if ($role !== 'ADMIN') {
            $stmt = $pdo->prepare("SELECT project_id FROM project_assignments WHERE project_id = ? AND (etudiant_id = ? OR encadreur_acad_id = ? OR encadreur_pro_id = ?)");
            $stmt->execute([$projectId, $userId, $userId, $userId]);
            if (!$stmt->fetch()) {
                http_response_code(403);
                echo json_encode(["error" => "Vous n'êtes pas autorisé à envoyer un message dans ce projet."]);
                return;
            }
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO messages (project_id, sender_id, recipient_id, message, type, file_path) VALUES (:project_id, :sender_id, :recipient_id, :message, :type, :file_path)");
            $stmt->execute([
                "project_id"  => $projectId,
                "sender_id"   => $userId,
                "recipient_id" => $data["recipient_id"] ?? null,
                "message"     => $messageText,
                "type"        => $type,
                "file_path"   => $filePath
            ]);
            $stmt = $pdo->prepare("SELECT etudiant_id, encadreur_acad_id, encadreur_pro_id FROM project_assignments WHERE project_id = ? LIMIT 1");
            $stmt->execute([$projectId]);
            $assignment = $stmt->fetch();

            if ($assignment) {
                try {
                    $recipients = [];
                    if ($role === 'ETUDIANT') {
                        if ($assignment['encadreur_acad_id']) $recipients[] = $assignment['encadreur_acad_id'];
                        if ($assignment['encadreur_pro_id']) $recipients[] = $assignment['encadreur_pro_id'];
                    } else {
                        $recipients[] = $assignment['etudiant_id'];
                    }

                    foreach ($recipients as $recipientId) {
                        if ($recipientId && (int)$recipientId !== $userId) {
                            Notification::create(
                                $pdo,
                                (int)$recipientId,
                                "Message de " . $_SESSION["user"]["prenom"],
                                $messageText,
                                ($_SESSION["user"]["role"] === 'ETUDIANT' ? "/supervisor/projects" : "/student/projects") . "?view=chat&id=" . $projectId,
                                "MESSAGE",
                                $projectId
                            );
                        }
                    }
                } catch (Throwable $notifError) {
                    // Log error if needed
                }
            }

            header("Content-Type: application/json");
            echo json_encode(["success" => true, "message" => "Message envoyé !"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Erreur lors de l'envoi du message."]);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(["error" => "Erreur système lors de l'envoi."]);
        }
    }
    
    public static function getSupportMessages(PDO $pdo): void
    {
        AuthMiddleware::handle();
        $userId = (int)$_SESSION["user"]["id"];
        $role = $_SESSION["user"]["role"];
        
        // Admin can request a specific user's conversation via query param
        $targetUserId = isset($_GET['userId']) ? (int)$_GET['userId'] : null;

        try {
            // Support messages: project_id IS NULL
            $sql = "
                SELECT m.id as message_id, m.sender_id, m.recipient_id, m.message, m.type, m.file_path, m.is_read, m.created_at, u.prenom, u.nom, u.role
                FROM messages m
                LEFT JOIN users u ON u.id = m.sender_id
                WHERE m.project_id IS NULL 
            ";
            
            if ($role !== 'ADMIN') {
                // Regular users only see their own conversation
                $sql .= " AND (m.sender_id = :userId OR m.recipient_id = :userId)";
            } elseif ($targetUserId) {
                // Admin sees conversation with a specific user
                $sql .= " AND (m.sender_id = :targetUserId OR m.recipient_id = :targetUserId)";
            }
            
            $sql .= " ORDER BY m.created_at ASC";
            
            $stmt = $pdo->prepare($sql);
            if ($role !== 'ADMIN') {
                $stmt->execute(["userId" => $userId]);
                
                // Mark as read for the user
                $stmtMark = $pdo->prepare("UPDATE messages SET is_read = 1 WHERE project_id IS NULL AND recipient_id = ?");
                $stmtMark->execute([$userId]);
            } elseif ($targetUserId) {
                $stmt->execute(["targetUserId" => $targetUserId]);
                
                // Mark as read for the admin
                $stmtMark = $pdo->prepare("UPDATE messages SET is_read = 1 WHERE project_id IS NULL AND recipient_id = ? AND sender_id = ?");
                $stmtMark->execute([$userId, $targetUserId]);
            } else {
                // Default admin view: maybe return everything or just empty
                $stmt->execute();
            }

            $messages = $stmt->fetchAll();
            header("Content-Type: application/json");
            echo json_encode(["messages" => $messages]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Erreur lors de la récupération des messages de support."]);
        }
    }

    public static function getConversations(PDO $pdo): void
    {
        AuthMiddleware::handle();
        $role = $_SESSION["user"]["role"];
        $userId = (int)$_SESSION["user"]["id"];

        if ($role !== 'ADMIN') {
            http_response_code(403);
            return;
        }

        try {
            // Get last message and unread count for each user who contacted support
            // We consider a conversation to be identified by the "other" user (not admin)
            $stmt = $pdo->prepare("
                SELECT 
                    u.id as user_id, u.nom, u.prenom, u.role, u.image_profil,
                    m_last.message as last_message,
                    m_last.created_at as last_message_date,
                    (SELECT COUNT(*) FROM messages WHERE project_id IS NULL AND sender_id = u.id AND recipient_id = :adminId AND is_read = 0) as unread_count
                FROM users u
                JOIN (
                    SELECT 
                        CASE WHEN sender_id = :adminId THEN recipient_id ELSE sender_id END as other_user_id,
                        MAX(id) as max_id
                    FROM messages
                    WHERE project_id IS NULL
                    GROUP BY other_user_id
                ) m_grp ON u.id = m_grp.other_user_id
                JOIN messages m_last ON m_last.id = m_grp.max_id
                ORDER BY m_last.created_at DESC
            ");
            $stmt->execute(["adminId" => $userId]);
            $conversations = $stmt->fetchAll();

            header("Content-Type: application/json");
            echo json_encode(["conversations" => $conversations]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Erreur lors de la récupération des conversations."]);
        }
    }

    public static function sendSupportMessage(PDO $pdo): void
    {
        AuthMiddleware::handle();
        $userId = (int)$_SESSION["user"]["id"];
        $role = $_SESSION["user"]["role"];
        
        $data = json_decode(file_get_contents("php://input"), true) ?? $_POST;
        $messageText = trim($data["message"] ?? "");
        $recipientId = isset($data["recipient_id"]) ? (int)$data["recipient_id"] : null;
        $type = 'text';

        if (empty($messageText)) {
            http_response_code(400);
            echo json_encode(["error" => "Le message de support ne peut pas être vide."]);
            return;
        }

        // Security check: Students/Supervisors can only message Admins (implied by null recipient or specific admin)
        // If not Admin, we force recipient_id to an Admin if not provided, or verify if it's an admin.
        if ($role !== 'ADMIN') {
            // Find an admin if no recipient provided
            if (!$recipientId) {
                $stmt = $pdo->query("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1");
                $admin = $stmt->fetch();
                $recipientId = $admin ? (int)$admin['id'] : null;
            } else {
                // Verify if recipient is indeed an admin
                $stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
                $stmt->execute([$recipientId]);
                $targetRole = $stmt->fetchColumn();
                if ($targetRole !== 'ADMIN') {
                    http_response_code(403);
                    echo json_encode(["error" => "Vous ne pouvez envoyer des messages de support qu'à l'administration."]);
                    return;
                }
            }
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO messages (project_id, sender_id, recipient_id, message, type) VALUES (NULL, ?, ?, ?, ?)");
            $stmt->execute([$userId, $recipientId, $messageText, $type]);

            header("Content-Type: application/json");
            echo json_encode(["success" => true, "message" => "Message de support envoyé !"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Erreur lors de l'envoi du message de support."]);
        }
    }
}
