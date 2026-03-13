<h1>Évaluer le projet</h1>

<?php if (empty($project)): ?>

<p>Projet introuvable.</p>

<?php else: ?>

<form method="POST" action="/projex/public/projects/evaluate">

<input type="hidden" name="project_id" value="<?= (int)$project["id"] ?>">
<input type="hidden" name="student_id" value="<?= (int)$student_id ?>">

<label>Note (/20)</label><br>
<input type="number" name="note" min="0" max="20" step="0.01" required>

<br><br>

<label>Commentaire</label><br>
<textarea name="commentaire" rows="5"></textarea>

<br><br>

<button type="submit">Enregistrer l'évaluation</button>

</form>

<?php endif; ?>