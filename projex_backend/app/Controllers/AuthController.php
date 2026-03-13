<?php
declare(strict_types=1);

require_once __DIR__ . "/../Models/User.php";

final class AuthController
{
  public static function login(PDO $pdo): void
  {
    // Indiquer qu'on renvoie du JSON
    header("Content-Type: application/json");
    
    // Lire le corps de la requête JSON (depuis React/Axios)
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true) ?? $_POST; // Fallback sur $_POST si non-JSON

    $email = strtolower(trim($input["email"] ?? ""));
    $password = $input["password"] ?? "";

    // DEBUG: Log temporaire
    error_log("DEBUG AuthController::login - Email: '$email', Password length: " . strlen($password));

    if ($email === "" || $password === "") {
      http_response_code(400);
      echo json_encode(["error" => "Tous les champs sont obligatoires"]);
      return;
    }

    $user = User::findByEmail($pdo, $email);

    if (!$user || !password_verify($password, $user["mot_de_passe"])) {
      http_response_code(401);
      echo json_encode(["error" => "Identifiants invalides"]);
      return;
    }

    if ((int)$user["actif"] !== 1) {
      http_response_code(403);
      echo json_encode(["error" => "Compte non activé par l’admin"]);
      return;
    }

    // Supprimer mot de passe avant session/retour
    unset($user["mot_de_passe"]);

    // Stocker l'utilisateur en session
    $_SESSION["user"] = $user;
    if (isset($user["id"])) {
      $_SESSION["user_id"] = (int)$user["id"];
    }

    // Renvoyer succès et les infos user
    echo json_encode([
        "message" => "Connexion réussie",
        "user" => $user
    ]);
  }

  // Traiter l'inscription via JSON
  public static function register(PDO $pdo): void
  {
    header("Content-Type: application/json");
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true) ?? $_POST;

    $nom = trim($input["nom"] ?? "");
    $prenom = trim($input["prenom"] ?? "");
    $email = strtolower(trim($input["email"] ?? ""));
    $telephone = trim($input["telephone"] ?? "");

    $role_demande = trim($input["role_demande"] ?? "ETUDIANT");

    // Champs étudiant
    $matricule = trim($input["matricule"] ?? "");
    $filiere = trim($input["filiere"] ?? "");
    $niveau = trim($input["niveau"] ?? "");

    // Champs encadreur pro
    $entreprise = trim($input["entreprise"] ?? "");
    $poste = trim($input["poste"] ?? "");

    // Champs encadreur acad
    $departement = trim($input["departement"] ?? "");
    $grade = trim($input["grade"] ?? "");

    $password = $input["password"] ?? "";
    $password2 = $input["password2"] ?? "";

    // 1) Validation commune
    if ($nom==="" || $prenom==="" || $email==="" || $password==="" || $password2==="") {
      http_response_code(400);
      echo json_encode(["error" => "Nom, prénom, email et mot de passe sont obligatoires."]);
      return;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      http_response_code(400);
      echo json_encode(["error" => "Email invalide."]);
      return;
    }

    if (strlen($password) < 6) {
      http_response_code(400);
      echo json_encode(["error" => "Mot de passe : 6 caractères minimum."]);
      return;
    }

    if ($password !== $password2) {
      http_response_code(400);
      echo json_encode(["error" => "Les mots de passe ne correspondent pas."]);
      return;
    }

    // 2) Validation rôle demandé
    $allowed = ["ETUDIANT","ENCADREUR_ACAD","ENCADREUR_PRO"];
    if (!in_array($role_demande, $allowed, true)) {
      http_response_code(400);
      echo json_encode(["error" => "Rôle demandé invalide."]);
      return;
    }

    // 3) Vérifier email déjà utilisé
    if (User::findByEmail($pdo, $email)) {
      http_response_code(409); // Conflict
      echo json_encode(["error" => "Cet email est déjà utilisé."]);
      return;
    }

    // 4) Validation spécifique selon rôle
    if ($role_demande === "ETUDIANT") {
      if ($matricule==="" || $filiere==="" || $niveau==="") {
        http_response_code(400);
        echo json_encode(["error" => "Matricule, filière et niveau sont obligatoires pour un étudiant."]);
        return;
      }
      if (!in_array($niveau, ["BTS1","BTS2"], true)) {
        http_response_code(400);
        echo json_encode(["error" => "Niveau invalide."]);
        return;
      }
      if (User::findByMatricule($pdo, $matricule)) {
        http_response_code(409);
        echo json_encode(["error" => "Ce matricule est déjà utilisé."]);
        return;
      }
    }

    if ($role_demande === "ENCADREUR_ACAD") {
      if ($departement === "") {
        http_response_code(400);
        echo json_encode(["error" => "Le département est obligatoire pour un encadreur académique."]);
        return;
      }
      $matricule = $filiere = $niveau = "";
      $entreprise = $poste = "";
    }

    if ($role_demande === "ENCADREUR_PRO") {
      if ($entreprise === "") {
        http_response_code(400);
        echo json_encode(["error" => "L’entreprise est obligatoire pour un encadreur professionnel."]);
        return;
      }
      $matricule = $filiere = $niveau = "";
      $departement = $grade = "";
    }

    // 5) Hash mot de passe
    $hash = password_hash($password, PASSWORD_DEFAULT);

    // 6) Insertion en base (actif=0)
    User::createPending($pdo, [
      "nom" => $nom,
      "prenom" => $prenom,
      "email" => $email,
      "telephone" => ($telephone !== "" ? $telephone : null),
      "role_initial" => $role_demande,
      "role_demande" => $role_demande,
      "matricule" => ($matricule !== "" ? $matricule : null),
      "filiere" => ($filiere !== "" ? $filiere : null),
      "niveau" => ($niveau !== "" ? $niveau : null),
      "entreprise" => ($entreprise !== "" ? $entreprise : null),
      "poste" => ($poste !== "" ? $poste : null),
      "departement" => ($departement !== "" ? $departement : null),
      "grade" => ($grade !== "" ? $grade : null),
      "mot_de_passe" => $hash,
    ]);

    // 7) Message succès
    http_response_code(201); // Created
    echo json_encode(["message" => "Compte créé ✅. En attente de validation par l’administrateur."]);
  }

  public static function logout(): void
  {
    header("Content-Type: application/json");
    $_SESSION = [];
    if (ini_get("session.use_cookies")) {
      $params = session_get_cookie_params();
      setcookie(session_name(), '', time() - 42000,
        $params['path'], $params['domain'], $params['secure'], $params['httponly']
      );
    }
    session_destroy();
    
    echo json_encode(["message" => "Déconnexion réussie"]);
  }

  // Renvoie l'utilisateur actuellement connecté
  public static function me(): void 
  {
    header("Content-Type: application/json");
    if (isset($_SESSION["user"])) {
        echo json_encode(["user" => $_SESSION["user"]]);
    } else {
        http_response_code(401);
        echo json_encode(["error" => "Non authentifié"]);
    }
  }

}

