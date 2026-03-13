<h1>Mes livrables</h1>

<p><a href="/projex/public/student/livrables/upload">+ Déposer un livrable</a></p>

<?php if (empty($items)): ?>
  <p>Aucun livrable déposé.</p>
<?php else: ?>
  <table border="1" cellpadding="8" cellspacing="0">
    <thead>
      <tr>
        <th>ID</th>
        <th>Projet</th>
        <th>Titre</th>
        <th>Type</th>
        <th>Statut</th>
        <th>Fichier</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($items as $i): ?>
        <tr>
          <td><?= (int)$i["id"] ?></td>
          <td><?= htmlspecialchars($i["projet_titre"]) ?></td>
          <td><?= htmlspecialchars($i["titre"]) ?></td>
          <td><?= htmlspecialchars($i["type"]) ?></td>
          <td><?= htmlspecialchars($i["statut"]) ?></td>
          <td>
            <a href="<?= htmlspecialchars($i["file_path"]) ?>" target="_blank">
              <?= htmlspecialchars($i["file_name"]) ?>
            </a>
          </td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
<?php endif; ?>