import { useState, useEffect } from 'react';
import { 
  Users, 
  FolderKanban, 
  ClipboardCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  FileSearch,
  MessageSquare,
  ArrowRight,
  History as HistoryIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import supervisorService from '../../services/supervisorService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';

export default function SupervisorDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    projects: [],
    students: [],
    pendingDeliverables: [],
    proposals: []
  });

  const loadSupervisorData = async () => {
    try {
      setLoading(true);
      const [projRes, studentsRes, pendingRes, proposalsRes] = await Promise.all([
        supervisorService.getProjects(),
        supervisorService.getStudents(),
        supervisorService.getDeliverablesToReview(),
        supervisorService.getProposals()
      ]);

      setData({
        projects: projRes.projects || [],
        students: studentsRes.students || [],
        pendingDeliverables: pendingRes.deliverables || [],
        proposals: proposalsRes.proposals || []
      });
    } catch (err) {
      console.error("Supervisor Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupervisorData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <Loader size="lg" text="Chargement de votre espace premium..." />
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    { 
      label: "Étudiants", 
      value: data.students.length, 
      icon: Users, 
      color: "text-blue-600", 
      bg: "bg-blue-50",
      trend: "+2 ce semestre"
    },
    { 
      label: "Projets Actifs", 
      value: data.projects.length, 
      icon: FolderKanban, 
      color: "text-indigo-600", 
      bg: "bg-indigo-50",
      trend: "Tous dans les délais"
    },
    { 
      label: "À Valider", 
      value: data.pendingDeliverables.length, 
      icon: ClipboardCheck, 
      color: "text-amber-600", 
      bg: "bg-amber-50",
      trend: "Action requise"
    },
    { 
      label: "Propositions", 
      value: data.proposals.length, 
      icon: FileSearch, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50",
      trend: "Nouveaux sujets"
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#0B1C3F] tracking-tight">
              Espace <span className="text-[#1E4AA8]">Encadreur</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Pilotage et suivi de l'excellence académique.</p>
          </div>
          <div className="flex items-center gap-3">
              <Link to="/supervisor/evaluations">
                <Button variant="outline" className="rounded-xl border-slate-200 shadow-sm font-bold">
                  <HistoryIcon className="mr-2 h-4 w-4" /> Historique
                </Button>
              </Link>
             <Button className="rounded-xl bg-[#1E4AA8] hover:bg-[#1E4AA8]/90 shadow-lg shadow-blue-900/10 font-bold">
               Nouveau Message
             </Button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="border-none shadow-xl shadow-slate-200/50 hover:scale-[1.02] transition-all duration-300">
              <Card.Content className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{stat.trend}</span>
                </div>
                <p className="text-sm font-bold text-slate-500">{stat.label}</p>
                <p className="text-3xl font-black text-[#0B1C3F] mt-1">{stat.value}</p>
              </Card.Content>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed: Active Projects & Progress */}
          <div className="lg:col-span-2 space-y-8">
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-[#0B1C3F] flex items-center gap-3">
                  <TrendingUp className="text-[#1E4AA8]" size={24} />
                  Avancement des Projets
                </h2>
                <Link to="/supervisor/projects" className="text-sm font-bold text-[#1E4AA8] hover:underline">Voir tout</Link>
              </div>

              {data.projects.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2 border-slate-200 shadow-none bg-slate-50/50 rounded-3xl">
                  <FolderKanban className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <p className="text-slate-500 font-medium">Aucun projet actif pour le moment.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.projects.slice(0, 4).map(project => (
                    <Card key={project.id} className="group hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 border-slate-100 overflow-hidden relative">
                       <div className="absolute top-0 right-0 p-4">
                          <div className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-full uppercase">Actif</div>
                       </div>
                       <Card.Content className="p-6">
                          <h3 className="font-bold text-lg text-[#0B1C3F] group-hover:text-[#1E4AA8] transition-colors line-clamp-1 pr-12">{project.titre}</h3>
                          <p className="text-sm text-slate-500 mt-2 font-medium">Étu: {project.etudiant_nom}</p>
                          
                          <div className="mt-6 space-y-2">
                            <div className="flex justify-between text-xs font-black uppercase tracking-tighter">
                              <span className="text-slate-400">Progression Globale</span>
                              <span className="text-[#1E4AA8]">75%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 w-[75%] rounded-full shadow-inner shadow-black/5" />
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                             <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold">JD</div>
                                <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-bold">+1</div>
                             </div>
                             <Link to={`/supervisor/projects`}>
                               <Button variant="ghost" size="sm" className="font-bold text-[#1E4AA8] group/btn">
                                  Détails <ArrowRight size={14} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                               </Button>
                             </Link>
                          </div>
                       </Card.Content>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Proposals Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-[#0B1C3F] flex items-center gap-3">
                  <FileSearch className="text-emerald-500" size={24} />
                  Nouveaux Sujets
                </h2>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1 rounded-full">{data.proposals.length} en attente</span>
              </div>

              {data.proposals.length === 0 ? (
                <Card className="p-8 text-center border-slate-100 shadow-sm bg-white rounded-3xl">
                  <p className="text-slate-400 font-medium italic">Aucune nouvelle proposition à examiner.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {data.proposals.map(prop => (
                    <Card key={prop.id} className="border-slate-100 hover:border-emerald-200 transition-colors shadow-none hover:shadow-lg hover:shadow-emerald-900/5">
                      <Card.Content className="p-5 flex justify-between items-center bg-white rounded-2xl">
                        <div>
                          <h4 className="font-bold text-[#0B1C3F]">{prop.titre}</h4>
                          <p className="text-xs text-slate-500 mt-1 font-medium">Soumis par : {prop.etudiant_prenom} {prop.etudiant_nom}</p>
                        </div>
                        <Link to="/supervisor/proposals">
                          <Button variant="outline" size="sm" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl">
                            Examiner
                          </Button>
                        </Link>
                      </Card.Content>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Feed: Notifications & Pending Actions */}
          <div className="space-y-8">
            <section className="space-y-6">
              <h2 className="text-xl font-black text-[#0B1C3F] flex items-center gap-2">
                <AlertCircle className="text-amber-500" size={20} />
                Urgences
              </h2>
              <div className="space-y-4">
                {data.pendingDeliverables.length === 0 ? (
                  <Card className="p-6 text-center border-slate-100 shadow-sm bg-white rounded-3xl">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
                    <p className="text-xs text-slate-500 font-bold">Tout est à jour !</p>
                  </Card>
                ) : (
                  data.pendingDeliverables.map(deliv => (
                    <Card key={deliv.id} className="border-l-4 border-l-amber-400 shadow-lg shadow-slate-200/50">
                      <Card.Content className="p-4 bg-white">
                        <p className="font-bold text-sm text-[#0B1C3F] line-clamp-1">{deliv.titre}</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-wider">{deliv.prenom} {deliv.nom}</p>
                        <div className="mt-4 flex gap-2">
                           <Link to="/supervisor/evaluations" className="flex-1">
                             <Button size="xs" className="w-full font-black text-[10px] uppercase tracking-widest bg-amber-500 hover:bg-amber-600 rounded-lg">Évaluer</Button>
                           </Link>
                           <Button variant="ghost" size="xs" className="p-2 rounded-lg text-slate-400 hover:text-red-500"><MessageSquare size={14} /></Button>
                        </div>
                      </Card.Content>
                    </Card>
                  ))
                )}
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1C3F] to-[#1E4AA8] p-8 rounded-[40px] text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
               <div className="relative z-10">
                 <h3 className="text-xl font-black tracking-tight">Besoin d'aide ?</h3>
                 <p className="text-blue-100/70 text-sm mt-2 font-medium">Consultez le guide de l'encadreur pour maîtriser tous les outils PROJEX.</p>
                 <Button className="mt-6 bg-white text-[#1E4AA8] hover:bg-blue-50 font-black rounded-2xl w-full py-6">Voir la documentation</Button>
               </div>
               {/* Decorative circles */}
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-700" />
               <div className="absolute -top-10 -left-10 w-24 h-24 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-700 delay-100" />
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
