<h1>Mes tâches</h1>

<?php if (empty($tasks)): ?>
  <p>Aucune tâche ne vous a été attribuée.</p>
<?php else: ?>
  <table border="1" cellpadding="8" cellspacing="0">
    <thead>
      <tr>
        <th>ID</th>
        <th>Titre</th>
        <th>Description</th>
        <th>Date limite</th>
        <th>Statut</th>
        <th>Changer le statut</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($tasks as $t): ?>
        <tr>
          <td><?= (int)$t["id"] ?></td>
          <td><?= htmlspecialchars($t["titre"]) ?></td>
          <td><?= htmlspecialchars((string)$t["description"]) ?></td>
          <td><?= htmlspecialchars((string)$t["due_date"]) ?></td>
          <td><?= htmlspecialchars($t["statut"]) ?></td>
          <td>
            <form method="POST" action="/projex/public/tasks/status">
              <input type="hidden" name="task_id" value="<?= (int)$t["id"] ?>">

              <select name="statut" required>
                <option value="A_FAIRE" <?= $t["statut"] === "A_FAIRE" ? "selected" : "" ?>>A faire</option>
                <option value="EN_COURS" <?= $t["statut"] === "EN_COURS" ? "selected" : "" ?>>En cours</option>
                <option value="TERMINE" <?= $t["statut"] === "TERMINE" ? "selected" : "" ?>>Terminé</option>
                <option value="BLOQUE" <?= $t["statut"] === "BLOQUE" ? "selected" : "" ?>>Bloqué</option>
              </select>

              <button type="submit">Mettre à jour</button>
            </form>
          </td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
<?php endif; ?>