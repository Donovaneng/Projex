<?php
require_once __DIR__ . '/projex_backend/bootstrap.php';

try {
    // $pdo est défini globalement par bootstrap.php
    
    // Remplacement des URLs legacy par les nouvelles routes React
    $updates = [
        ['%projex/public/projects/livrables%', '/student/deliverables'],
        ['%projex/public/student/livrables%', '/student/deliverables'],
        ['%projex/public/admin/projects%', '/admin/projects'],
        ['%projex/public/admin/users%', '/admin/users'],
        ['%projex/public/tasks/student%', '/student/tasks'],
        ['%projex/public/tasks/project%', '/supervisor/projects'],
        ['%projex/public/dashboard%', '/'],
        ['%projex/public/notifications%', '/notifications'],
        ['%projex/public/settings%', '/settings']
    ];
    
    $totalUpdated = 0;
    foreach ($updates as $update) {
        $stmt = $pdo->prepare("UPDATE notifications SET link_url = ? WHERE link_url LIKE ?");
        $stmt->execute([$update[1], $update[0]]);
        $totalUpdated += $stmt->rowCount();
        echo "Updated " . $stmt->rowCount() . " rows for " . $update[1] . "\n";
    }
    
    echo "Total notifications updated: $totalUpdated\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
