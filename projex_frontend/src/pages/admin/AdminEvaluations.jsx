import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import adminService from '../../services/adminService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { 
  Award, ShieldCheck, Search, Filter, 
  Download, Calculator
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminEvaluations() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [evaluations, setEvaluations] = useState({ academiques: [], professionnelles: [] });
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('acad'); // 'acad' or 'pro'

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await adminService.getAllEvaluations();
        setEvaluations(res);
      } catch {
        setError('Impossible de charger les évaluations');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  const filterEvals = (list) => {
    if (!search) return list;
    return list.filter(e => 
      e.student_nom?.toLowerCase().includes(search.toLowerCase()) ||
      e.student_prenom?.toLowerCase().includes(search.toLowerCase()) ||
      e.projet_titre?.toLowerCase().includes(search.toLowerCase())
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader size="lg" text="Chargement des évaluations..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#0B1C3F] flex items-center gap-3">
              <Award className="h-8 w-8 text-[#1E4AA8]" />
              Suivi des Évaluations
            </h1>
            <p className="text-slate-500 mt-1">Consultez et exportez les résultats académiques et professionnels.</p>
          </div>
          <Button icon={Download} className="bg-[#1B3A4B] hover:bg-[#122834]">Exporter les notes</Button>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Stats Grid Quick View */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="bg-blue-600 text-white border-none shadow-lg shadow-blue-200/50">
              <Card.Content className="p-6">
                 <div className="flex justify-between items-start">
                    <div>
                       <p className="text-blue-100 font-bold text-xs uppercase tracking-widest mb-1">Total Académique</p>
                       <h3 className="text-3xl font-black">{evaluations.academiques.length}</h3>
                    </div>
                    <Award size={32} className="text-blue-200/50" />
                 </div>
              </Card.Content>
           </Card>
           <Card className="bg-emerald-600 text-white border-none shadow-lg shadow-emerald-200/50">
              <Card.Content className="p-6">
                 <div className="flex justify-between items-start">
                    <div>
                       <p className="text-emerald-100 font-bold text-xs uppercase tracking-widest mb-1">Total Professionnel</p>
                       <h3 className="text-3xl font-black">{evaluations.professionnelles.length}</h3>
                    </div>
                    <ShieldCheck size={32} className="text-emerald-200/50" />
                 </div>
              </Card.Content>
           </Card>
           <Card className="bg-slate-800 text-white border-none shadow-lg shadow-slate-200/50">
              <Card.Content className="p-6">
                 <div className="flex justify-between items-start">
                    <div>
                       <p className="text-slate-300 font-bold text-xs uppercase tracking-widest mb-1">Moyenne Globale</p>
                       <h3 className="text-3xl font-black">
                          {evaluations.academiques.length > 0 
                            ? (evaluations.academiques.reduce((acc, curr) => acc + curr.note, 0) / evaluations.academiques.length).toFixed(2)
                            : '-'
                          }
                       </h3>
                    </div>
                    <Calculator size={32} className="text-slate-400/50" />
                 </div>
              </Card.Content>
           </Card>
        </div>

        {/* Filters & Tabs */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
              <button 
                onClick={() => setTab('acad')}
                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'acad' ? 'bg-white text-[#1E4AA8] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Académique
              </button>
              <button 
                onClick={() => setTab('pro')}
                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'pro' ? 'bg-white text-[#1E4AA8] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Professionnel
              </button>
           </div>

           <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher un étudiant ou un projet..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1E4AA8] focus:border-transparent outline-none transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        {/* Evaluations List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
           <table className="w-full text-left text-sm border-collapse">
              <thead>
                 <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-tighter">Étudiant</th>
                    <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-tighter">Projet</th>
                    <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-tighter text-center">Score</th>
                    <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-tighter text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {tab === 'acad' ? (
                   filterEvals(evaluations.academiques).length > 0 ? (
                     filterEvals(evaluations.academiques).map((e) => (
                       <tr key={e.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4 font-bold text-[#0B1C3F]">
                             <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs ring-2 ring-white">
                                   {e.student_prenom[0]}{e.student_nom[0]}
                                </div>
                                <span>{e.student_prenom} {e.student_nom}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <Link to={`/admin/projects/${e.projet_id}`} className="font-bold text-slate-700 hover:text-[#1E4AA8] transition-colors truncate max-w-[300px] block">
                                {e.projet_titre}
                             </Link>
                             <p className="text-[10px] text-slate-400 font-bold uppercase overflow-hidden">Évalué le {new Date(e.created_at).toLocaleDateString()}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                             <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-black text-xs border border-blue-100">
                                {e.note}/20
                             </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <Link to={`/admin/projects/${e.projet_id}`}>
                                <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                   Détails
                                </Button>
                             </Link>
                          </td>
                       </tr>
                     ))
                   ) : (
                     <tr><td colSpan="4" className="p-12 text-center text-slate-400 italic">Aucune note académique trouvée.</td></tr>
                   )
                 ) : (
                  filterEvals(evaluations.professionnelles).length > 0 ? (
                    filterEvals(evaluations.professionnelles).map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50 transition-colors group">
                         <td className="px-6 py-4 font-bold text-[#0B1C3F]">
                            <div className="flex items-center gap-3">
                               <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs ring-2 ring-white">
                                  {e.student_prenom[0]}{e.student_nom[0]}
                               </div>
                               <span>{e.student_prenom} {e.student_nom}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <Link to={`/admin/projects/${e.projet_id}`} className="font-bold text-slate-700 hover:text-[#1E4AA8] transition-colors truncate max-w-[300px] block">
                               {e.projet_titre}
                            </Link>
                            <p className="text-[10px] text-slate-400 font-bold uppercase overflow-hidden">Audit pro le {new Date(e.created_at).toLocaleDateString()}</p>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-black text-xs border border-emerald-100">
                               {e.moyenne_pro ? (e.moyenne_pro * 4).toFixed(1) : '-'}/20
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <Link to={`/admin/projects/${e.projet_id}`}>
                               <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  Détails
                               </Button>
                            </Link>
                         </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" className="p-12 text-center text-slate-400 italic">Aucune évaluation pro trouvée.</td></tr>
                  )
                 )}
              </tbody>
           </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
