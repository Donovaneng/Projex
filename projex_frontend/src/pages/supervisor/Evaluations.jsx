import { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Star, 
  Users, 
  AlertTriangle, 
  Eye, 
  Award, 
  Plus, 
  CheckCircle2, 
  TrendingUp,
  Search,
  Filter,
  Download,
  Calendar,
  ChevronRight,
  MessageSquare,
  History as HistoryIcon,
  Check,
  FolderKanban,
  FileText
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { formatFileUrl } from '../../utils/file';
import DashboardLayout from '../../components/layout/DashboardLayout';
import supervisorService from '../../services/supervisorService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

export default function SupervisorEvaluations() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [evaluations, setEvaluations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [competences, setCompetences] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEval, setNewEval] = useState({
    projet_id: '',
    etudiant_id: '',
    note: '',
    commentaire: '',
    items: [] // Pour évaluation pro
  });

  const isPro = user?.role === 'ENCADREUR_PRO';

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [evalsRes, projRes, compsRes] = await Promise.all([
        supervisorService.getEvaluations(),
        supervisorService.getProjects(),
        isPro ? supervisorService.getCompetences() : Promise.resolve({ competences: [] })
      ]);
      const evalsData = evalsRes.evaluations || evalsRes || [];
      const projsData = projRes.projects || projRes || [];
      
      setEvaluations(Array.isArray(evalsData) ? evalsData : []);
      setProjects(Array.isArray(projsData) ? projsData : []);
      if (compsRes.competences) {
        setCompetences(compsRes.competences);
        // Initialiser les items de l'éval avec un score de 3 par défaut
        setNewEval(prev => ({
          ...prev,
          items: compsRes.competences.map(c => ({ competence_id: c.id, score: 3, libelle: c.libelle }))
        }));
      }
    } catch (err) {
      console.error('Erreur chargement données superviseur:', err);
      setError('Impossible de charger les données.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateEval = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (isPro) {
        await supervisorService.createProfessionalEvaluation(newEval);
      } else {
        await supervisorService.createAcademicEvaluation(newEval);
      }
      setIsModalOpen(false);
      setNewEval({ 
        projet_id: '', 
        etudiant_id: '', 
        note: '', 
        commentaire: '',
        items: competences.map(c => ({ competence_id: c.id, score: 3, libelle: c.libelle }))
      });
      loadData();
    } catch (err) {
      console.error(err);
      alert('Erreur: ' + (err.error || 'Impossible d\'enregistrer l\'évaluation.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader size="lg" text="Assemblage de l'historique..." />
        </div>
      </DashboardLayout>
    );
  }

  const filteredEvals = evaluations.filter(e => 
    (e.etudiant_prenom + ' ' + e.etudiant_nom).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.projet_titre || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgScore = evaluations.length > 0
    ? (evaluations.reduce((acc, e) => acc + (parseFloat(e.note) || 0), 0) / evaluations.length).toFixed(1)
    : '0.0';

  return (
    <DashboardLayout pageTitle="Évaluations du Projet">
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#0B1C3F] tracking-tight">
              Analyse des <span className="text-[#1E4AA8]">Performances</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium max-w-lg">
              Centralisez tous vos feedbacks et suivez l'évolution académique de votre cohorte.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-2xl border-slate-200 font-bold px-6">
               <Download size={18} className="mr-2" /> Export PDF
            </Button>
            <Button 
              className="bg-[#1E4AA8] hover:bg-[#0B1C3F] rounded-2xl font-black px-8 shadow-xl shadow-blue-900/10" 
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={20} className="mr-2" /> Nouvelle Note
            </Button>
          </div>
        </header>

        {error && (
          <div className="flex items-start gap-4 rounded-[2rem] border-2 border-red-200 bg-red-50 p-6 text-red-700">
            <AlertTriangle className="h-6 w-6 shrink-0" />
            <p className="font-bold">{error}</p>
          </div>
        )}

        {/* Intelligence Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <Card className="border-none bg-gradient-to-br from-[#0B1C3F] to-[#1E4AA8] text-white rounded-[2.5rem] shadow-2xl shadow-blue-900/20 overflow-hidden relative">
              <Card.Content className="p-8 relative z-10">
                 <div className="flex justify-between items-start">
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Moyenne de Cohorte</p>
                     <div className="flex items-end gap-2">
                        <span className="text-5xl font-black tracking-tighter">{avgScore}</span>
                        <span className="text-xl font-bold opacity-40 mb-1">/20</span>
                     </div>
                   </div>
                   <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl">
                     <Award size={32} />
                   </div>
                 </div>
                 <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    <TrendingUp size={14} /> +0.5 pts vs le mois dernier
                 </div>
              </Card.Content>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full" />
           </Card>

           <Card className="border-none bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex flex-col justify-center">
              <Card.Content className="p-8 flex items-center justify-between">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Evaluations Clôturées</p>
                    <div className="text-4xl font-black text-[#0B1C3F]">{evaluations.length}</div>
                 </div>
                 <div className="p-5 bg-blue-50 text-[#1E4AA8] rounded-3xl">
                    <ClipboardCheck size={32} />
                 </div>
              </Card.Content>
           </Card>

           <Card className="border-none bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex flex-col justify-center">
              <Card.Content className="p-8 flex items-center justify-between">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Étudiants Suivis</p>
                    <div className="text-4xl font-black text-[#0B1C3F]">{projects.length}</div>
                 </div>
                 <div className="p-5 bg-indigo-50 text-indigo-600 rounded-3xl">
                    <Users size={32} />
                 </div>
              </Card.Content>
           </Card>
        </div>

        {/* Data Table Section */}
        <section className="space-y-6">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-[#0B1C3F] flex items-center gap-3">
                 <HistoryIcon size={24} className="text-[#1E4AA8]" />
                 Dernièrement Attribuées
              </h2>
              <div className="flex items-center gap-3 bg-white p-2 border border-slate-100 rounded-2xl shadow-sm w-full md:w-80">
                 <Search size={18} className="text-slate-400 ml-2" />
                 <input 
                  type="text" 
                  placeholder="Chercher un étudiant ou projet..." 
                  className="bg-transparent border-none outline-none text-sm font-medium w-full text-slate-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
           </div>

           <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                     <th className="px-8 py-6">Étudiant</th>
                     <th className="px-8 py-6">Contexte Projet</th>
                     <th className="px-8 py-6 text-center">Score</th>
                     <th className="px-8 py-6">Attribué le</th>
                     <th className="px-8 py-6 text-right">Analyse</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {filteredEvals.length === 0 ? (
                     <tr>
                       <td colSpan="5" className="px-8 py-20 text-center">
                         <div className="flex flex-col items-center justify-center opacity-20">
                           <Star size={64} className="mb-4" />
                           <p className="font-black text-xl">Aucune donnée correspondante</p>
                         </div>
                       </td>
                     </tr>
                   ) : (
                     filteredEvals.map((evalItem) => (
                       <tr key={evalItem.id} className="hover:bg-slate-50/50 transition-colors group">
                         <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#1E4AA8] flex items-center justify-center font-black">
                               {evalItem.etudiant_prenom?.[0]}{evalItem.etudiant_nom?.[0]}
                             </div>
                             <div>
                               <p className="font-black text-[#0B1C3F] group-hover:text-[#1E4AA8] transition-colors">{evalItem.etudiant_prenom} {evalItem.etudiant_nom}</p>
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Profil Étudiant</span>
                             </div>
                           </div>
                         </td>
                         <td className="px-8 py-6">
                           <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                             <FolderKanban size={14} className="text-slate-300" />
                             {evalItem.projet_titre}
                           </div>
                         </td>
                          <td className="px-8 py-6 text-center">
                            {evalItem.note !== 'N/A' ? (
                              <span className={`inline-flex items-center justify-center w-16 h-10 text-lg font-black rounded-2xl ${
                                parseFloat(evalItem.note) >= 16 ? 'bg-emerald-100 text-emerald-700' :
                                parseFloat(evalItem.note) >= 10 ? 'bg-blue-100 text-blue-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {evalItem.note}
                              </span>
                            ) : (
                              <div className="flex gap-1 justify-center">
                                {evalItem.items?.slice(0, 3).map((it, idx) => (
                                  <div key={idx} className="w-2 h-6 bg-blue-100 rounded-full overflow-hidden relative" title={it.libelle}>
                                    <div 
                                      className="absolute bottom-0 left-0 w-full bg-blue-600 transition-all" 
                                      style={{ height: `${(it.score / 5) * 100}%` }} 
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase">
                               <Calendar size={12} />
                               {new Date(evalItem.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            </div>
                         </td>
                         <td className="px-8 py-6 text-right">
                           <div className="flex justify-end gap-2 outline-none">
                              {evalItem.commentaire && (
                                <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-[#1E4AA8] hover:bg-blue-50 transition-all cursor-help relative group/tip">
                                  <MessageSquare size={18} />
                                  <div className="absolute right-0 bottom-full mb-4 hidden group-hover/tip:block w-64 p-4 bg-[#0B1C3F] text-white text-xs font-medium rounded-2xl shadow-2xl z-20 pointer-events-none">
                                     <div className="absolute bottom-[-6px] right-4 w-3 h-3 bg-[#0B1C3F] rotate-45" />
                                     {evalItem.commentaire}
                                  </div>
                                </div>
                              )}
                              <Button variant="ghost" size="sm" className="rounded-xl hover:bg-slate-100">
                                 <ChevronRight size={18} />
                              </Button>
                           </div>
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             </div>
           </Card>
        </section>

        {/* Modal Premium Creation */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => !isSubmitting && setIsModalOpen(false)}
          title={null}
          maxWidth="max-w-xl"
          padding="none"
        >
          <div className="bg-[#0B1C3F] p-10 text-white relative overflow-hidden">
             <h2 className="text-3xl font-black relative z-10">Nouvelle <span className="text-[#1E4AA8]">Évaluation</span></h2>
             <p className="text-blue-100/60 font-medium mt-2 relative z-10">
               {isPro 
                 ? "Évaluez l'intégration en milieu pro et le comportement de l'étudiant." 
                 : "Attribuez une note pour ce cycle académique basée sur la rigueur technique."}
             </p>
             <Star size={120} className="absolute -right-10 -bottom-10 text-white/5 opacity-50 rotate-12" />
          </div>

          <form onSubmit={handleCreateEval} className="p-10 space-y-8 bg-white">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sélection du Projet</label>
                <select
                  className="w-full bg-slate-50 border border-slate-100 rounded-[1.25rem] px-6 py-4 text-sm font-bold text-[#0B1C3F] outline-none focus:ring-4 focus:ring-blue-100 transition-all appearance-none cursor-pointer"
                  value={newEval.projet_id}
                  onChange={(e) => {
                    const p = projects.find(proj => proj.id == e.target.value);
                    setNewEval({...newEval, projet_id: e.target.value, etudiant_id: p?.etudiant_id || ''});
                  }}
                  required
                >
                  <option value="">Cliquer pour choisir...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.titre} — {p.etudiant_nom}</option>
                  ))}
                </select>
             </div>

             <div className={`p-4 rounded-2xl border-2 border-dashed ${isPro ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-blue-50 border-blue-100 text-blue-800'} text-[11px] font-bold leading-relaxed`}>
                {isPro 
                  ? "Note : En tant que Pro, concentrez-vous sur l'autonomie, la communication et la ponctualité de l'étudiant." 
                  : "Note : En tant qu'Académique, privilégiez la pertinence de la solution et la qualité de la documentation technique."}
             </div>

             {newEval.projet_id && (
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Livrables du Projet</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {projects.find(p => p.id == newEval.projet_id)?.livrables?.length > 0 ? (
                      projects.find(p => p.id == newEval.projet_id).livrables.map(l => (
                        <div key={l.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText size={14} className="text-[#1E4AA8] shrink-0" />
                            <span className="text-xs font-bold text-[#0B1C3F] truncate">{l.titre}</span>
                          </div>
                          <a 
                            href={formatFileUrl(l.file_path)} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-1.5 text-[#1E4AA8] hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Download size={14} />
                          </a>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Aucun livrable déposé pour ce projet.</p>
                    )}
                  </div>
               </div>
             )}

              {!isPro ? (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Note / 20</label>
                    <input 
                      type="number"
                      step="0.5"
                      min="0"
                      max="20"
                      placeholder="0.0"
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-[1.25rem] px-6 py-5 text-2xl font-black text-[#0B1C3F] outline-none"
                      value={newEval.note}
                      onChange={(e) => setNewEval({...newEval, note: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center text-xs text-slate-400 font-medium bg-slate-50/50 p-4 rounded-[1.25rem] border border-dashed border-slate-200">
                    * Saisie par incréments de 0.5 points acceptée.
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grille de Compétences (Score 1-5)</label>
                  <div className="grid grid-cols-1 gap-4">
                    {newEval.items.map((item, idx) => (
                      <div key={item.competence_id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-sm font-bold text-[#0B1C3F]">{item.libelle}</span>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(score => (
                            <button
                              key={score}
                              type="button"
                              onClick={() => {
                                const newItems = [...newEval.items];
                                newItems[idx].score = score;
                                setNewEval({...newEval, items: newItems});
                              }}
                              className={`w-8 h-8 rounded-lg font-black text-xs transition-all ${
                                item.score === score 
                                  ? 'bg-[#1E4AA8] text-white shadow-lg shadow-blue-900/20' 
                                  : 'bg-white text-slate-400 hover:text-[#1E4AA8]'
                              }`}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{isPro ? 'Commentaire de synthèse' : 'Observations'}</label>
                 <textarea 
                   rows={3}
                   placeholder="Feedback constructif pour l'étudiant..."
                   required
                   className="w-full bg-slate-50 border border-slate-100 rounded-[1.25rem] p-6 text-sm font-medium outline-none"
                   value={newEval.commentaire}
                   onChange={(e) => setNewEval({...newEval, commentaire: e.target.value})}
                 />
              </div>

             <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1 rounded-2xl py-6 font-bold" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Annuler</Button>
                <Button type="submit" className="flex-[2] bg-[#1E4AA8] hover:bg-[#0B1C3F] rounded-2xl py-6 font-black shadow-xl shadow-blue-900/10" loading={isSubmitting} disabled={isSubmitting || !newEval.projet_id}>
                   Déposer l'évaluation
                </Button>
             </div>
          </form>
        </Modal>

      </div>
    </DashboardLayout>
  );
}
