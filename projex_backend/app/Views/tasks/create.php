<h1>Créer une tâche</h1>

<?php if (empty($project)): ?>
  <p>Projet introuvable.</p>
<?php else: ?>
  <p><strong>Projet :</strong> <?= htmlspecialchars($project["titre"]) ?></p>

  <form method="POST" action="/projex/public/tasks/create">
    <input type="hidden" name="project_id" value="<?= (int)$project["id"] ?>">

    <label>Étudiant concerné</label><br>
    <?php if (empty($student)): ?>
      <p style="color:red">Aucun étudiant n'est affecté à ce projet.</p>
    <?php else: ?>
      <select name="assigned_to" required>
        <option value="<?= (int)$student["id"] ?>">
          <?= htmlspecialchars($student["prenom"] . " " . $student["nom"]) ?>
        </option>
      </select>
    <?php endif; ?>
    <br><br>

    <label>Titre</label><br>
    <input type="text" name="titre" required><br><br>

    <label>Description</label><br>
    <textarea name="description"></textarea><br><br>

    <label>Date limite</label><br>
    <input type="date" name="due_date"><br><br>

    <button type="submit" <?= empty($student) ? "disabled" : "" ?>>
      Créer la tâche
    </button>
  </form>
<?php endif; ?>