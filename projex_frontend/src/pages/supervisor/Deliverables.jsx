import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Clock, 
  User, 
  Folder,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import supervisorService from '../../services/supervisorService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { formatFileUrl } from '../../utils/file';

export default function SupervisorDeliverables() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deliverables, setDeliverables] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const loadDeliverables = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await supervisorService.getDeliverables();
      setDeliverables(res.deliverables || []);
    } catch (err) {
      console.error('Erreur chargement livrables:', err);
      setError('Impossible de charger les livrables.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliverables();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Voulez-vous approuver ce livrable ?')) return;
    try {
      await supervisorService.approveDeliverable(id);
      loadDeliverables();
    } catch (err) {
      alert('Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Raison du rejet :');
    if (reason === null) return;
    try {
      await supervisorService.rejectDeliverable(id, reason);
      loadDeliverables();
    } catch (err) {
      alert('Erreur lors du rejet');
    }
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Suivi des Livrables">
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader size="lg" text="Chargement de vos documents..." />
        </div>
      </DashboardLayout>
    );
  }

  const filteredDeliverables = deliverables.filter(d => {
    const matchesSearch = 
      d.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.projet_titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.nom + ' ' + d.prenom).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'ALL' || d.statut === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout pageTitle="Suivi des Livrables">
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#0B1C3F] tracking-tight">
              Gestion des <span className="text-[#1E4AA8]">Livrables</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium max-w-lg">
              Suivez et évaluez les documents déposés par vos étudiants pour leurs projets respectifs.
            </p>
          </div>
        </header>

        {error && (
          <div className="flex items-start gap-4 rounded-[2rem] border-2 border-red-200 bg-red-50 p-6 text-red-700">
            <AlertCircle className="h-6 w-6 shrink-0" />
            <p className="font-bold">{error}</p>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-100">
           <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl w-full md:w-96 border border-slate-100">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Chercher par titre, projet ou étudiant..." 
                className="bg-transparent border-none outline-none text-sm font-medium w-full text-slate-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           
           <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {['ALL', 'SOUMIS', 'VALIDE', 'REJETE'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    filterStatus === status 
                      ? 'bg-[#1E4AA8] text-white shadow-lg shadow-blue-900/20' 
                      : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'
                  }`}
                >
                  {status === 'ALL' ? 'Tous' : status}
                </button>
              ))}
           </div>
        </div>

        {/* Deliverables Grid/Table */}
        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                   <th className="px-8 py-6">Document & Projet</th>
                   <th className="px-8 py-6">Étudiant</th>
                   <th className="px-8 py-6 text-center">Statut</th>
                   <th className="px-8 py-6 text-center">Version</th>
                   <th className="px-8 py-6 text-right">Date de Dépôt</th>
                   <th className="px-8 py-6 text-right outline-none">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {filteredDeliverables.length === 0 ? (
                   <tr>
                     <td colSpan="6" className="px-8 py-20 text-center">
                       <div className="flex flex-col items-center justify-center opacity-20">
                         <FileText size={64} className="mb-4" />
                         <p className="font-black text-xl">Aucun livrable trouvé</p>
                       </div>
                     </td>
                   </tr>
                 ) : (
                   filteredDeliverables.map((item) => (
                     <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                       <td className="px-8 py-6">
                         <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E4AA8] flex items-center justify-center">
                             <FileText size={24} />
                           </div>
                           <div className="overflow-hidden max-w-[250px]">
                             <p className="font-black text-[#0B1C3F] truncate">{item.titre}</p>
                             <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                               <Folder size={12} className="shrink-0" />
                               <span className="truncate">{item.projet_titre}</span>
                             </div>
                           </div>
                         </div>
                       </td>
                       <td className="px-8 py-6 text-orange-400">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                             {item.prenom?.[0]}{item.nom?.[0]}
                           </div>
                           <span className="text-sm font-bold text-slate-600">{item.prenom} {item.nom}</span>
                         </div>
                       </td>
                       <td className="px-8 py-6 text-center">
                         <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                           item.statut === 'VALIDE' ? 'bg-emerald-100 text-emerald-700' :
                           item.statut === 'REJETE' ? 'bg-red-100 text-red-700' :
                           'bg-amber-100 text-amber-700 shadow-sm'
                         }`}>
                           {item.statut === 'VALIDE' && <CheckCircle2 size={12} />}
                           {item.statut === 'REJETE' && <XCircle size={12} />}
                           {item.statut === 'SOUMIS' && <Clock size={12} />}
                           {item.statut}
                         </span>
                       </td>
                       <td className="px-8 py-6 text-center">
                          <span className="text-xs font-black text-slate-300">v{item.version_num}</span>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className="text-xs font-bold text-slate-500">{new Date(item.submitted_at).toLocaleDateString('fr-FR')}</div>
                          <div className="text-[10px] font-medium text-slate-300 tracking-tighter italic">Il y a {Math.floor((new Date() - new Date(item.submitted_at)) / (1000 * 60 * 60 * 24))} jours</div>
                       </td>
                       <td className="px-8 py-6 text-right">
                         <div className="flex justify-end items-center gap-2">
                            <a 
                              href={formatFileUrl(item.file_path)} 
                              target="_blank" 
                              rel="noreferrer"
                              className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-[#1E4AA8] hover:bg-blue-50 transition-all"
                              title="Télécharger"
                            >
                              <Download size={20} />
                            </a>
                            {item.statut === 'SOUMIS' && (
                              <>
                                <button 
                                  onClick={() => handleApprove(item.id)}
                                  className="p-2.5 bg-emerald-50 text-emerald-500 rounded-xl hover:bg-emerald-100 transition-all"
                                  title="Approuver"
                                >
                                  <CheckCircle2 size={20} />
                                </button>
                                <button 
                                  onClick={() => handleReject(item.id)}
                                  className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"
                                  title="Rejeter"
                                >
                                  <XCircle size={20} />
                                </button>
                              </>
                            )}
                         </div>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
        </Card>

      </div>
    </DashboardLayout>
  );
}
