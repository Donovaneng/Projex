<h1>Connexion</h1>

<?php if (!empty($error)): ?>
  <p style="color:red"><?= htmlspecialchars($error) ?></p>
<?php endif; ?>

<form method="POST" action="/projex/public/login">
  <input type="email" name="email" placeholder="Email" required><br><br>
  <input type="password" name="password" placeholder="Mot de passe" required><br><br>
  <button type="submit">Se connecter</button>
</form>