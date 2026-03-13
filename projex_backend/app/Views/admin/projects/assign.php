<h1>Affecter projet : <?= htmlspecialchars($project["titre"]) ?></h1>

<form method="POST" action="/projex/public/admin/projects/assign">
  <input type="hidden" name="project_id" value="<?= $project["id"] ?>">

  <label>Étudiant</label><br>
  <select name="etudiant_id" required>
    <option value="">-- choisir --</option>
    <?php foreach ($etudiants as $u): ?>
      <option value="<?= $u["id"] ?>">
        <?= htmlspecialchars($u["prenom"] . " " . $u["nom"]) ?>
      </option>
    <?php endforeach; ?>
  </select><br><br>

  <label>Encadreur académique</label><br>
  <select name="acad_id">
    <option value="">-- choisir --</option>
    <?php foreach ($acad as $u): ?>
      <option value="<?= $u["id"] ?>">
        <?= htmlspecialchars($u["prenom"] . " " . $u["nom"]) ?>
      </option>
    <?php endforeach; ?>
  </select><br><br>

  <label>Encadreur professionnel</label><br>
  <select name="pro_id">
    <option value="">-- choisir --</option>
    <?php foreach ($pro as $u): ?>
      <option value="<?= $u["id"] ?>">
        <?= htmlspecialchars($u["prenom"] . " " . $u["nom"]) ?>
      </option>
    <?php endforeach; ?>
  </select><br><br>

  <button type="submit">Affecter</button>
</form>