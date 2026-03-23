import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import studentService from '../../services/studentService';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { 
  FolderKanban, 
  FileText, 
  CheckCircle, 
  Clock, 
  CalendarDays, 
  Bell,
  Upload,
  Eye,
  AlertCircle,
  Trophy,
  Activity
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip
} from 'recharts';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    deliverables: 0,
    notifications: 0
  });
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [evaluations, setEvaluations] = useState({ academiques: [], professionnelles: [] });

  // Charger les données du dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [projectsRes, tasksRes, deliverablesRes, notificationsRes, evalsRes] = await Promise.all([
        studentService.getProjects(),
        studentService.getTasks(),
        studentService.getDeliverables(),
        studentService.getNotifications(),
        studentService.getEvaluations()
      ]);
      
      console.log('Evals received:', evalsRes);

      setProjects(projectsRes.projects || []);
      setTasks(tasksRes.tasks || []);
      setDeliverables(deliverablesRes.deliverables || []);
      setNotifications(notificationsRes.notifications || []);
      setEvaluations(evalsRes || { academiques: [], professionnelles: [] });

      // Calculer les statistiques
      setStats({
        projects: (projectsRes.projects || []).length,
        tasks: (tasksRes.tasks || []).filter(task => task.statut !== 'TERMINE').length,
        deliverables: (deliverablesRes.deliverables || []).length,
        notifications: (notificationsRes.notifications || []).filter(n => !n.is_read).length
      });

    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Impossible de charger les données du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Mettre à jour le statut d'une tâche
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await studentService.updateTaskStatus(taskId, newStatus);
      const tasksRes = await studentService.getTasks();
      setTasks(tasksRes.tasks || []);
      loadDashboardData();
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la tâche:', err);
      setError('Impossible de mettre à jour la tâche');
    }
  };

  // Marquer une notification comme lue
  const markNotificationAsRead = async (notificationId) => {
    try {
      await studentService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setStats(prev => ({ ...prev, notifications: prev.notifications - 1 }));
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la notification:', err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Mon Espace Étudiant">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader size="lg" text="Chargement de votre espace..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Mon Espace Étudiant">
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold text-[#0B1C3F]">
            Espace Étudiant
          </h1>
          <p className="text-slate-500 mt-2">
            Heureux de vous revoir, {user?.prenom} {user?.nom} ! Voici l'état de vos projets.
          </p>
        </header>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm leading-6">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card padding="md" className="flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="rounded-xl flex items-center justify-center w-12 h-12 bg-[#1E4AA8]/10 text-[#1E4AA8]">
              <FolderKanban size={24} />
            </div>
            <div>
               <p className="text-sm text-slate-500 font-medium">Projets assignés</p>
               <h3 className="text-2xl font-bold text-[#0B1C3F]">{stats.projects}</h3>
            </div>
          </Card>

          <Card padding="md" className="flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="rounded-xl flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-600">
              <Clock size={24} />
            </div>
            <div>
               <p className="text-sm text-slate-500 font-medium">Tâches en cours</p>
               <h3 className="text-2xl font-bold text-[#0B1C3F]">{stats.tasks}</h3>
            </div>
          </Card>

          <Card padding="md" className="flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="rounded-xl flex items-center justify-center w-12 h-12 bg-green-100 text-green-600">
              <FileText size={24} />
            </div>
            <div>
               <p className="text-sm text-slate-500 font-medium">Livrables</p>
               <h3 className="text-2xl font-bold text-[#0B1C3F]">{stats.deliverables}</h3>
            </div>
          </Card>

          <Card padding="md" className="flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="rounded-xl flex items-center justify-center w-12 h-12 bg-slate-100 text-slate-600">
              <Bell size={24} />
            </div>
            <div>
               <p className="text-sm text-slate-500 font-medium">Notifications</p>
               <h3 className="text-2xl font-bold text-[#0B1C3F]">{stats.notifications}</h3>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Column: Charts & Projects */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Visual Insights Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Radar Chart: Skills */}
               <Card className="border-slate-200 shadow-sm overflow-hidden">
                 <Card.Header className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-sm font-bold text-[#0B1C3F] flex items-center gap-2">
                       <Trophy className="h-4 w-4 text-orange-500" />
                       Mes Compétences (Radar)
                    </h3>
                 </Card.Header>
                 <Card.Content className="p-4 h-[250px] flex items-center justify-center">
                    {evaluations?.professionnelles && evaluations.professionnelles.length > 0 && evaluations.professionnelles[0]?.items ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={evaluations.professionnelles[0].items.map(i => ({
                          subject: i?.libelle || 'Compétence',
                          A: i?.score || 0,
                          fullMark: 5
                        }))}>
                          <PolarGrid stroke="#E2E8F0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                          <Radar
                            name="Compétences"
                            dataKey="A"
                            stroke="#1E4AA8"
                            fill="#1E4AA8"
                            fillOpacity={0.6}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center text-slate-400">
                        <Activity className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        <p className="text-xs italic">Évaluation pro en attente</p>
                      </div>
                    )}
                 </Card.Content>
               </Card>

               {/* Gauge Chart: Project Completion */}
               <Card className="border-slate-200 shadow-sm overflow-hidden">
                 <Card.Header className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-sm font-bold text-[#0B1C3F] flex items-center gap-2">
                       <Activity className="h-4 w-4 text-blue-500" />
                       Progression du Projet
                    </h3>
                 </Card.Header>
                 <Card.Content className="p-4 h-[250px] flex flex-col items-center justify-center">
                    {projects.length > 0 ? (() => {
                      const p = projects[0];
                      const pts = tasks.filter(t => t.projet_id === p.id);
                      const done = pts.filter(t => t.statut === 'TERMINE').length;
                      const pct = pts.length > 0 ? Math.round((done / pts.length) * 100) : 0;
                      
                      return (
                        <>
                          <ResponsiveContainer width="100%" height="80%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Fait', value: pct, fill: '#1E4AA8' },
                                  { name: 'Restant', value: 100 - pct, fill: '#F1F5F9' }
                                ]}
                                cx="50%"
                                cy="100%"
                                startAngle={180}
                                endAngle={0}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={0}
                                dataKey="value"
                              >
                                <Cell key="cell-0" fill="#1E4AA8" />
                                <Cell key="cell-1" fill="#F1F5F9" />
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="text-center -mt-8">
                             <span className="text-3xl font-black text-[#0B1C3F]">{pct}%</span>
                             <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Complété</p>
                          </div>
                        </>
                      );
                    })() : (
                      <p className="text-xs text-slate-400 italic">Aucun projet actif</p>
                    )}
                 </Card.Content>
               </Card>
            </div>
            
            {/* Mes Projets */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-[#0B1C3F]">
                  <FolderKanban className="h-6 w-6 text-[#1E4AA8]" />
                  Mes Projets Actifs
                </h2>
              </div>

              {projects.length === 0 ? (
                <Card padding="xl" className="text-center border-dashed border-2 border-slate-200 shadow-none">
                  <FolderKanban className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Aucun projet assigné pour le moment.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {projects.map(project => {
                    const projectTasks = tasks.filter(t => t.projet_id === project.id);
                    const completedTasks = projectTasks.filter(t => t.statut === 'TERMINE').length;
                    const progress = projectTasks.length > 0 
                      ? Math.round((completedTasks / projectTasks.length) * 100) 
                      : 0;

                    return (
                      <Card key={project.id} className="border border-slate-200 hover:border-[#1E4AA8]/30 transition-colors">
                        <Card.Content className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <Link to={`/student/projects/${project.id}`} className="hover:underline">
                                <h3 className="font-bold text-lg text-[#0B1C3F] leading-tight transition-colors hover:text-[#1E4AA8]">
                                  {project.titre}
                                </h3>
                              </Link>
                              <p className="text-xs text-slate-500 mt-1">
                                {completedTasks} tâches terminées sur {projectTasks.length}
                              </p>
                            </div>
                            <span className={`shrink-0 ml-4 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700`}>
                              {project.statut?.replace('_', ' ') || 'ACTIF'}
                            </span>
                          </div>
                          
                          {/* Barre de Progression Premium */}
                          <div className="mb-5">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Avancement Global</span>
                              <span className="text-xs font-black text-[#1E4AA8] bg-[#1E4AA8]/10 px-1.5 py-0.5 rounded">{progress}%</span>
                            </div>
                            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                              <div 
                                className="h-full bg-gradient-to-r from-[#1E4AA8] to-[#3B82F6] transition-all duration-1000 ease-out rounded-full shadow-[0_0_8px_rgba(30,74,168,0.3)]"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                            {project.description || "Aucune description pour ce projet."}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                            {project.date_debut && (
                              <div className="flex items-center gap-1.5">
                                <CalendarDays className="h-4 w-4 text-[#1E4AA8]" />
                                <span>Début: <span className="font-medium text-slate-700">{new Date(project.date_debut).toLocaleDateString('fr-FR')}</span></span>
                              </div>
                            )}
                            {project.date_fin && (
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-[#1E4AA8]" />
                                <span>Échéance: <span className="font-medium text-slate-700">{new Date(project.date_fin).toLocaleDateString('fr-FR')}</span></span>
                              </div>
                            )}
                          </div>
                        </Card.Content>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Mes Tâches */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-[#0B1C3F]">
                  <CheckCircle className="h-6 w-6 text-[#1E4AA8]" />
                  Mes Tâches
                </h2>
              </div>
              
              {tasks.length === 0 ? (
                <Card padding="xl" className="text-center border-dashed border-2 border-slate-200 shadow-none">
                  <CheckCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Aucune tâche en attente.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {tasks.slice(0, 5).map(task => (
                    <Card key={task.id} className="border-l-4 border-l-[#1E4AA8] shadow-sm">
                      <Card.Content className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-[#0B1C3F] flex items-center gap-2">
                              {task.titre}
                              <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-600`}>
                                {task.statut?.replace('_', ' ') || 'A FAIRE'}
                              </span>
                            </h3>
                            {task.description && (
                              <p className="text-slate-500 text-sm mt-1">{task.description}</p>
                            )}
                            {task.due_date && (
                              <div className="flex items-center gap-1 mt-2 text-xs font-medium text-slate-400">
                                <CalendarDays className="h-3.5 w-3.5" />
                                <span>Échéance: {new Date(task.due_date).toLocaleDateString('fr-FR')}</span>
                              </div>
                            )}
                          </div>
                          
                          {task.statut !== 'TERMINE' && (
                            <div className="shrink-0 flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                              {task.statut === 'A_FAIRE' && (
                                <Button
                                  size="sm"
                                  onClick={() => updateTaskStatus(task.id, 'EN_COURS')}
                                  className="w-full sm:w-auto"
                                >
                                  Commencer
                                </Button>
                              )}
                              {task.statut === 'EN_COURS' && (
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => updateTaskStatus(task.id, 'TERMINE')}
                                  className="w-full sm:w-auto"
                                >
                                  Terminer
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </Card.Content>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Side Column: Notifications & Deliverables */}
          <div className="space-y-8">
            
            {/* Notifications */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-[#0B1C3F]">
                  <Bell className="h-6 w-6 text-[#1E4AA8]" />
                  Notifications
                </h2>
              </div>
              
              <Card className="shadow-sm border-slate-200">
                <Card.Content className="p-0">
                  {notifications.length === 0 ? (
                    <div className="text-center py-10 px-4">
                      <Bell className="mx-auto text-slate-300 mb-3 h-10 w-10" />
                      <p className="text-slate-500 text-sm">Vous êtes à jour !</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto scrollbar-hide">
                      {notifications.slice(0, 5).map(notification => (
                        <div 
                          key={notification.id} 
                          className={`p-4 cursor-pointer transition-colors ${
                            !notification.is_read 
                              ? 'bg-blue-50/50 hover:bg-blue-50' 
                              : 'bg-white hover:bg-slate-50'
                          }`}
                          onClick={() => !notification.is_read && markNotificationAsRead(notification.id)}
                        >
                          <div className="flex gap-3">
                            <div className={`mt-0.5 shrink-0 h-2 w-2 rounded-full ${!notification.is_read ? 'bg-[#1E4AA8]' : 'bg-transparent'}`} />
                            <div>
                              <h4 className={`text-sm ${!notification.is_read ? 'font-semibold text-[#0B1C3F]' : 'font-medium text-slate-700'}`}>
                                {notification.titre}
                              </h4>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                {notification.message}
                              </p>
                              <span className="text-[10px] font-medium text-slate-400 mt-2 block uppercase tracking-wider">
                                {new Date(notification.created_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Content>
              </Card>
            </section>

            {/* Livrables */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-[#0B1C3F]">
                  <FileText className="h-6 w-6 text-[#1E4AA8]" />
                  Mes Livrables
                </h2>
              </div>

              <Card className="shadow-sm border-slate-200">
                <Card.Content className="p-0">
                  {deliverables.length === 0 ? (
                    <div className="text-center py-10 px-4">
                      <FileText className="mx-auto text-slate-300 mb-3 h-10 w-10" />
                      <p className="text-slate-500 text-sm">Aucun document déposé.</p>
                      <Button variant="outline" size="sm" className="mt-4 shadow-sm" icon={Upload}>
                        Déposer
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {deliverables.slice(0, 5).map(deliverable => (
                        <div key={deliverable.id} className="p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-semibold text-sm text-[#0B1C3F] truncate pr-4">
                              {deliverable.titre}
                            </h4>
                            <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600`}>
                              {deliverable.statut}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate mb-3">
                            {deliverable.file_name}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                             <span className="text-xs text-slate-400 font-medium">
                              Le {new Date(deliverable.submitted_at).toLocaleDateString('fr-FR')}
                             </span>
                             <div className="flex gap-2">
                               <button className="p-1.5 text-slate-400 hover:text-[#1E4AA8] hover:bg-blue-50 rounded transition-colors" title="Voir">
                                 <Eye className="h-4 w-4" />
                               </button>
                               <button className="p-1.5 text-slate-400 hover:text-[#1E4AA8] hover:bg-blue-50 rounded transition-colors" title="Télécharger">
                                 <Upload className="h-4 w-4" />
                               </button>
                             </div>
                          </div>
                        </div>
                      ))}
                      <div className="p-3 bg-slate-50 text-center border-t border-slate-100 rounded-b-lg">
                        <Link to="/student/deliverables" className="text-sm font-semibold text-[#1E4AA8] hover:underline">
                          Voir tous les livrables
                        </Link>
                      </div>
                    </div>
                  )}
                </Card.Content>
              </Card>
            </section>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
