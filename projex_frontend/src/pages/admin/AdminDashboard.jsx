import { useState, useEffect } from "react";
import adminService from "../../services/adminService";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { Users, FolderKanban, AlertCircle, CheckCircle2, UserCheck, Edit3, ShieldAlert, Award, FileSpreadsheet, RefreshCcw, Calendar } from "lucide-react";
import { exportToExcel } from "../../utils/exportUtils";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, AreaChart, Area, Cell 
} from 'recharts';

const COLORS = ['#1E4AA8', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const StatCard = ({ title, value, subtext, icon: IconProp, color, textColor }) => (
  <Card className="border-slate-200 shadow-sm">
    <Card.Content className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          {IconProp && <IconProp className={`h-6 w-6 ${textColor}`} />}
        </div>
        <span className="text-2xl font-bold text-[#0B1C3F]">{value}</span>
      </div>
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
      {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
    </Card.Content>
  </Card>
);

import { useAuth } from "../../hooks/useAuth";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadStats = async (periodId = null) => {
    try {
      setLoading(true);
      const data = await adminService.getStats(periodId);
      setStats(data);
      setError("");
    } catch {
      setError("Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
    }
  };

  const loadPeriods = async () => {
    try {
      const res = await adminService.getPeriods();
      setPeriods(res.periods || []);
      const active = res.periods?.find(p => Number(p.actif) === 1);
      if (active) setSelectedPeriod(active.id);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (user) {
      loadPeriods();
      loadStats();
    }
  }, [user]);

  const handlePeriodChange = (e) => {
     const id = e.target.value === 'all' ? null : Number(e.target.value);
     setSelectedPeriod(id);
     loadStats(id);
  };

  const handleExcelExport = async () => {
    try {
      const res = await adminService.getAllEvaluations();
      if (!res || !res.academiques) return;
      
      const exportData = res.academiques.map(a => {
        const pro = res.professionnelles?.find(p => p.projet_id === a.projet_id && p.etudiant_id === a.etudiant_id);
        return {
          'Étudiant': `${a.student_prenom} ${a.student_nom}`,
          'Projet': a.projet_titre,
          'Note Académique': a.note,
          'Moyenne Pro': pro ? parseFloat(pro.moyenne_pro).toFixed(2) : 'N/A',
          'Commentaire Acad': a.commentaire,
          'Date': a.created_at ? new Date(a.created_at).toLocaleDateString() : 'N/A'
        };
      });
      exportToExcel(exportData, `Projex_Grades_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader size="lg" text="Chargement des données statistiques..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Tableau de Bord">
      <div className="space-y-8 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0B1C3F]">Tableau de Bord</h1>
            <p className="text-slate-500 mt-1">Vue d'ensemble de l'activité du système PROJEX.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
             <Calendar className="h-4 w-4 text-[#1E4AA8] ml-2" />
             <select 
                className="bg-transparent border-none text-sm font-bold text-[#0B1C3F] focus:ring-0 cursor-pointer pr-8"
                value={selectedPeriod || 'all'}
                onChange={handlePeriodChange}
             >
                <option value="all">Toutes les périodes</option>
                {periods.map(p => (
                   <option key={p.id} value={p.id}>Période {p.nom || p.label}</option>
                ))}
             </select>
          </div>

          <div className="flex flex-wrap gap-3">
             <Button variant="outline" icon={RefreshCcw} onClick={() => loadStats(selectedPeriod)}>Actualiser</Button>
             <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" icon={FileSpreadsheet} onClick={adminService.exportProjectsCSV}>Export Projets (CSV)</Button>
             <Button className="bg-[#10B981] hover:bg-[#059669] text-white border-none" icon={Award} onClick={handleExcelExport}>Exporter les notes</Button>
          </div>
        </header>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">Erreur de chargement</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Étudiants" 
            value={stats?.users?.total || 0} 
            subtext={`${stats?.users?.active || 0} actifs, ${stats?.users?.pending || 0} en attente`}
            icon={Users} 
            color="bg-blue-600"
            textColor="text-blue-600"
          />
          <StatCard 
            title="Projets" 
            value={stats?.projects?.total || 0} 
            subtext={`${stats?.projects?.en_cours || 0} en cours, ${stats?.projects?.termine || 0} terminés`}
            icon={FolderKanban} 
            color="bg-purple-600"
            textColor="text-purple-600"
          />
          <StatCard 
            title="Livrables" 
            value={stats?.total_deliverables || 0} 
            subtext="Documents déposés au total"
            icon={Edit3} 
            color="bg-green-600"
            textColor="text-green-600"
          />
          <StatCard 
            title="Propositions" 
            value={stats?.projects?.en_attente || 0} 
            subtext="Projets en attente de validation"
            icon={AlertCircle} 
            color="bg-orange-600"
            textColor="text-orange-600"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <Card className="border-slate-200 min-w-0" padding="none">
             <Card.Header className="p-6 border-b border-slate-100 pb-2">
                <h2 className="text-lg font-bold text-[#0B1C3F]">Répartition des Projets</h2>
                <p className="text-xs text-slate-400 font-medium">Statut global des dossiers</p>
             </Card.Header>
              <Card.Content className="p-6">
                <div style={{ width: '100%', height: '350px', position: 'relative' }}>
                  {isMounted && stats && stats.projectDistribution && stats.projectDistribution.length > 0 ? (
                    <ResponsiveContainer key={`distribution-${stats.projectDistribution.length}`} width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={stats.projectDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={8}
                          dataKey="count"
                          nameKey="label"
                          stroke="none"
                          isAnimationActive={false}
                        >
                          {stats.projectDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[350px] text-slate-400 font-medium italic">
                       Aucune donnée de répartition disponible
                    </div>
                  )}
                </div>
              </Card.Content>
           </Card>

           <Card className="border-slate-200 min-w-0" padding="none">
             <Card.Header className="p-6 border-b border-slate-100 pb-2">
                <h2 className="text-lg font-bold text-[#0B1C3F]">Activité Mensuelle</h2>
                <p className="text-xs text-slate-400 font-medium">Nouveaux projets créés</p>
             </Card.Header>
              <Card.Content className="p-6">
                <div style={{ width: '100%', height: '350px', position: 'relative' }}>
                  {isMounted && stats && stats.monthlyActivity && stats.monthlyActivity.length > 0 ? (
                    <ResponsiveContainer key={`activity-${stats.monthlyActivity.length}`} width="100%" height={350}>
                      <AreaChart data={stats.monthlyActivity}>
                        <defs>
                          <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1E4AA8" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#1E4AA8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748B', fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748B', fontSize: 12 }}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#1E4AA8" 
                          strokeWidth={4}
                          fillOpacity={1} 
                          fill="url(#colorActivity)" 
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[350px] text-slate-400 font-medium italic">
                        Aucune activité mensuelle enregistrée
                    </div>
                  )}
                </div>
              </Card.Content>
           </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-slate-200 shadow-sm">
            <Card.Header className="border-b border-slate-100 p-6">
              <h2 className="text-lg font-bold text-[#0B1C3F] flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-[#1E4AA8]" />
                Inscriptions Récentes
              </h2>
            </Card.Header>
            <Card.Content className="p-0">
              <div className="divide-y divide-slate-100">
                {stats?.recent_users?.map((u, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-[#1E4AA8] flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/10">
                        {u.prenom ? u.prenom[0] : ''}{u.nom ? u.nom[0] : ''}
                      </div>
                      <div>
                        <p className="font-bold text-[#0B1C3F] text-sm">{u.prenom} {u.nom}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">{u.role}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                ))}
                {(!stats?.recent_users || stats.recent_users.length === 0) && (
                  <p className="p-8 text-center text-slate-400 italic text-sm">Aucune inscription récente.</p>
                )}
              </div>
            </Card.Content>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <Card.Header className="border-b border-slate-100 p-6">
              <h2 className="text-lg font-bold text-[#0B1C3F] flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Dépôts Récents
              </h2>
            </Card.Header>
            <Card.Content className="p-0">
              <div className="divide-y divide-slate-100">
                {stats?.recent_deliverables?.map((d, i) => (
                  <div key={i} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-[#0B1C3F] text-sm truncate max-w-[200px]">{d.titre}</p>
                        <p className="text-xs text-slate-500 italic">par {d.prenom} {d.nom}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        {d.submitted_at ? new Date(d.submitted_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
                {(!stats?.recent_deliverables || stats.recent_deliverables.length === 0) && (
                  <p className="p-8 text-center text-slate-400 italic text-sm">Aucun dépôt récent.</p>
                )}
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}