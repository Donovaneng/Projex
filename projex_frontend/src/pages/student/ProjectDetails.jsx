import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
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
  User
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ProjectChat from '../../components/project/ProjectChat';

export default function StudentProjectDetails() {
  const { user: currentUser } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const loadProjectDetails = async () => {
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
      setTasks((tasksRes.tasks || []).filter(t => t.projet_id === foundProject.id));

    } catch (err) {
      console.error(err);
      setError(err.message || 'Impossible de charger les détails du projet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectDetails();
  }, [id]);

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
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                project.statut === 'EN_COURS' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}>
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

            <Card className="p-8 border-slate-200 shadow-sm">
               <h2 className="text-lg font-bold text-[#0B1C3F] mb-6 flex items-center gap-2">
                 <CheckCircle2 className="text-[#1E4AA8]" size={20} />
                 Progression du Travail
               </h2>
               
               <div className="space-y-6">
                 <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">État d'avancement général</span>
                      <span className="text-sm font-black text-[#1E4AA8] bg-[#1E4AA8]/10 px-2 py-1 rounded">{progress}%</span>
                    </div>
                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                      <div 
                        className="h-full bg-gradient-to-r from-[#1E4AA8] to-[#3B82F6] transition-all duration-1000 ease-out rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                       <span className="block text-xl font-black text-[#0B1C3F]">{tasks.length}</span>
                       <span className="text-[10px] uppercase font-bold text-slate-400">Tâches</span>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                       <span className="block text-xl font-black text-green-700">{completedTasks}</span>
                       <span className="text-[10px] uppercase font-bold text-green-500">Terminées</span>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                       <span className="block text-xl font-black text-[#1E4AA8]">{tasks.filter(t => t.statut === 'EN_COURS').length}</span>
                       <span className="text-[10px] uppercase font-bold text-[#1E4AA8]/60">En cours</span>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                       <span className="block text-xl font-black text-red-700">{tasks.filter(t => t.statut === 'BLOQUE').length}</span>
                       <span className="text-[10px] uppercase font-bold text-red-400">Bloquées</span>
                    </div>
                 </div>
               </div>
            </Card>

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
                      <p className="text-xs text-slate-400 italic">Responsable du contenu scientifique</p>
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
                      <p className="text-xs text-slate-400 italic">Tuteur en entreprise (si stage)</p>
                    </div>
                  </div>
               </div>

               <div className="mt-8 pt-6 border-t border-slate-100">
                  <Button variant="outline" className="w-full text-[#1E4AA8] border-[#1E4AA8]/20 hover:bg-[#1E4AA8]/5" icon={CalendarDays}>
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
