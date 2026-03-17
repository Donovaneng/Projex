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
            $stmt = $pdo->prepare("
                SELECT m.id as message_id, m.project_id, m.sender_id, m.message, m.created_at, u.prenom, u.nom, u.role
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

        $input = json_decode(file_get_contents("php://input"), true);
        $messageText = trim($input["message"] ?? "");
        $logFile = __DIR__ . "/../../../chat_debug.log";
        
        error_log("SendMessage: " . date('Y-m-d H:i:s') . " Project=$projectId, User=$userId, Role=$role, MessageLength=" . strlen($messageText) . "\n", 3, $logFile);

        if (empty($messageText)) {
            http_response_code(400);
            echo json_encode(["error" => "Le message ne peut pas être vide."]);
            return;
        }

        // Check if user is part of the project
        if ($role !== 'ADMIN') {
            $stmt = $pdo->prepare("SELECT project_id FROM project_assignments WHERE project_id = ? AND (etudiant_id = ? OR encadreur_acad_id = ? OR encadreur_pro_id = ?)");
            $stmt->execute([$projectId, $userId, $userId, $userId]);
            if (!$stmt->fetch()) {
                error_log("SendMessage: " . date('Y-m-d H:i:s') . " Permission DENIED for User $userId on Project $projectId\n", 3, $logFile);
                http_response_code(403);
                echo json_encode(["error" => "Vous n'êtes pas autorisé à envoyer un message dans ce projet."]);
                return;
            }
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO messages (project_id, sender_id, message) VALUES (?, ?, ?)");
            $stmt->execute([$projectId, $userId, $messageText]);

            // Notifications
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
                                "Nouveau message",
                                "Vous avez reçu un nouveau message dans votre projet.",
                                ($_SESSION["user"]["role"] === 'ETUDIANT' ? "/supervisor/projects" : "/student/projects") . "?view=chat&id=" . $projectId,
                                "MESSAGE",
                                $projectId
                            );
                        }
                    }
                } catch (Throwable $notifError) {
                    error_log("SendMessage: Notification failed but continuing: " . $notifError->getMessage() . "\n", 3, $logFile);
                }
            }

            header("Content-Type: application/json");
            echo json_encode(["success" => true, "message" => "Message envoyé !"]);
        } catch (PDOException $e) {
            error_log("SendMessage: " . date('Y-m-d H:i:s') . " PDO Error: " . $e->getMessage() . "\n", 3, $logFile);
            http_response_code(500);
            echo json_encode(["error" => "Erreur lors de l'envoi du message."]);
        } catch (Throwable $e) {
            error_log("SendMessage: " . date('Y-m-d H:i:s') . " General Error: " . $e->getMessage() . "\n", 3, $logFile);
            http_response_code(500);
            echo json_encode(["error" => "Erreur système lors de l'envoi."]);
        }
    }
}
