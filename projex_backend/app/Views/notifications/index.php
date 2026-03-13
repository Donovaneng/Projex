<h1>Mes notifications</h1>

<?php if (empty($items)): ?>
  <p>Aucune notification.</p>
<?php else: ?>
  <table border="1" cellpadding="8" cellspacing="0">
    <thead>
      <tr>
        <th>Titre</th>
        <th>Message</th>
        <th>État</th>
        <th>Date</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($items as $n): ?>
        <tr>
          <td>
            <a href="/projex/public/notifications/open?id=<?= (int)$n["id"] ?>">
              <?= htmlspecialchars($n["titre"]) ?>
            </a>
          </td>
          <td><?= htmlspecialchars($n["message"]) ?></td>
          <td><?= (int)$n["is_read"] === 1 ? "Lu" : "Non lu" ?></td>
          <td><?= htmlspecialchars((string)$n["created_at"]) ?></td>
          <td>
            <?php if ((int)$n["is_read"] === 0): ?>
              <form method="POST" action="/projex/public/notifications/read">
                <input type="hidden" name="id" value="<?= (int)$n["id"] ?>">
                <button type="submit">Marquer comme lu</button>
              </form>
            <?php else: ?>
              —
            <?php endif; ?>
          </td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
<?php endif; ?> 