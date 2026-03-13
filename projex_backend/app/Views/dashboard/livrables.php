<h1>Livrables du projet</h1>

<?php if (empty($items)): ?>
  <p>Aucun livrable pour ce projet.</p>
<?php else: ?>
  <table border="1" cellpadding="8">
    <tr>
      <th>Étudiant</th>
      <th>Titre</th>
      <th>Type</th>
      <th>Statut</th>
      <th>Fichier</th>
      <th>Action</th>
      <th>Version</th>
      <th>Commentaires</th>

    </tr>

    <?php foreach ($items as $i): ?>
      <tr>
        <td><?= htmlspecialchars($i["prenom"] . " " . $i["nom"]) ?></td>
        <td><?= htmlspecialchars($i["titre"]) ?></td>
        <td><?= htmlspecialchars($i["type"]) ?></td>
        <td><?= htmlspecialchars($i["statut"]) ?></td>
        <td>v<?= (int)$i["version_num"] ?></td>
        <td>
          <a href="<?= htmlspecialchars($i["file_path"]) ?>" target="_blank">
            Télécharger
          </a>
        </td>
        <td>
          <?php if ($i["statut"] === "SOUMIS"): ?>
            <form method="POST" action="/projex/public/projects/livrables/status" style="display:inline">
              <input type="hidden" name="livrable_id" value="<?= (int)$i["id"] ?>">
              <input type="hidden" name="project_id" value="<?= (int)$i["project_id"] ?>">
              <input type="hidden" name="action" value="VALIDE">
              <button type="submit">Valider</button>
            </form>

            <form method="POST" action="/projex/public/projects/livrables/status" style="display:inline">
                <input type="hidden" name="livrable_id" value="<?= (int)$i["id"] ?>">
                <input type="hidden" name="project_id" value="<?= (int)$i["project_id"] ?>">
                <input type="hidden" name="action" value="REJETE">
                <input type="text" name="rejection_reason" placeholder="Motif du rejet">
                <button type="submit">Rejeter</button>
            </form>
          <?php else: ?>
            —
          <?php endif; ?>
        </td>
        <td>
          <form method="POST" action="/projex/public/projects/livrables/comment">
            <input type="hidden" name="livrable_id" value="<?= (int)$i["id"] ?>">
            <input type="hidden" name="project_id" value="<?= (int)$i["project_id"] ?>">
            <textarea name="commentaire" placeholder="Ajouter un commentaire"></textarea><br>
            <button type="submit">Envoyer</button>
          </form>

          <?php
            $comments = Livrable::comments($pdo, (int)$i["id"]);
          ?>
          <?php if (!empty($comments)): ?>
            <ul>
              <?php foreach ($comments as $c): ?>
                <li>
                  <strong><?= htmlspecialchars($c["prenom"] . " " . $c["nom"]) ?> :</strong>
                  <?= htmlspecialchars($c["commentaire"]) ?>
                </li>
              <?php endforeach; ?>
            </ul>
          <?php endif; ?>
        </td>
      </tr>
    <?php endforeach; ?>
  </table>
<?php endif; ?>