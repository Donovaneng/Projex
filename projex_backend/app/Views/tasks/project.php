<h1>Tâches du projet</h1>

<?php if (!empty($project)): ?>
  <p><strong>Projet :</strong> <?= htmlspecialchars($project["titre"]) ?></p>
  <p>
    <a href="/projex/public/tasks/create?project_id=<?= (int)$project["id"] ?>">
      + Ajouter une tâche
    </a>
  </p>
<?php endif; ?>

<?php if (empty($tasks)): ?>
  <p>Aucune tâche pour ce projet.</p>
<?php else: ?>
  <table border="1" cellpadding="8" cellspacing="0">
    <thead>
      <tr>
        <th>ID</th>
        <th>Titre</th>
        <th>Description</th>
        <th>Étudiant</th>
        <th>Date limite</th>
        <th>Statut</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($tasks as $t): ?>
        <tr>
          <td><?= (int)$t["id"] ?></td>
          <td><?= htmlspecialchars($t["titre"]) ?></td>
          <td><?= htmlspecialchars((string)$t["description"]) ?></td>
          <td><?= htmlspecialchars(($t["prenom"] ?? "") . " " . ($t["nom"] ?? "")) ?></td>
          <td><?= htmlspecialchars((string)$t["due_date"]) ?></td>
          <td><?= htmlspecialchars($t["statut"]) ?></td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
<?php endif; ?>