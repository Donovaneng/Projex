import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import studentService from '../../services/studentService';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import { CheckCircle, Clock, AlertTriangle, LayoutList, ListTodo, Trash2 } from 'lucide-react';

export default function StudentTasks() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('all');

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const [tasksRes, projectsRes] = await Promise.all([
        studentService.getTasks(),
        studentService.getProjects()
      ]);
      setTasks(tasksRes.tasks || tasksRes || []);
      setProjects(projectsRes.projects || projectsRes || []);
    } catch {
      setError('Impossible de charger vos tâches. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setTasks(current => 
        current.map(t => t.id === taskId ? { ...t, statut: newStatus } : t)
      );
      await studentService.updateTaskStatus(taskId, newStatus);
    } catch {
      loadTasks();
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette tâche ?")) return;
    try {
      await studentService.deleteTask(taskId);
      loadTasks();
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  const filteredTasks = selectedProjectId === 'all' 
    ? tasks 
    : tasks.filter(t => t.project_id === parseInt(selectedProjectId));

  const Column = ({ title, colorClass, items, statusId }) => (
    <div className="flex flex-col gap-6">
      <div className={`group flex items-center justify-between p-5 rounded-[24px] border-b-4 ${colorClass} bg-white shadow-xl shadow-slate-200/40 relative overflow-hidden`}>
         <div className="flex items-center gap-3 relative z-10">
            <div className={`p-2 rounded-xl bg-opacity-10 ${statusId === 'A_FAIRE' ? 'bg-slate-500 text-slate-500' : statusId === 'EN_COURS' ? 'bg-[#1E4AA8] text-[#1E4AA8]' : 'bg-emerald-500 text-emerald-500'}`}>
            </div>
            <span className="font-black text-[#0B1C3F] uppercase tracking-tighter text-sm">{title}</span>
         </div>
         <span className="bg-slate-50 text-slate-400 font-black text-[10px] px-2.5 py-1 rounded-lg border border-slate-100 relative z-10 transition-all group-hover:bg-white">
            {items.length} TÂCHES
         </span>
         {/* Decorative background shape */}
         <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-opacity-5 ${statusId === 'A_FAIRE' ? 'bg-slate-500' : statusId === 'EN_COURS' ? 'bg-[#1E4AA8]' : 'bg-emerald-500'} group-hover:scale-150 transition-transform duration-700`} />
      </div>
      
      <div className="flex flex-col gap-4 min-h-[500px] p-2 rounded-3xl bg-slate-50/50 border-2 border-dashed border-slate-200/60 transition-colors hover:border-slate-300/60">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-slate-300 font-bold border-2 border-dashed border-slate-200 rounded-[32px] bg-white/40">
            <ListTodo size={40} className="mb-4 opacity-20" />
            <p className="text-[10px] uppercase tracking-widest">Zone de dépôt vide</p>
          </div>
        ) : (
          items.map(task => (
            <Card key={task.id} className="group hover:shadow-2xl hover:shadow-[#1E4AA8]/10 transition-all duration-500 border-slate-100 rounded-[28px] overflow-hidden bg-white active:scale-[0.98]">
              <Card.Content className="p-6">
                <div className="flex justify-between items-start mb-3">
                   <h4 className="font-black text-[#0B1C3F] text-sm leading-tight group-hover:text-[#1E4AA8] transition-colors">{task.titre}</h4>
                   <button 
                     onClick={() => handleDeleteTask(task.id)}
                     className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                     title="Supprimer la tâche"
                   >
                     <Trash2 size={14} />
                   </button>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">{task.description}</p>
                
                <div className="flex flex-wrap gap-1.5 mt-5">
                  {task.date_limite && (
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
                      <Clock size={12} className="text-[#1E4AA8]" />
                      {new Date(task.date_limite).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                  <div className="text-[10px] font-black text-[#1E4AA8] bg-blue-50 px-2.5 py-1.5 rounded-xl border border-blue-100 uppercase tracking-tighter">
                    {projects.find(p => p.id === task.projet_id)?.titre || "Projet"}
                  </div>
                </div>
                
                <div className="mt-5 pt-5 border-t border-slate-50 flex items-center gap-3">
                   <div className="flex-1 relative">
                      <select 
                        className="w-full appearance-none text-[10px] font-black uppercase tracking-wider bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-slate-600 outline-none focus:ring-4 focus:ring-[#1E4AA8]/5 focus:border-[#1E4AA8]/30 transition-all cursor-pointer"
                        value={task.statut}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      >
                        <option value="A_FAIRE">À faire</option>
                        <option value="EN_COURS">En cours</option>
                        <option value="TERMINE">Terminé</option>
                        <option value="BLOQUE">Bloqué</option>
                      </select>
                   </div>
                </div>
              </Card.Content>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout pageTitle="Mes Tâches & Suivi">
        <div className="flex justify-center items-center h-[60vh]">
          <Loader size="lg" text="Chargement de vos tâches..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Mes Tâches & Suivi">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0B1C3F] flex items-center gap-3">
              <ListTodo className="h-8 w-8 text-[#1E4AA8]" />
              Tableau Kanban
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Gérez votre avancement et organisez votre travail par projet.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
             <span className="text-[10px] uppercase font-black text-slate-400 ml-2">Filtrer par projet :</span>
             <select 
               className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-[#1E4AA8] outline-none focus:ring-2 focus:ring-[#1E4AA8]/10"
               value={selectedProjectId}
               onChange={(e) => setSelectedProjectId(e.target.value)}
             >
               <option value="all">Tous les projets</option>
               {projects.map(p => (
                 <option key={p.id} value={p.id}>{p.titre}</option>
               ))}
             </select>
          </div>
        </header>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border-2 border-red-200 bg-red-50 p-5 text-red-700 shadow-sm">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm font-bold leading-6">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Column 
            title="À Faire" 
            colorClass="text-slate-400 border-slate-200" 
            items={filteredTasks.filter(t => t.statut === 'A_FAIRE')}
            statusId="A_FAIRE" 
          />
          <Column 
            title="En Cours" 
            colorClass="text-[#1E4AA8] border-[#1E4AA8]" 
            items={filteredTasks.filter(t => t.statut === 'EN_COURS' || t.statut === 'EN_ATTENTE')}
            statusId="EN_COURS" 
          />
          <Column 
            title="Terminé" 
            colorClass="text-green-500 border-green-500" 
            items={filteredTasks.filter(t => t.statut === 'TERMINE')}
            statusId="TERMINE" 
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
