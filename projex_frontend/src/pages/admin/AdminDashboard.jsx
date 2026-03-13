import { useState, useEffect, useCallback } from "react";
import adminService from "../../services/adminService";
import DashboardLayout from "../../components/layout/AdminLayout";

export default function AdminDashboard() {

  const [pendingUsers, setPendingUsers] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedUsers, setSelectedUsers] = useState({});
  const [showCreateProject, setShowCreateProject] = useState(false);

  const [projectForm, setProjectForm] = useState({
    titre: "",
    description: "",
    date_debut: "",
    date_fin: ""
  });

  // ===============================
  // Charger les données
  // ===============================

  const loadData = useCallback(async () => {

    setLoading(true);
    setError("");

    try {

      const [usersRes, projectsRes] = await Promise.all([
        adminService.getPendingUsers(),
        adminService.getProjects()
      ]);

      setPendingUsers(usersRes.users || []);
      setProjects(projectsRes.projects || []);

    } catch (err) {

      setError(
        err.response?.data?.error ||
        "Impossible de charger les données"
      );

    } finally {
      setLoading(false);
    }

  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ===============================
  // Activation utilisateur
  // ===============================

  const handleActivateUser = async (userId, roleRequested) => {

    const finalRole = selectedUsers[userId] || roleRequested;

    try {

      await adminService.activateUser(userId, finalRole);

      setPendingUsers(prev =>
        prev.filter(user => user.id !== userId)
      );

      setSuccess("Utilisateur activé avec succès");

    } catch (err) {

      setError(
        err.response?.data?.error ||
        "Erreur lors de l'activation"
      );

    }

  };

  // ===============================
  // Création projet
  // ===============================

  const handleCreateProject = async (e) => {

    e.preventDefault();

    if (!projectForm.titre.trim()) {
      setError("Le titre du projet est obligatoire");
      return;
    }

    try {

      await adminService.createProject(projectForm);

      setProjectForm({
        titre: "",
        description: "",
        date_debut: "",
        date_fin: ""
      });

      setShowCreateProject(false);

      setSuccess("Projet créé avec succès");

      loadData();

    } catch (err) {

      setError(
        err.response?.data?.error ||
        "Erreur lors de la création du projet"
      );

    }

  };

  // ===============================
  // Gestion formulaire projet
  // ===============================

  const handleProjectChange = (e) => {

    const { name, value } = e.target;

    setProjectForm(prev => ({
      ...prev,
      [name]: value
    }));

  };

  // ===============================
  // Loader
  // ===============================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (

    <DashboardLayout>

      <div className="space-y-10">

        {/* HEADER */}

        <header>

          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord Administrateur
          </h1>

          <p className="text-gray-600">
            Gestion des utilisateurs et des projets
          </p>

        </header>

        {/* ALERTES */}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* ================= USERS ================= */}

        <section>

          <div className="flex justify-between items-center mb-4">

            <h2 className="text-xl font-bold">
              Utilisateurs en attente
            </h2>

            <span className="bg-blue-600 text-white px-3 py-1 rounded">
              {pendingUsers.length}
            </span>

          </div>

          {pendingUsers.length === 0 ? (

            <div className="bg-white p-6 rounded shadow text-center">
              Aucun utilisateur en attente
            </div>

          ) : (

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

              {pendingUsers.map(user => (

                <div
                  key={user.id}
                  className="bg-white shadow rounded p-5"
                >

                  <h3 className="font-semibold text-lg">
                    {user.prenom} {user.nom}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {user.email}
                  </p>

                  <p className="text-sm mt-2">
                    Demande : <strong>{user.role_demande}</strong>
                  </p>

                  <div className="flex gap-2 mt-4">

                    <select
                      value={selectedUsers[user.id] || user.role_demande}
                      onChange={(e) =>
                        setSelectedUsers(prev => ({
                          ...prev,
                          [user.id]: e.target.value
                        }))
                      }
                      className="border px-2 py-1 rounded"
                    >

                      <option value="ETUDIANT">Étudiant</option>
                      <option value="ENCADREUR_ACAD">Encadreur Acad</option>
                      <option value="ENCADREUR_PRO">Encadreur Pro</option>
                      <option value="ADMIN">Admin</option>

                    </select>

                    <button
                      onClick={() =>
                        handleActivateUser(user.id, user.role_demande)
                      }
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Activer
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* ================= PROJECTS ================= */}

        <section>

          <div className="flex justify-between items-center mb-4">

            <h2 className="text-xl font-bold">
              Projets
            </h2>

            <button
              onClick={() =>
                setShowCreateProject(!showCreateProject)
              }
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              + Nouveau projet
            </button>

          </div>

          {/* FORMULAIRE */}

          {showCreateProject && (

            <form
              onSubmit={handleCreateProject}
              className="bg-white p-6 rounded shadow mb-6 space-y-4"
            >

              <input
                type="text"
                name="titre"
                placeholder="Titre"
                value={projectForm.titre}
                onChange={handleProjectChange}
                className="w-full border px-3 py-2 rounded"
                required
              />

              <textarea
                name="description"
                placeholder="Description"
                value={projectForm.description}
                onChange={handleProjectChange}
                className="w-full border px-3 py-2 rounded"
              />

              <div className="grid grid-cols-2 gap-4">

                <input
                  type="date"
                  name="date_debut"
                  value={projectForm.date_debut}
                  onChange={handleProjectChange}
                  className="border px-3 py-2 rounded"
                />

                <input
                  type="date"
                  name="date_fin"
                  value={projectForm.date_fin}
                  onChange={handleProjectChange}
                  className="border px-3 py-2 rounded"
                />

              </div>

              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded"
              >
                Créer
              </button>

            </form>

          )}

          {/* LISTE PROJETS */}

          {projects.length === 0 ? (

            <div className="bg-white p-6 rounded shadow text-center">
              Aucun projet disponible
            </div>

          ) : (

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

              {projects.map(project => (

                <div
                  key={project.id}
                  className="bg-white shadow rounded p-5"
                >

                  <h3 className="font-bold text-lg">
                    {project.titre}
                  </h3>

                  <p className="text-gray-600 text-sm">
                    {project.description || "Pas de description"}
                  </p>

                  <div className="flex gap-2 mt-4">

                    <button className="bg-blue-500 text-white px-3 py-1 rounded">
                      Assigner
                    </button>

                    <button className="bg-orange-500 text-white px-3 py-1 rounded">
                      Modifier
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </div>

    </DashboardLayout>

  );

}