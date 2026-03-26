import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import adminService from '../../services/adminService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { FolderKanban, Plus, AlertTriangle, Users, Link as LinkIcon, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';


export default function AdminProjectsManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  
  const [allUsers, setAllUsers] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const [newProject, setNewProject] = useState({
    titre: '',
    description: '',
    date_fin: '',
    categorie_id: ''
  });
  
  const [categories, setCategories] = useState([]);
  
  const [assignmentData, setAssignmentData] = useState({
    user_ids: []
  });

  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingProject, setEditingProject] = useState(null);

  // Nouveaux états de recherche
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const [projectsRes, usersRes, catRes] = await Promise.all([
        adminService.searchProjects({ q: searchQuery, statut: statusFilter }),
        adminService.getAllUsers(),
        adminService.getCategories().catch(() => ({ categories: [] }))
      ]);
      
      setProjects(projectsRes.projects || projectsRes || []);
      setAllUsers(usersRes.users || []);
      setCategories(catRes.categories || []);
    } catch {
      setError('Impossible de charger les données.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 500);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleCreateOrUpdateProject = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (modalMode === 'create') {
        await adminService.createProject(newProject);
        alert('Projet créé avec succès !');
      } else {
        await adminService.updateProject(editingProject.id, newProject);
        alert('Projet mis à jour avec succès !');
      }
      setIsCreateModalOpen(false);
      setNewProject({ titre: '', description: '', date_fin: '', categorie_id: '' });
      loadData();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'enregistrement du projet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectProposal = async (projectId) => {
    const motif = window.prompt("Veuillez saisir le motif du rejet :");
    if (motif === null) return; // Annulé
    
    try {
      await adminService.rejectProposal(projectId, motif || "Refusé par l'administration");
      loadData();
      alert('Proposition rejetée.');
    } catch (err) {
      console.error(err);
      alert('Erreur lors du rejet.');
    }
  };

  const handleCloseProject = async (projectId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir clôturer ce projet ?")) return;
    try {
      await adminService.closeProject(projectId);
      loadData();
      alert('Projet clôturé.');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la clôture.');
    }
  };

  const handleDeleteProject = async (projectId, titre) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le projet "${titre}" ?`)) return;
    try {
      await adminService.deleteProject(projectId);
      loadData();
      alert('Projet supprimé.');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression.');
    }
  };

  const handleApproveProposal = async (projectId) => {
    try {
      await adminService.approveProposal(projectId);
      loadData();
      alert('Proposition validée !');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la validation.');
    }
  };

  const openEditModal = (project) => {
    setModalMode('edit');
    setEditingProject(project);
    setNewProject({
      titre: project.titre || '',
      description: project.description || '',
      date_fin: project.date_fin ? project.date_fin.substring(0, 10) : '',
      categorie_id: project.categorie_id || ''
    });
    setIsCreateModalOpen(true);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingProject(null);
    setNewProject({ titre: '', description: '', date_fin: '', categorie_id: '' });
    setIsCreateModalOpen(true);
  };

  const handleAssignProject = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await adminService.assignProject(selectedProjectId, assignmentData.user_ids);
      setIsAssignModalOpen(false);
      setSelectedProjectId(null);
      setAssignmentData({ user_ids: [] });
      loadData();
      alert('Projet assigné avec succès !');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'assignation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAssignModal = (project) => {
    setSelectedProjectId(project.id);
    
    // Pré-charger les utilisateurs déjà assignés
    const assignedIds = [];
    if (project.student_id) assignedIds.push(parseInt(project.student_id));
    if (project.encadreur_acad_id) assignedIds.push(parseInt(project.encadreur_acad_id));
    if (project.encadreur_pro_id) assignedIds.push(parseInt(project.encadreur_pro_id));
    
    setAssignmentData({ user_ids: assignedIds });
    setIsAssignModalOpen(true);
  };

  const toggleUserSelection = (userId) => {
    setAssignmentData(prev => {
      const isSelected = prev.user_ids.includes(userId);
      if (isSelected) {
        return { user_ids: prev.user_ids.filter(id => id !== userId) };
      } else {
        return { user_ids: [...prev.user_ids, userId] };
      }
    });
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Gestion des Projets">
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader size="lg" text="Chargement des projets..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Gestion des Projets">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0B1C3F] flex items-center gap-3">
              <FolderKanban className="h-8 w-8 text-[#1E4AA8]" />
              Gestion des Projets
            </h1>
            <p className="text-slate-500 mt-2">
              Créez, gérez et assignez des projets aux étudiants et encadreurs.
            </p>
          </div>
          
          <Button 
            className="bg-[#1E4AA8] hover:bg-[#153476]" 
            icon={Plus}
            onClick={openCreateModal}
          >
            Nouveau Projet
          </Button>
        </header>

        <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Input 
              label="Rechercher" 
              placeholder="Titre, description..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
            <Input.Select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "", label: "Tous les statuts" },
                { value: "EN_ATTENTE", label: "En attente" },
                { value: "EN_COURS", label: "En cours" },
                { value: "TERMINE", label: "Terminé" },
                { value: "CLOTURE", label: "Clôturé" },
                { value: "REJETE", label: "Rejeté" }
              ]}
            />
          </div>
        </section>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm leading-6">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Titre du Projet</th>
                  <th className="px-6 py-4 text-center">Catégorie</th>
                  <th className="px-6 py-4 text-center">Étudiant</th>
                  <th className="px-6 py-4 text-center">Statut</th>
                  <th className="px-6 py-4 text-center">Date limite</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                      Aucun projet trouvé.
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            project.statut === 'REJETE' ? 'bg-red-100 text-red-600' :
                            project.statut === 'CLOTURE' ? 'bg-slate-100 text-slate-600' :
                            'bg-blue-100 text-[#1E4AA8]'
                          }`}>
                            <FolderKanban size={18} />
                          </div>
                          <div>
                            <Link 
                              to={`/admin/projects/${project.id}`}
                              className="font-bold text-[#0B1C3F] hover:text-[#1E4AA8] transition-colors max-w-[250px] truncate block"
                            >
                              {project.titre}
                            </Link>
                            <p className="text-xs text-slate-500 max-w-[250px] truncate">{project.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {project.categorie_label ? (
                          <span className="px-2 py-1 bg-blue-50 text-[#1E4AA8] text-[10px] font-bold rounded-md uppercase">
                            {project.categorie_label}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {project.etudiant_nom ? (
                          <div className="flex items-center gap-2">
                             <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                               {project.etudiant_nom[0]}{project.etudiant_prenom?.[0]}
                             </div>
                             <span className="font-medium text-slate-700">{project.etudiant_prenom} {project.etudiant_nom}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Non assigné</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          project.statut === 'EN_COURS' ? 'bg-green-100 text-green-700' :
                          project.statut === 'TERMINE' ? 'bg-blue-100 text-blue-700' :
                          project.statut === 'EN_ATTENTE' ? 'bg-orange-100 text-orange-700' :
                          project.statut === 'CLOTURE' ? 'bg-slate-200 text-slate-700' :
                          project.statut === 'REJETE' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {project.statut?.replace('_', ' ') || 'NOUVEAU'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-500 font-medium whitespace-nowrap">
                        {project.date_fin ? new Date(project.date_fin).toLocaleDateString('fr-FR') : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/admin/projects/${project.id}`}>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              icon={Eye}
                              title="Consulter les détails"
                              className="text-blue-600 border-blue-100 hover:bg-blue-50"
                            />
                          </Link>

                          {project.statut === 'EN_ATTENTE' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-green-600 text-green-600 hover:bg-green-50 px-2"
                                onClick={() => handleApproveProposal(project.id)}
                              >
                                Valider
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-600 text-red-600 hover:bg-red-50 px-2"
                                onClick={() => handleRejectProposal(project.id)}
                              >
                                Rejeter
                              </Button>
                            </>
                          )}
                          {project.statut === 'TERMINE' && (
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-[#1E4AA8] text-[#1E4AA8] hover:bg-blue-50 px-2"
                                onClick={() => handleCloseProject(project.id)}
                              >
                                Clôturer
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            icon={LinkIcon}
                            onClick={() => openAssignModal(project)}
                            title="Assigner des encadreurs"
                            className="bg-slate-50"
                          >
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-slate-400 hover:text-blue-600"
                            onClick={() => openEditModal(project)}
                            title="Modifier"
                          >
                            <span className="text-[10px] uppercase font-bold px-1 text-slate-500">Editer</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-slate-400 hover:text-red-600 border-red-100 hover:bg-red-50"
                            onClick={() => handleDeleteProject(project.id, project.titre)}
                            title="Supprimer"
                          >
                            <span className="text-[10px] uppercase font-bold px-1 text-red-500">X</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Création */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => !isSubmitting && setIsCreateModalOpen(false)}
          title={modalMode === 'create' ? "Créer un nouveau projet" : "Modifier le projet"}
        >
          <form onSubmit={handleCreateOrUpdateProject} className="space-y-4">
            <Input 
              label="Titre du projet"
              placeholder="Ex: Application Web E-commerce"
              required
              value={newProject.titre}
              onChange={(e) => setNewProject({...newProject, titre: e.target.value})}
            />
            
            <Input 
              label="Description"
              type="textarea"
              rows={4}
              placeholder="Détails du projet..."
              required
              value={newProject.description}
              onChange={(e) => setNewProject({...newProject, description: e.target.value})}
            />

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Catégorie</label>
              <select 
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1E4AA8] outline-none"
                value={newProject.categorie_id}
                onChange={(e) => setNewProject({...newProject, categorie_id: e.target.value})}
              >
                <option value="">Sélectionner une catégorie (optionnel)</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
            
            <Input 
              label="Date de fin"
              type="date"
              required
              value={newProject.date_fin}
              onChange={(e) => setNewProject({...newProject, date_fin: e.target.value})}
            />

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="w-full bg-[#1E4AA8] hover:bg-[#153476]"
                disabled={isSubmitting || !newProject.titre || !newProject.date_fin}
                loading={isSubmitting}
              >
                Enregistrer
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal Assignation */}
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => !isSubmitting && setIsAssignModalOpen(false)}
          title="Assigner des utilisateurs au projet"
        >
          <form onSubmit={handleAssignProject} className="space-y-4">
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Sélectionnez les utilisateurs (Étudiants, Encadreurs)</label>
              
              {allUsers.filter(u => u.actif && u.role !== 'ADMIN').map(u => (
                <label key={u.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors select-none">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-[#1E4AA8] rounded border-slate-300 focus:ring-[#1E4AA8]"
                    checked={assignmentData.user_ids.includes(u.id)}
                    onChange={() => toggleUserSelection(u.id)}
                  />
                  <div>
                    <div className="font-bold text-sm text-[#0B1C3F]">{u.prenom} {u.nom}</div>
                    <div className="text-xs text-slate-500 font-semibold">{u.role?.replace('_', ' ')}</div>
                  </div>
                </label>
              ))}
              {allUsers.filter(u => u.actif && u.role !== 'ADMIN').length === 0 && (
                <p className="text-sm text-slate-500 italic text-center p-4">Aucun utilisateur actif disponible pour l'assignation.</p>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => setIsAssignModalOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="w-full bg-[#1E4AA8] hover:bg-[#153476]"
                disabled={isSubmitting || assignmentData.user_ids.length === 0}
                loading={isSubmitting}
              >
                Assigner
              </Button>
            </div>
          </form>
        </Modal>

      </div>
    </DashboardLayout>
  );
}
