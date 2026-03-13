<h1>Inscription</h1>

<?php if (!empty($error)): ?>
  <p style="color:red"><?= htmlspecialchars($error) ?></p>
<?php endif; ?>

<?php if (!empty($success)): ?>
  <p style="color:green"><?= htmlspecialchars($success) ?></p>
<?php endif; ?>

<form method="POST" action="/projex/public/register">
  <!-- Champs communs -->
  <input name="nom" placeholder="Nom" required><br><br>
  <input name="prenom" placeholder="Prénom" required><br><br>
  <input type="email" name="email" placeholder="Email" required><br><br>
  <input name="telephone" placeholder="Téléphone (optionnel)"><br><br>

  <!-- Rôle demandé (par défaut ETUDIANT) -->
  <label><strong>Rôle demandé</strong></label><br>
  <select name="role_demande" id="role_demande" required>
    <option value="ETUDIANT" selected>Étudiant</option>
    <option value="ENCADREUR_ACAD">Encadreur académique</option>
    <option value="ENCADREUR_PRO">Encadreur professionnel</option>
  </select>
  <br><br>

  <!-- Bloc ETUDIANT -->
  <div id="bloc_etudiant">
    <h3>Informations Étudiant</h3>
    <input name="matricule" placeholder="Matricule"><br><br>
    <input name="filiere" placeholder="Filière (ex: Génie Logiciel)"><br><br>

    <select name="niveau">
      <option value="">-- Niveau --</option>
      <option value="BTS1">BTS 1</option>
      <option value="BTS2">BTS 2</option>
    </select>
    <br><br>
  </div>

  <!-- Bloc ENCADREUR ACAD -->
  <div id="bloc_acad" style="display:none">
    <h3>Encadreur Académique</h3>
    <input name="departement" placeholder="Département / Filière encadrée"><br><br>
    <input name="grade" placeholder="Grade (optionnel)"><br><br>
  </div>

  <!-- Bloc ENCADREUR PRO -->
  <div id="bloc_pro" style="display:none">
    <h3>Encadreur Professionnel</h3>
    <input name="entreprise" placeholder="Entreprise"><br><br>
    <input name="poste" placeholder="Poste (optionnel)"><br><br>
  </div>

  <!-- Mot de passe -->
  <input type="password" name="password" placeholder="Mot de passe (6+)" required><br><br>
  <input type="password" name="password2" placeholder="Confirmer mot de passe" required><br><br>

  <button type="submit">Créer mon compte</button>
</form>

<p>Déjà un compte ? <a href="/projex/public/login">Se connecter</a></p>

<script>
  const select = document.getElementById("role_demande");
  const etudiant = document.getElementById("bloc_etudiant");
  const acad = document.getElementById("bloc_acad");
  const pro = document.getElementById("bloc_pro");

  function afficher(role) {
    etudiant.style.display = (role === "ETUDIANT") ? "block" : "none";
    acad.style.display = (role === "ENCADREUR_ACAD") ? "block" : "none";
    pro.style.display = (role === "ENCADREUR_PRO") ? "block" : "none";
  }

  // par défaut
  afficher(select.value);

  // au changement
  select.addEventListener("change", () => afficher(select.value));
</script>