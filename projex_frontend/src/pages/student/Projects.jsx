import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import studentService from '../../services/studentService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { FolderKanban, Plus, AlertTriangle, CalendarDays, Users } from 'lucide-react';

export default function StudentProjects() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProject, setNewProject] = useState({
    titre: '',
    description: '',
    date_fin: ''
  });

  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingProjectId, setEditingProjectId] = useState(null);

  const [availableProjects, setAvailableProjects] = useState([]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const [ownRes, availRes] = await Promise.all([
        studentService.getProjects(),
        studentService.getAvailableProjects().catch(() => ({ projects: [] }))
      ]);
      setProjects(ownRes.projects || ownRes || []);
      setAvailableProjects(availRes.projects || availRes || []);
    } catch (err) {
      console.error('Erreur lors du chargement des projets:', err);
      setError('Impossible de charger vos projets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateOrUpdateProject = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (modalMode === 'create') {
        await studentService.createProject(newProject);
        alert('Proposition envoyée avec succès !');
      } else {
        await studentService.updateProposal(editingProjectId, newProject);
        alert('Proposition mise à jour avec succès !');
      }
      setIsModalOpen(false);
      setNewProject({ titre: '', description: '', date_fin: '' });
      loadProjects();
    } catch (err) {
      console.error(err);
      alert('Erreur: ' + (err.error || 'Impossible d\'enregistrer le projet.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProposal = async (projectId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette proposition ?")) return;
    try {
      await studentService.deleteProposal(projectId);
      loadProjects();
    } catch (err) {
      alert(err.error || "Erreur lors de la suppression");
    }
  };

  const openEditModal = (project) => {
    setModalMode('edit');
    setEditingProjectId(project.id);
    setNewProject({
      titre: project.titre || '',
      description: project.description || '',
      date_fin: project.date_fin ? project.date_fin.substring(0, 10) : ''
    });
    setIsModalOpen(true);
  };

  const handleApplyToProject = async (projectId) => {
    if (!window.confirm("Voulez-vous vraiment postuler à ce projet ? Une fois assigné, vous ne pourrez plus changer sans l'intervention d'un administrateur.")) return;
    
    try {
      setLoading(true);
      const res = await studentService.applyToProject(projectId);
      alert(res.message || "Félicitations ! Vous avez été assigné au projet.");
      loadProjects(); // Recharger pour voir le projet dans "Mes Projets" et qu'il disparaisse des disponibles
    } catch (err) {
      alert(err.error || "Une erreur est survenue lors de la postulation.");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingProjectId(null);
    setNewProject({ titre: '', description: '', date_fin: '' });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader size="lg" text="Chargement de vos projets..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0B1C3F] flex items-center gap-3">
              <FolderKanban className="h-8 w-8 text-[#1E4AA8]" />
              Mes Projets
            </h1>
            <p className="text-slate-500 mt-2">
              Consultez et créez de nouveaux projets académiques.
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

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm leading-6">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#0B1C3F] flex items-center gap-2">
            <FolderKanban className="text-[#1E4AA8]" size={20} />
            Mes Projets & Propositions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length === 0 ? (
              <div className="col-span-full pt-12 pb-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <FolderKanban className="h-16 w-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-600 mb-1">Aucun projet</h3>
                <p className="text-slate-500 text-sm mb-6 text-center max-w-sm">
                  Vous n'êtes assigné à aucun projet pour l'instant.
                </p>
                <Button onClick={openCreateModal} icon={Plus} variant="outline">
                  Proposer un projet
                </Button>
              </div>
            ) : (
              projects.map(project => (
                <Card key={project.id} hover="scale" className="border-slate-200 h-full flex flex-col">
                  <Card.Content className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-xl text-[#0B1C3F] leading-tight">
                        {project.titre}
                      </h3>
                      <span className={`shrink-0 ml-3 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase ${
                        project.statut === 'EN_COURS' ? 'bg-green-100 text-green-700' : 
                        project.statut === 'TERMINE' ? 'bg-slate-100 text-slate-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {project.statut || 'NOUVEAU'}
                      </span>
                    </div>
                    
                    <p className="text-slate-600 text-sm mb-6 flex-1">
                      {project.description || "Aucune description fournie pour ce projet."}
                    </p>
                    
                    <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-slate-100">
                      {project.date_fin && (
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                          <CalendarDays className="h-4 w-4 text-[#1E4AA8]" />
                          <span>Date de fin: {new Date(project.date_fin).toLocaleDateString()}</span>
                        </div>
                      )}
                      {project.superviseur && (
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                          <Users className="h-4 w-4 text-[#1E4AA8]" />
                          <span>Encadré par: <span className="text-[#0B1C3F]">{project.superviseur}</span></span>
                        </div>
                      )}
                      {project.statut === 'EN_ATTENTE' && (
                         <div className="flex gap-2 mt-2">
                           <Button 
                             size="sm" 
                             variant="outline" 
                             onClick={() => openEditModal(project)}
                             className="flex-1 text-xs"
                           >
                             Modifier
                           </Button>
                           <Button 
                             size="sm" 
                             variant="outline" 
                             onClick={() => handleDeleteProposal(project.id)}
                             className="flex-1 text-xs text-red-600 border-red-100 hover:bg-red-50"
                           >
                             Supprimer
                           </Button>
                         </div>
                      )}
                    </div>
                  </Card.Content>
                </Card>
              ))
            )}
          </div>
        </div>

        {availableProjects.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#0B1C3F] flex items-center gap-2">
              <Plus className="text-[#1E4AA8]" size={20} />
              Projets Disponibles (À Saisir)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableProjects.map(project => (
                <Card key={project.id} className="border-slate-200 border-l-4 border-l-[#1E4AA8] h-full flex flex-col">
                  <Card.Content className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-[#0B1C3F] mb-3">{project.titre}</h3>
                    <p className="text-slate-600 text-sm mb-4 flex-1 line-clamp-3">
                      {project.description}
                    </p>
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <CalendarDays className="h-3 w-3" />
                        <span>Publié le {new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => handleApplyToProject(project.id)}
                        disabled={loading}
                      >
                        {loading ? "Chargement..." : "Postuler"}
                      </Button>
                    </div>
                  </Card.Content>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Modal de création de projet */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => !isSubmitting && setIsModalOpen(false)}
          title={modalMode === 'create' ? "Proposer un nouveau projet" : "Modifier ma proposition"}
        >
          <form onSubmit={handleCreateOrUpdateProject} className="space-y-4">
            <Input 
              label="Titre du projet"
              placeholder="Ex: Refonte du système d'information"
              required
              value={newProject.titre}
              onChange={(e) => setNewProject({...newProject, titre: e.target.value})}
            />
            
            <Input 
              label="Description complète"
              type="textarea"
              rows={4}
              placeholder="Décrivez les objectifs et les résultats attendus..."
              required
              value={newProject.description}
              onChange={(e) => setNewProject({...newProject, description: e.target.value})}
            />
            
            <Input 
              label="Date limite souhaitée"
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
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="w-full bg-[#1E4AA8] hover:bg-[#153476]"
                disabled={isSubmitting || !newProject.titre || !newProject.description || !newProject.date_fin}
                loading={isSubmitting}
              >
                Créer le projet
              </Button>
            </div>
          </form>
        </Modal>

      </div>
    </DashboardLayout>
  );
}
