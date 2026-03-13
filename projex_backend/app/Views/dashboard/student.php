<h1>Dashboard Étudiant</h1>

<?php if (empty($project)): ?>
  <p>Aucun projet ne vous a encore été affecté.</p>
<?php else: ?>
  <h3><?= htmlspecialchars($project["titre"]) ?></h3>
  <p><strong>Statut :</strong> <?= htmlspecialchars($project["statut"]) ?></p>

  <?php if (!empty($project["description"])): ?>
    <p><?= nl2br(htmlspecialchars($project["description"])) ?></p>
  <?php endif; ?>

  <p><strong>Date début :</strong> <?= htmlspecialchars((string)$project["date_debut"]) ?></p>
  <p><strong>Date fin :</strong> <?= htmlspecialchars((string)$project["date_fin"]) ?></p>

  <p>
    <a href="/projex/public/tasks/student">Voir mes tâches</a>
    |
    <a href="/projex/public/student/livrables">Mes livrables</a>
    |
    <a href="/projex/public/student/livrables/upload">Déposer un livrable</a>
  </p>

  <h2>Évaluation</h2>

  <?php if (empty($evaluation)): ?>

  <p>Aucune évaluation pour le moment.</p>

  <?php else: ?>

  <p>
  <strong>Note :</strong> <?= htmlspecialchars((string)$evaluation["note"]) ?>/20
  </p>

  <p>
    <strong>Commentaire de l'encadreur :</strong><br>
    <?= nl2br(htmlspecialchars((string)$evaluation["commentaire"])) ?>
  </p>

  <?php endif; ?>
<?php endif; ?>