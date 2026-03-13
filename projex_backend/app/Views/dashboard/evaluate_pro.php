<h1>Évaluation professionnelle</h1>

<form method="POST" action="/projex/public/projects/evaluate_pro">

<input type="hidden" name="project_id" value="<?= (int)$project["id"] ?>">
<input type="hidden" name="student_id" value="<?= (int)$student_id ?>">

<h3>Compétences</h3>

<?php foreach ($competences as $c): ?>

<p>

<strong><?= htmlspecialchars($c["libelle"]) ?></strong>

<select name="score[<?= (int)$c["id"] ?>]">

<option value="0">0</option>
<option value="1">1</option>
<option value="2">2</option>
<option value="3">3</option>
<option value="4">4</option>
<option value="5">5</option>

</select>

</p>

<?php endforeach; ?>

<label>Commentaire global</label>

<textarea name="commentaire" rows="5"></textarea>

<br><br>

<button type="submit">Enregistrer l'évaluation</button>

</form>