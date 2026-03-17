<?php
// Test de mot de passe
$user_password_hash = '$2y$10$khAkH36Qh8BcQxw2vT.PWeJOpE9hednAy1c9QFcfUmFKIAGcobca.';
$password_to_test = 'admin2024';

echo "Hash en base: " . $user_password_hash . "\n";
echo "Mot de passe testé: " . $password_to_test . "\n";
echo "Vérification: " . (password_verify($password_to_test, $user_password_hash) ? '✅ VALIDE' : '❌ INVALIDE') . "\n";

// Générer un nouveau hash correct
$new_hash = password_hash('admin2024', PASSWORD_DEFAULT);
echo "\nNouveau hash généré: " . $new_hash . "\n";
echo "Vérification nouveau hash: " . (password_verify('admin2024', $new_hash) ? '✅ VALIDE' : '❌ INVALIDE') . "\n";
?>
