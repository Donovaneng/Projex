<h1>Déposer un livrable</h1>

<?php if (!empty($error)): ?>
  <p style="color:red"><?= htmlspecialchars($error) ?></p>
<?php endif; ?>

<?php if (empty($project)): ?>
  <p>Aucun projet ne vous a encore été affecté.</p>
<?php else: ?>
  <p><strong>Projet :</strong> <?= htmlspecialchars($project["titre"]) ?></p>

  <form method="POST" action="/projex/public/student/livrables/upload" enctype="multipart/form-data">
    <input name="titre" placeholder="Titre du livrable" required><br><br>

    <select name="type" required>
      <option value="RAPPORT">Rapport</option>
      <option value="CODE_SOURCE">Code source</option>
      <option value="PRESENTATION">Présentation</option>
      <option value="AUTRE">Autre</option>
    </select><br><br>
    <label>Version</label><br>
    <input type="number" name="version_num" min="1" value="1" required><br><br>
    <input type="file" name="fichier" required><br><br>
    <p>
      Formats autorisés : PDF, DOC, DOCX, ZIP, PPT, PPTX<br>
      Taille maximale : 10 Mo
    </p>

    <button type="submit">Déposer</button>
  </form>
  
<?php endif; ?>