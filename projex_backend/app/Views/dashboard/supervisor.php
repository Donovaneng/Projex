<h1>Dashboard Encadreur <?= htmlspecialchars($type ?? "") ?></h1>

<?php if (empty($projects)): ?>
  <p>Aucun projet ne vous est affecté.</p>
<?php else: ?>
  <table border="1" cellpadding="8" cellspacing="0">
    <thead>
      <tr>
        <th>ID</th>
        <th>Titre</th>
        <th>Statut</th>
        <th>Date début</th>
        <th>Date fin</th>
        <th>Actions</th>
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
            <a href="/projex/public/projects/livrables?id=<?= (int)$p["id"] ?>">Voir livrables</a>
            |
            <a href="/projex/public/tasks/project?project_id=<?= (int)$p["id"] ?>">Voir tâches</a>
            |
            <a href="/projex/public/tasks/create?project_id=<?= (int)$p["id"] ?>">Ajouter tâche</a>
            | <a href="/projex/public/projects/evaluate?id=<?= (int)$p["id"] ?>">
              Évaluer
            </a>
            | <a href="/projex/public/projects/evaluate_pro?id=<?= (int)$p["id"] ?>">
              Évaluation professionnelle
            </a>
          </td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
<?php endif; ?>