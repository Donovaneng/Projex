import { useState, useEffect, useCallback } from "react";
import adminService from "../../services/adminService";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import { Users, AlertCircle, CheckCircle2, UserCheck, Trash2, Key } from "lucide-react";
import { formatFileUrl } from "../../utils/file";

export default function UsersManagement() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedUsers, setSelectedUsers] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" or "edit"
  const [editingUser, setEditingUser] = useState(null);
  
  // Nouveaux états pour la recherche
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    role: "ETUDIANT",
    actif: 1,
    matricule: "",
    filiere: "",
    niveau: "BTS1",
    entreprise: "",
    poste: "",
    departement: "",
    grade: ""
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [usersRes, allUsersRes] = await Promise.all([
        adminService.getPendingUsers(),
        adminService.searchUsers({ 
          q: searchQuery, 
          role: roleFilter, 
          actif: statusFilter !== "" ? statusFilter : undefined 
        })
      ]);
      setPendingUsers(usersRes.users || []);
      setAllUsers(allUsersRes.users || []);
    } catch (err) {
      setError(err.response?.data?.error || "Impossible de charger les utilisateurs");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, roleFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 500);
    return () => clearTimeout(timer);
  }, [loadData, searchQuery, roleFilter, statusFilter]);

  const handleActivateUser = async (userId, roleRequested) => {
    const finalRole = selectedUsers[userId] || roleRequested;
    try {
      await adminService.activateUser(userId, finalRole);
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      setSuccess("Utilisateur activé avec succès");
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'activation");
    }
  };

  const handleResetPassword = async (userId, userName) => {
    const newPassword = window.prompt(`Entrez le nouveau mot de passe pour ${userName} :`, "Reset123!");
    if (!newPassword) return;

    try {
      await adminService.resetPassword(userId, newPassword);
      setSuccess(`Mot de passe réinitialisé pour ${userName}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.error || "Erreur lors de la réinitialisation");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur "${userName}" ? Cette action est irréversible.`)) {
      return;
    }
    try {
      await adminService.deleteUser(userId);
      setAllUsers(prev => prev.filter(user => user.id !== userId));
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      setSuccess("Utilisateur supprimé avec succès");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la suppression");
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setEditingUser(null);
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      role: "ETUDIANT",
      actif: 1,
      matricule: "",
      filiere: "",
      niveau: "BTS1",
      entreprise: "",
      poste: "",
      departement: "",
      grade: ""
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (user) => {
    setModalMode("edit");
    setEditingUser(user);
    setFormData({
      nom: user.nom || "",
      prenom: user.prenom || "",
      email: user.email || "",
      telephone: user.telephone || "",
      role: user.role || "ETUDIANT",
      actif: Number(user.actif),
      matricule: user.matricule || "",
      filiere: user.filiere || "",
      niveau: user.niveau || "BTS1",
      entreprise: user.entreprise || "",
      poste: user.poste || "",
      departement: user.departement || "",
      grade: user.grade || ""
    });
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (modalMode === "create") {
        await adminService.createUser(formData);
        setSuccess("Utilisateur créé avec succès");
      } else {
        await adminService.updateUser(editingUser.id, formData);
        setSuccess("Utilisateur mis à jour avec succès");
      }
      setShowModal(false);
      loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.error || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (loading && searchQuery === "" && roleFilter === "" && statusFilter === "") {
    return (
      <DashboardLayout pageTitle="Gestion des Utilisateurs">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader size="lg" text="Chargement des utilisateurs..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Gestion des Utilisateurs">
      <div className="space-y-8 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0B1C3F]">Gestion des Utilisateurs</h1>
            <p className="text-slate-500 mt-2">Validez les inscriptions et gérez tous les membres de la plateforme.</p>
          </div>
          <Button icon={Users} onClick={handleOpenCreateModal} className="w-full md:w-auto">
            Ajouter un utilisateur
          </Button>
        </header>

        <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Input 
              label="Rechercher" 
              placeholder="Nom, email, matricule..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-slate-700 mb-1">Rôle</label>
            <Input.Select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: "", label: "Tous les rôles" },
                { value: "ETUDIANT", label: "Étudiant" },
                { value: "ENCADREUR_ACAD", label: "Encadreur Académique" },
                { value: "ENCADREUR_PRO", label: "Encadreur Professionnel" },
                { value: "ADMIN", label: "Administrateur" }
              ]}
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
            <Input.Select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "", label: "Tous les statuts" },
                { value: "1", label: "Actif" },
                { value: "0", label: "Inactif" }
              ]}
            />
          </div>
        </section>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm leading-6">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700 shadow-sm">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm leading-6">{success}</p>
          </div>
        )}

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-[#0B1C3F]">
              <Users className="h-6 w-6 text-[#1E4AA8]" />
              Inscriptions en attente de validation
            </h2>
            <span className="bg-[#1E4AA8]/10 text-[#1E4AA8] px-3 py-1 rounded-full text-sm font-semibold">
              {pendingUsers.length}
            </span>
          </div>

          {pendingUsers.length === 0 ? (
            <Card padding="xl" className="text-center border-dashed border-2 border-slate-200 shadow-none">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Aucune demande d'inscription en attente.</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingUsers.map(user => (
                <Card key={user.id} hover="scale" className="border-t-4 border-t-[#1E4AA8]">
                  <Card.Content className="p-1">
                    <h3 className="font-bold text-lg text-[#0B1C3F]">
                      {user.prenom} {user.nom}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">{user.email}</p>
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Rôle demandé :</p>
                      <p className="text-sm font-semibold text-[#1E4AA8]">{user.role_demande?.replace('_', ' ')}</p>
                    </div>

                    <div className="flex flex-col gap-3 mt-5">
                      <Input.Select
                        options={[
                          { value: "ETUDIANT", label: "Étudiant" },
                          { value: "ENCADREUR_ACAD", label: "Encadreur Académique" },
                          { value: "ENCADREUR_PRO", label: "Encadreur Professionnel" },
                          { value: "ADMIN", label: "Administrateur" }
                        ]}
                        value={selectedUsers[user.id] || user.role_demande}
                        onChange={(e) => setSelectedUsers(prev => ({ ...prev, [user.id]: e.target.value }))}
                        className="h-10 text-sm"
                      />
                      <Button icon={UserCheck} onClick={() => handleActivateUser(user.id, user.role_demande)} className="w-full">
                        Valider l'accès
                      </Button>
                    </div>
                  </Card.Content>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-[#0B1C3F]">
              <Users className="h-6 w-6 text-slate-400" />
              Tous les Utilisateurs
            </h2>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-semibold">
              {allUsers.length}
            </span>
          </div>

          <Card className="overflow-hidden border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Nom Complet</th>
                    <th className="px-6 py-4">Email / Tél</th>
                    <th className="px-6 py-4">Détails</th>
                    <th className="px-6 py-4">Rôle</th>
                    <th className="px-6 py-4 text-center">Statut</th>
                    <th className="px-6 py-4 text-center">Inscrit le</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                        Aucun utilisateur trouvé.
                      </td>
                    </tr>
                  ) : (
                    allUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-[#0B1C3F]">
                          <div className="flex items-center gap-3">
                            {u.image_profil ? (
                              <img src={formatFileUrl(u.image_profil)} className="w-8 h-8 rounded-full object-cover border" alt="" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                {u.prenom?.[0]}{u.nom?.[0]}
                              </div>
                            )}
                            {u.prenom} {u.nom}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-600 font-medium">{u.email}</div>
                          {u.telephone && <div className="text-[10px] text-slate-400 font-bold">{u.telephone}</div>}
                        </td>
                        <td className="px-6 py-4">
                          {u.role === 'ETUDIANT' && (
                            <div>
                              <div className="text-xs font-bold text-[#1E4AA8]">{u.matricule || 'Sans matricule'}</div>
                              <div className="text-[10px] text-slate-500">{u.filiere} ({u.niveau})</div>
                            </div>
                          )}
                          {u.role === 'ENCADREUR_PRO' && (
                            <div>
                              <div className="text-xs font-bold text-purple-700">{u.entreprise}</div>
                              <div className="text-[10px] text-slate-500">{u.poste}</div>
                            </div>
                          )}
                          {(u.role === 'ENCADREUR_ACAD' || u.role === 'ADMIN') && (
                            <div>
                              <div className="text-xs font-bold text-slate-700">{u.departement || '-'}</div>
                              <div className="text-[10px] text-slate-500">{u.grade}</div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                            {u.role ? u.role.replace('_', ' ') : 'EN ATTENTE'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {Number(u.actif) === 1 ? (
                            <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Actif
                            </span>
                          ) : (
                            <span className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Inactif
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-500">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleResetPassword(u.id, u.nom)}
                              className="p-2 text-slate-400 hover:text-orange-600 transition-colors rounded-lg hover:bg-orange-50"
                              title="Réinitialiser le mot de passe"
                            >
                              <Key className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleOpenEditModal(u)}
                              className="p-2 text-slate-400 hover:text-[#1E4AA8] transition-colors rounded-lg hover:bg-[#1E4AA8]/5"
                              title="Modifier l'utilisateur"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(u.id, u.nom)}
                              className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                              title="Supprimer l'utilisateur"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </div>

      {/* Modal de création/édition */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0B1C3F]/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <Card className="relative z-10 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <Card.Header>
              <h3 className="text-xl font-bold text-[#0B1C3F]">
                {modalMode === "create" ? "Ajouter un utilisateur" : "Modifier l'utilisateur"}
              </h3>
            </Card.Header>
            <form onSubmit={handleModalSubmit}>
              <Card.Content className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Prénom"
                    value={formData.prenom}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    required
                  />
                  <Input
                    label="Nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    required
                  />
                </div>
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
                <Input
                  label="Téléphone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rôle</label>
                    <Input.Select
                      options={[
                        { value: "ETUDIANT", label: "Étudiant" },
                        { value: "ENCADREUR_ACAD", label: "Encadreur Académique" },
                        { value: "ENCADREUR_PRO", label: "Encadreur Professionnel" },
                        { value: "ADMIN", label: "Administrateur" }
                      ]}
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
                    <Input.Select
                      options={[
                        { value: 1, label: "Actif" },
                        { value: 0, label: "Inactif" }
                      ]}
                      value={formData.actif}
                      onChange={(e) => setFormData({...formData, actif: e.target.value})}
                    />
                  </div>
                </div>

                {/* Champs Dynamiques selon le Rôle */}
                {formData.role === "ETUDIANT" && (
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest">Informations Académiques</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Matricule"
                        value={formData.matricule}
                        onChange={(e) => setFormData({...formData, matricule: e.target.value})}
                        required
                        placeholder="ex: 24X001"
                      />
                      <Input
                        label="Filière"
                        value={formData.filiere}
                        onChange={(e) => setFormData({...formData, filiere: e.target.value})}
                        required
                        placeholder="ex: Génie Logiciel"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Niveau</label>
                      <Input.Select
                        options={[
                          { value: "BTS1", label: "BTS 1" },
                          { value: "BTS2", label: "BTS 2" },
                          { value: "LICENCE", label: "Licence" },
                          { value: "MASTER", label: "Master" }
                        ]}
                        value={formData.niveau}
                        onChange={(e) => setFormData({...formData, niveau: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                {formData.role === "ENCADREUR_PRO" && (
                  <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 space-y-4">
                    <h4 className="text-xs font-bold text-purple-800 uppercase tracking-widest">Informations Professionnelles</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Entreprise"
                        value={formData.entreprise}
                        onChange={(e) => setFormData({...formData, entreprise: e.target.value})}
                        required
                      />
                      <Input
                        label="Poste"
                        value={formData.poste}
                        onChange={(e) => setFormData({...formData, poste: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                {(formData.role === "ENCADREUR_ACAD" || formData.role === "ADMIN") && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Détails Administratifs</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Département"
                        value={formData.departement}
                        onChange={(e) => setFormData({...formData, departement: e.target.value})}
                      />
                      <Input
                        label="Grade"
                        value={formData.grade}
                        onChange={(e) => setFormData({...formData, grade: e.target.value})}
                      />
                    </div>
                  </div>
                )}
                {modalMode === "create" && (
                  <p className="text-xs text-slate-500 italic">
                    Note: Un mot de passe par défaut (Password123!) sera généré. L'utilisateur pourra le changer plus tard.
                  </p>
                )}
              </Card.Content>
              <Card.Footer className="flex justify-end gap-3 bg-slate-50">
                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Annuler</Button>
                <Button type="submit" loading={loading}>
                  {modalMode === "create" ? "Créer" : "Enregistrer"}
                </Button>
              </Card.Footer>
            </form>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
