<h1>Validation des comptes</h1>

<?php if (empty($users)): ?>
  <p>Aucun compte en attente </p>
<?php else: ?>
  <table border="1" cellpadding="8" cellspacing="0">
    <thead>
      <tr>
        <th>ID</th>
        <th>Nom</th>
        <th>Email</th>
        <th>Rôle demandé</th>
        <th>Infos</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($users as $u): ?>
        <tr>
          <td><?= (int)$u["id"] ?></td>
          <td><?= htmlspecialchars(($u["prenom"] ?? "")." ".($u["nom"] ?? "")) ?></td>
          <td><?= htmlspecialchars($u["email"] ?? "") ?></td>
          <td><?= htmlspecialchars($u["role_demande"] ?? "") ?></td>
          <td>
            <?php if (($u["role_demande"] ?? "") === "ETUDIANT"): ?>
              Matricule: <?= htmlspecialchars($u["matricule"] ?? "") ?><br>
              Filière: <?= htmlspecialchars($u["filiere"] ?? "") ?><br>
              Niveau: <?= htmlspecialchars($u["niveau"] ?? "") ?>
            <?php elseif (($u["role_demande"] ?? "") === "ENCADREUR_PRO"): ?>
              Entreprise: <?= htmlspecialchars($u["entreprise"] ?? "") ?><br>
              Poste: <?= htmlspecialchars($u["poste"] ?? "") ?>
            <?php else: ?>
              Département: <?= htmlspecialchars($u["departement"] ?? "") ?><br>
              Grade: <?= htmlspecialchars($u["grade"] ?? "") ?>
            <?php endif; ?>
          </td>
          <td>
            <form method="POST" action="/projex/public/admin/users/activate">
              <input type="hidden" name="id" value="<?= (int)$u["id"] ?>">

              <select name="role" required>
                <option value="">-- rôle final --</option>
                <option value="ETUDIANT">ETUDIANT</option>
                <option value="ENCADREUR_ACAD">ENCADREUR_ACAD</option>
                <option value="ENCADREUR_PRO">ENCADREUR_PRO</option>
              </select>

              <button type="submit">Activer</button>
            </form>
          </td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
<?php endif; ?>