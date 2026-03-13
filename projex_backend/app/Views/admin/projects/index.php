<h1>Projets</h1>

<p><a href="/projex/public/admin/projects/create">+ Créer un projet</a></p>

<?php if (empty($projects)): ?>
  <p>Aucun projet.</p>
<?php else: ?>
  <table border="1" cellpadding="8" cellspacing="0">
    <thead>
        <tr>
            <th>ID</th>
            <th>Titre</th>
            <th>Statut</th>
            <th>Date début</th>
            <th>Date fin</th>
            <th>Action</th>
        </tr>
    </thead>
    <tbody>
      <?php foreach ($projects as $p): ?>
        <tr>
            <td><?= (int)$p["id"] ?></td>
            <td><?= htmlspecialchars($p["titre"]) ?></td>
            <td><?= htmlspecialchars($p["statut"]) ?></td>
            <td><?= htmlspecialchars((string)$p["date_debut"]) ?></td>
            <td><?= htmlspecialchars((string)$p["date_fin"]) ?></td>
            <td>
                <a href="/projex/public/admin/projects/assign?id=<?= (int)$p["id"] ?>">Affecter</a>
                |
                <a href="/projex/public/tasks/project?project_id=<?= (int)$p["id"] ?>">Voir tâches</a>
                |
                <a href="/projex/public/tasks/create?project_id=<?= (int)$p["id"] ?>">Ajouter tâche</a>
            </td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
<?php endif; ?>