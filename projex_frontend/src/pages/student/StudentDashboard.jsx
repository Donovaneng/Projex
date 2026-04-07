import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import studentService from '../../services/studentService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { 
  FolderKanban, 
  ClipboardCheck, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    project: null,
    tasks: [],
    deliverables: []
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [projRes, tasksRes, delRes] = await Promise.all([
          studentService.getProjects(),
          studentService.getTasks(),
          studentService.getDeliverables()
        ]);

        setData({
          project: projRes.project || null,
          tasks: tasksRes.tasks || [],
          deliverables: delRes.deliverables || []
        });
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <Loader size="lg" text="Initialisation de votre espace..." />
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    { 
      label: "Tâches en Cours", 
      value: data.tasks.filter(t => t.statut === 'EN_COURS').length, 
      icon: Clock, 
      color: "text-blue-600",
      bg: "bg-blue-100"
    },
    { 
      label: "Tâches Terminées", 
      value: data.tasks.filter(t => t.statut === 'TERMINE').length, 
      icon: CheckCircle2, 
      color: "text-green-600",
      bg: "bg-green-100"
    },
    { 
      label: "Livrables Déposés", 
      value: data.deliverables.length, 
      icon: FileText, 
      color: "text-purple-600",
      bg: "bg-purple-100"
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0B1C3F]">Mon Tableau de Bord</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-2">Bienvenue sur votre espace de travail PROJEX.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="border-none shadow-sm ring-1 ring-slate-200">
              <Card.Content className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#0B1C3F]">{stat.value}</p>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Project Card */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-[#0B1C3F] flex items-center gap-2">
              <FolderKanban className="text-[#1E4AA8]" size={20} />
              Mon Projet Actuel
            </h2>
            
            {data.project ? (
              <Card className="border-t-4 border-t-[#1E4AA8]">
                <Card.Header>
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-[#0B1C3F]">{data.project.titre}</h3>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {data.project.statut || 'En Cours'}
                    </span>
                  </div>
                </Card.Header>
                <Card.Content>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    {data.project.description || "Aucune description fournie."}
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                     <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock size={16} />
                        Limite : {data.project.date_fin ? new Date(data.project.date_fin).toLocaleDateString() : 'Non définie'}
                     </div>
                  </div>
                </Card.Content>
                <Card.Footer className="bg-slate-50/50 flex justify-end">
                   <Link to="/student/projects">
                     <Button variant="outline" size="sm">Consulter les détails</Button>
                   </Link>
                </Card.Footer>
              </Card>
            ) : (
              <Card padding="xl" className="text-center border-dashed border-2 border-slate-200 shadow-none">
                 <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                 <p className="text-slate-500 font-medium">Aucun projet ne vous est encore assigné.</p>
                 <Link to="/student/projects" className="mt-4 block">
                    <Button variant="outline" size="sm">Proposer un projet</Button>
                 </Link>
              </Card>
            )}
          </div>

          {/* Quick Tasks View */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#0B1C3F] flex items-center gap-2">
              <ClipboardCheck className="text-[#1E4AA8]" size={20} />
              Tâches Récentes
            </h2>
            <Card className="divide-y divide-slate-100">
               {data.tasks.length === 0 ? (
                 <Card.Content className="py-12 text-center text-slate-400">
                    <p className="text-sm italic">Aucune tâche assignée.</p>
                 </Card.Content>
               ) : (
                 data.tasks.slice(0, 5).map(task => (
                   <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                      <p className="font-bold text-[#0B1C3F] text-sm truncate">{task.titre}</p>
                      <div className="flex items-center justify-between mt-2">
                         <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                           task.statut === 'TERMINE' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                         }`}>
                           {task.statut.replace('_', ' ')}
                         </span>
                         <span className="text-[10px] text-slate-400">
                           {new Date(task.created_at).toLocaleDateString()}
                         </span>
                      </div>
                   </div>
                 ))
               )}
               {data.tasks.length > 0 && (
                 <div className="p-4 text-center border-t border-slate-100">
                    <Link to="/student/tasks" className="text-sm font-bold text-[#1E4AA8] hover:underline">
                      Voir tout le kanban
                    </Link>
                 </div>
               )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
