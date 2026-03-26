import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';
import studentService from '../../services/studentService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { 
  FolderKanban, 
  Users, 
  CalendarDays, 
  Clock, 
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Mail,
  Phone
} from 'lucide-react';
import ProjectChat from '../../components/project/ProjectChat';
import ProjectTimeline from '../../components/project/ProjectTimeline';
import { ListTodo, Plus, Send, Trash2 } from 'lucide-react';
import Input from '../../components/ui/Input';

export default function StudentProjectDetails() {
  const { user: currentUser } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({ titre: '', description: '', due_date: '' });
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const loadProjectDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const [projectsRes, tasksRes] = await Promise.all([
        studentService.getProjects(),
        studentService.getTasks()
      ]);

      const foundProject = (projectsRes.projects || projectsRes).find(p => p.id === parseInt(id));
      if (!foundProject) {
        throw new Error("Projet introuvable ou vous n'y êtes pas affecté.");
      }

      setProject(foundProject);
      setTasks((tasksRes.tasks || []).filter(t => t.project_id === foundProject.id));

    } catch {
      setError('Impossible de charger les détails du projet.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.titre) return;
    try {
      setIsSubmittingTask(true);
      await studentService.createTask({
        ...newTask,
        project_id: id,
        assigned_to: currentUser.id
      });
      setNewTask({ titre: '', description: '', due_date: '' });
      setIsAddingTask(false);
      loadProjectDetails();
    } catch {
      alert("Erreur lors de la création de la tâche");
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleToggleTaskStatus = async (taskId, currentStatus) => {
     const nextStatus = currentStatus === 'TERMINE' ? 'A_FAIRE' : 'TERMINE';
     try {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, statut: nextStatus } : t));
        await studentService.updateTaskStatus(taskId, nextStatus);
     } catch {
        loadProjectDetails();
     }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette tâche ?")) return;
    try {
      await studentService.deleteTask(taskId);
      loadProjectDetails();
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  useEffect(() => {
    loadProjectDetails();
  }, [loadProjectDetails]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader size="lg" text="Chargement du projet..." />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Card className="max-w-2xl mx-auto mt-10 p-10 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">{error}</h2>
          <Button onClick={() => navigate('/student/dashboard')} className="mt-6" icon={ChevronLeft}>
            Retour au tableau de bord
          </Button>
        </Card>
      </DashboardLayout>
    );
  }

  const completedTasks = tasks.filter(t => t.statut === 'TERMINE').length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        
        {/* Navigation & Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#0B1C3F]">{project.titre}</h1>
            <p className="text-slate-500 flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-700">
                {project.statut?.replace('_', ' ') || 'ACTIF'}
              </span>
              <span>•</span>
              <span className="text-xs uppercase font-bold tracking-tight">ID: {project.id}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8 border-slate-200 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#1E4AA8]/5 rounded-bl-full -mr-10 -mt-10" />
               <h2 className="text-lg font-bold text-[#0B1C3F] mb-4 flex items-center gap-2">
                 <FileText className="text-[#1E4AA8]" size={20} />
                 Description du Projet
               </h2>
               <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                 {project.description || "Aucune description détaillée n'a été fournie pour ce projet."}
               </p>

               {project.statut === 'REJETE' && project.motif_rejet && (
                 <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 items-start animate-in fade-in duration-500">
                   <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
                   <div className="space-y-1">
                      <p className="text-xs font-black text-red-600 uppercase tracking-widest">Motif du Rejet</p>
                      <p className="text-sm text-red-700 font-medium leading-relaxed">{project.motif_rejet}</p>
                   </div>
                 </div>
               )}

               <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-black text-slate-400 block mb-1">Date de début</span>
                    <div className="flex items-center gap-3 text-[#0B1C3F] font-bold">
                       <CalendarDays className="text-[#1E4AA8]" size={18} />
                       {project.date_debut ? new Date(project.date_debut).toLocaleDateString('fr-FR', { dateStyle: 'long' }) : 'Non définie'}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 font-bold">
                    <span className="text-[10px] uppercase font-black text-slate-400 block mb-1">Échéance Finale</span>
                    <div className="flex items-center gap-3 text-[#0B1C3F]">
                       <Clock className="text-[#1E4AA8]" size={18} />
                       {project.date_fin ? new Date(project.date_fin).toLocaleDateString('fr-FR', { dateStyle: 'long' }) : 'Non définie'}
                    </div>
                  </div>
               </div>
            </Card>

            <Card className="p-8 border-slate-200 shadow-sm overflow-hidden">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-lg font-bold text-[#0B1C3F] flex items-center gap-2">
                   <ListTodo className="text-[#1E4AA8]" size={20} />
                   Tâches & Objectifs
                 </h2>
                 <Button 
                   size="sm" 
                   icon={Plus} 
                   onClick={() => setIsAddingTask(!isAddingTask)}
                   className={isAddingTask ? 'bg-slate-500' : ''}
                 >
                   {isAddingTask ? 'Annuler' : 'Ajouter'}
                 </Button>
               </div>
               
               {isAddingTask && (
                 <form onSubmit={handleAddTask} className="mb-8 p-6 bg-slate-50 rounded-2xl border border-[#1E4AA8]/10 space-y-4 animate-in slide-in-from-top duration-300">
                    <Input 
                      label="Titre de la tâche" 
                      placeholder="Ex: Architecture de la base de données"
                      value={newTask.titre}
                      onChange={e => setNewTask({...newTask, titre: e.target.value})}
                      required
                    />
                    <Input 
                      label="Description (optionnel)" 
                      placeholder="Détails sur ce qu'il faut accomplir..."
                      value={newTask.description}
                      onChange={e => setNewTask({...newTask, description: e.target.value})}
                    />
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <Input 
                          type="date" 
                          label="Échéance" 
                          value={newTask.due_date}
                          onChange={e => setNewTask({...newTask, due_date: e.target.value})}
                        />
                      </div>
                      <Button type="submit" loading={isSubmittingTask} icon={Send}>Créer</Button>
                    </div>
                 </form>
               )}

               <div className="space-y-3">
                 {tasks.length > 0 ? (
                   tasks.map(task => (
                     <div key={task.id} className="group flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-[#1E4AA8]/20 hover:bg-slate-50 transition-all">
                        <button 
                          onClick={() => handleToggleTaskStatus(task.id, task.statut)}
                          className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            task.statut === 'TERMINE' 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : 'border-slate-300 text-transparent hover:border-emerald-500'
                          }`}
                        >
                          <CheckCircle2 size={14} />
                        </button>
                        <div className="flex-1 min-w-0">
                           <p className={`font-bold text-sm truncate ${task.statut === 'TERMINE' ? 'text-slate-400 line-through' : 'text-[#0B1C3F]'}`}>
                             {task.titre}
                           </p>
                           <div className="flex items-center gap-3 mt-1">
                              {task.due_date && (
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                  <Clock size={10} /> {new Date(task.due_date).toLocaleDateString()}
                                </span>
                              )}
                              <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                {task.statut?.replace('_', ' ') || 'A FAIRE'}
                              </span>
                              
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTask(task.id);
                                }}
                                className="p-1 px-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                      </div>
                   ))
                 ) : (
                   <div className="text-center py-10 text-slate-400 animate-pulse">
                      <ListTodo size={40} className="mx-auto mb-3 opacity-20" />
                      <p className="text-xs font-bold uppercase tracking-widest leading-loose">
                        Aucune tâche définie.<br/>
                        Commencez par diviser votre projet en étapes.
                      </p>
                   </div>
                 )}
               </div>

               {tasks.length > 0 && (
                 <div className="mt-8 pt-6 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Avancement</span>
                       <span className="text-xs font-black text-[#1E4AA8]">{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-[#1E4AA8] transition-all duration-700"
                         style={{ width: `${progress}%` }}
                       />
                    </div>
                 </div>
               )}
            </Card>

            <ProjectTimeline projectId={id} service={studentService} />
            <ProjectChat projectId={project.id} currentUser={currentUser} />
          </div>

          {/* Side Info: Supervisors */}
          <div className="space-y-8">
            <Card className="p-6 border-slate-200 shadow-sm">
               <h2 className="text-lg font-bold text-[#0B1C3F] mb-6 flex items-center gap-2">
                 <Users className="text-[#1E4AA8]" size={20} />
                 Encadrement
               </h2>
               
               <div className="space-y-6">
                  {/* Superviseur Académique */}
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-[#1E4AA8]/10 flex items-center justify-center text-[#1E4AA8] shrink-0">
                      <User size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black text-slate-400 block mb-0.5">Encadreur Académique</span>
                      <p className="font-bold text-[#0B1C3F]">{project.superviseur_acad || "En attente d'affectation"}</p>
                      {project.acad_email && (
                        <div className="flex flex-col gap-1 mt-1">
                          <a href={`mailto:${project.acad_email}`} className="text-[10px] text-[#1E4AA8] hover:underline flex items-center gap-1 font-medium">
                            <Mail size={10} /> {project.acad_email}
                          </a>
                          {project.acad_tel && (
                            <a href={`tel:${project.acad_tel}`} className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                              <Phone size={10} /> {project.acad_tel}
                            </a>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-slate-400 italic mt-1">Responsable du contenu scientifique</p>
                    </div>
                  </div>

                  {/* Superviseur Pro */}
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                      <Card className="shadow-none border-none p-0 bg-transparent">
                         <User size={20} />
                      </Card>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black text-slate-400 block mb-0.5">Encadreur Professionnel</span>
                      <p className="font-bold text-[#0B1C3F]">{project.superviseur_pro || "Non assigné"}</p>
                      {project.pro_email && (
                        <div className="flex flex-col gap-1 mt-1">
                          <a href={`mailto:${project.pro_email}`} className="text-[10px] text-orange-600 hover:underline flex items-center gap-1 font-medium">
                            <Mail size={10} /> {project.pro_email}
                          </a>
                          {project.pro_tel && (
                            <a href={`tel:${project.pro_tel}`} className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                              <Phone size={10} /> {project.pro_tel}
                            </a>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-slate-400 italic mt-1">Tuteur en entreprise (si stage)</p>
                    </div>
                  </div>
               </div>

               <div className="mt-8 pt-6 border-t border-slate-100">
                  <Button 
                    variant="outline" 
                    className="w-full text-[#1E4AA8] border-[#1E4AA8]/20 hover:bg-[#1E4AA8]/5" 
                    icon={CalendarDays}
                    onClick={() => navigate('/student/deliverables?type=RAPPORT')}
                  >
                    Détails du Rapport Final
                  </Button>
               </div>
            </Card>

            <Card className="p-6 bg-[#0B1C3F] text-white border-none shadow-xl">
               <h3 className="font-bold mb-4 flex items-center gap-2">
                 <AlertCircle size={18} className="text-orange-400" />
                 Besoin d'aide ?
               </h3>
               <p className="text-xs text-slate-300 leading-relaxed mb-6">
                 Si vous rencontrez des difficultés techniques ou si vous souhaitez changer de sujet, veuillez contacter l'administration de PROJEX.
               </p>
               <Button className="w-full bg-white text-[#0B1C3F] border-none hover:bg-slate-100">
                 Contacter l'Admin
               </Button>
            </Card>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
