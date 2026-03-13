<h1>Dashboard</h1>

<p>
  Bienvenue
  <strong><?= htmlspecialchars($_SESSION["user"]["prenom"] ?? "") ?></strong>
  (<?= htmlspecialchars($_SESSION["user"]["role"] ?? "") ?>)
</p>

<p>
  <a href="/projex/public/logout">Se déconnecter</a>
</p>