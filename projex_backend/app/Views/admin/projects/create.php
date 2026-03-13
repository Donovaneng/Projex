<h1>Créer un projet</h1>

<?php if (!empty($error)): ?>
  <p style="color:red"><?= htmlspecialchars($error) ?></p>
<?php endif; ?>

<form method="POST" action="/projex/public/admin/projects/create">
  <input name="titre" placeholder="Titre du projet" required><br><br>

  <textarea name="description" placeholder="Description (optionnel)"></textarea><br><br>

  <label>Date début</label><br>
  <input type="date" name="date_debut"><br><br>

  <label>Date fin</label><br>
  <input type="date" name="date_fin"><br><br>

  <button type="submit">Créer</button>
</form>