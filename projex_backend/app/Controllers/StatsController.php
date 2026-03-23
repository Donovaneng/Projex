<?php
declare(strict_types=1);

final class StatsController
{
    public static function getAdminStats(PDO $pdo): void
    {
        AuthMiddleware::handle();
        if (($_SESSION["user"]["role"] ?? "") !== "ADMIN") {
            http_response_code(403);
            echo json_encode(["error" => "Accès réservé aux administrateurs."]);
            return;
        }

        try {
            $periodId = isset($_GET["period_id"]) ? (int)$_GET["period_id"] : null;
            $periodFilter = $periodId ? " AND p.period_id = $periodId" : "";
            $periodWhere = $periodId ? " WHERE p.period_id = $periodId" : "";
            // Special case for simple queries without alias p
            $periodWhereSimple = $periodId ? " WHERE period_id = $periodId" : "";

            // Users stats
            $users = $pdo->query("SELECT COUNT(*) as total, SUM(CASE WHEN actif = 1 THEN 1 ELSE 0 END) as active, SUM(CASE WHEN actif = 0 THEN 1 ELSE 0 END) as pending FROM users")->fetch();

            // Projects stats
            $projects = $pdo->query("SELECT COUNT(*) as total, SUM(CASE WHEN statut = 'EN_COURS' THEN 1 ELSE 0 END) as en_cours, SUM(CASE WHEN statut = 'TERMINE' THEN 1 ELSE 0 END) as termine, SUM(CASE WHEN statut = 'EN_ATTENTE' THEN 1 ELSE 0 END) as en_attente FROM projects" . $periodWhereSimple)->fetch();

            // Deliverables
            $deliverablesCount = $pdo->query("SELECT COUNT(l.id) FROM livrables l JOIN projects p ON p.id = l.project_id" . $periodWhere)->fetchColumn();

            // Recent activity
            $recentUsers = $pdo->query("SELECT prenom, nom, role, created_at FROM users ORDER BY created_at DESC LIMIT 5")->fetchAll();
            $recentDeliverables = [];
            try {
                $recentDeliverables = $pdo->query("SELECT l.titre, u.prenom, u.nom, l.submitted_at FROM livrables l JOIN users u ON u.id = l.etudiant_id JOIN projects p ON p.id = l.project_id" . $periodWhere . " ORDER BY l.submitted_at DESC LIMIT 5")->fetchAll();
            } catch (Throwable $e) {}

            // Projects by category
            $projectsByCategory = [];
            try {
                $projectsByCategory = $pdo->query("SELECT c.label as category, COUNT(p.id) as count FROM project_categories c LEFT JOIN projects p ON p.categorie_id = c.id" . $periodFilter . " GROUP BY c.id, c.label")->fetchAll();
            } catch (Throwable $e) {}

            // Monthly activity (Last 6 months)
            $monthlyActivity = $pdo->query("SELECT DATE_FORMAT(created_at, '%Y-%m') as sort_key, DATE_FORMAT(created_at, '%b %Y') as month, COUNT(*) as count FROM projects p WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)" . $periodFilter . " GROUP BY month, sort_key ORDER BY sort_key ASC")->fetchAll();

            header("Content-Type: application/json");
            echo json_encode([
                "users" => [
                    "total" => (int)($users["total"] ?? 0),
                    "active" => (int)($users["active"] ?? 0),
                    "pending" => (int)($users["pending"] ?? 0)
                ],
                "projects" => [
                    "total" => (int)($projects["total"] ?? 0),
                    "en_cours" => (int)($projects["en_cours"] ?? 0),
                    "termine" => (int)($projects["termine"] ?? 0),
                    "en_attente" => (int)($projects["en_attente"] ?? 0)
                ],
                "total_deliverables" => (int)($deliverablesCount ?? 0),
                "by_category" => $projectsByCategory,
                "monthly_activity" => $monthlyActivity,
                "recent_users" => $recentUsers,
                "recent_deliverables" => $recentDeliverables
            ]);
        } catch (Throwable $e) {
            http_response_code(500);
            header("Content-Type: application/json");
            echo json_encode(["error" => "Erreur lors du calcul des statistiques : " . $e->getMessage()]);
        }
    }
}
