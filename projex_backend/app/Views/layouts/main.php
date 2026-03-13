<?php
// app/Views/layouts/main.php
// Variables disponibles : $title (optionnel) et $content (obligatoire)
?>
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= htmlspecialchars($title ?? "PROJEX") ?></title>
  <style>
    body{font-family:Arial, sans-serif; margin:20px;}
    .container{max-width:900px; margin:0 auto;}
    a{color:#1e4aa8; text-decoration:none;}
    a:hover{text-decoration:underline;}
    .card{border:1px solid #ddd; border-radius:12px; padding:16px; margin:12px 0;}
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <strong>PROJEX</strong> - Système de gestion de projets
      <span style="float:right">
        <a href="/projex/public/">Accueil</a>
        | <a href="/projex/public/notifications">
            Notifications<?= $unreadNotifications > 0 ? " (" . $unreadNotifications . ")" : "" ?>
          </a>
      </span>
    </div>

    <?php if (!empty($_SESSION["user"])): ?>
      <div style="padding:10px; border-bottom:1px solid #ddd; margin-bottom:15px;">
        Connecté : <strong><?= htmlspecialchars(($_SESSION["user"]["prenom"] ?? "")." ".($_SESSION["user"]["nom"] ?? "")) ?></strong>
        | <a href="/projex/public/dashboard">Dashboard</a>

        | <a href="/projex/public/logout">Déconnexion</a>
      </div>
    <?php endif; ?>
    <!-- Ici on injecte le contenu de chaque page -->
    <?= $content ?>

    <div class="card" style="opacity:.7">
      <small>© <?= date("Y") ?> PROJEX</small>
    </div>
  </div>
</body>
</html>