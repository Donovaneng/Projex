<?php
declare(strict_types=1);

final class Soutenance
{
    public static function create(PDO $pdo, int $projet_id, string $date, ?string $salle, ?string $jury): int
    {
        // Nettoyer la date (remplacer le T du datetime-local par un espace pour MySQL)
        $date = str_replace('T', ' ', $date);
        
        $stmt = $pdo->prepare("
            INSERT INTO soutenances (projet_id, date_soutenance, salle, jury_membres)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([
            $projet_id, 
            $date, 
            !empty($salle) ? $salle : null, 
            !empty($jury) ? $jury : null
        ]);
        return (int)$pdo->lastInsertId();
    }

    public static function all(PDO $pdo): array
    {
        $stmt = $pdo->query("
            SELECT s.*, p.titre as projet_titre, u.nom, u.prenom 
            FROM soutenances s
            LEFT JOIN projects p ON s.projet_id = p.id
            LEFT JOIN users u ON p.student_id = u.id
            ORDER BY s.date_soutenance ASC
        ");
        $soutenances = $stmt->fetchAll();
        
        foreach ($soutenances as &$s) {
            $s['jury'] = self::getJuryMembers($pdo, (int)$s['id']);
        }
        
        return $soutenances;
    }

    public static function getJuryMembers(PDO $pdo, int $soutenanceId): array
    {
        $stmt = $pdo->prepare("
            SELECT jm.*, u.nom, u.prenom, u.role as user_role
            FROM jury_members jm
            LEFT JOIN users u ON jm.user_id = u.id
            WHERE jm.soutenance_id = ?
            ORDER BY FIELD(jm.role, 'PRESIDENT', 'RAPPORTEUR', 'EXAMINATEUR', 'INVITE')
        ");
        $stmt->execute([$soutenanceId]);
        return $stmt->fetchAll();
    }

    public static function addJuryMember(PDO $pdo, int $soutenanceId, ?int $userId, ?string $externalName, string $role): void
    {
        $stmt = $pdo->prepare("
            INSERT INTO jury_members (soutenance_id, user_id, external_name, role)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$soutenanceId, $userId, $externalName, $role]);
    }

    public static function clearJuryMembers(PDO $pdo, int $soutenanceId): void
    {
        $stmt = $pdo->prepare("DELETE FROM jury_members WHERE soutenance_id = ?");
        $stmt->execute([$soutenanceId]);
    }

    public static function update(PDO $pdo, int $id, array $data): void
    {
        $date = str_replace('T', ' ', $data["date_soutenance"]);
        
        $stmt = $pdo->prepare("
            UPDATE soutenances 
            SET date_soutenance = ?, salle = ?, jury_membres = ?, note_finale = ?, observations = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $date,
            !empty($data["salle"]) ? $data["salle"] : null,
            !empty($data["jury_membres"]) ? $data["jury_membres"] : null,
            !empty($data["note_finale"]) ? (float)$data["note_finale"] : null,
            !empty($data["observations"]) ? $data["observations"] : null,
            $id
        ]);
    }

    public static function delete(PDO $pdo, int $id): void
    {
        $stmt = $pdo->prepare("DELETE FROM soutenances WHERE id = ?");
        $stmt->execute([$id]);
    }
}
