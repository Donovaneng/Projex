import { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  Users, 
  CalendarDays, 
  Eye, 
  AlertTriangle, 
  TrendingUp, 
  History as HistoryIcon, 
  MessageSquare, 
  CheckCircle2, 
  FileText,
  Clock,
  ArrowRight,
  ChevronRight,
  Star
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import supervisorService from '../../services/supervisorService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import ProjectChat from '../../components/project/ProjectChat';

export default function SupervisorProjects() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectDetailsLoading, setProjectDetailsLoading] = useState(false);
  const [timeline, setTimeline] = useState([]);

  // Evaluation States
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);
  const [competences, setCompetences] = useState([]);
  const [evaluationData, setEvaluationData] = useState({
    note: '',
    commentaire: '',
    items: [] // For professional evaluation
  });

  const { user } = useAuth();
  const isPro = user?.role === 'ENCADREUR_PRO';

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await supervisorService.getProjects();
      const data = res.projects || res || [];
      setProjects(Array.isArray(data) ? data : []);
      
      if (isPro) {
        const compRes = await supervisorService.getCompetences();
        setCompetences(compRes.competences || []);
      }
    } catch (err) {
      console.error('Erreur chargement projets superviseur:', err);
      setError('Impossible de charger les projets supervisés.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const openProjectDetails = async (projectId) => {
    try {
      setProjectDetailsLoading(true);
      setIsModalOpen(true);
      const [detailsRes, timelineRes] = await Promise.all([
        supervisorService.getProjectDetails(projectId),
        supervisorService.getProjectTimeline(projectId)
      ]);
      setSelectedProject(detailsRes.project || detailsRes || null);
      setTimeline(timelineRes.timeline || []);
    } catch (err) {
      console.error(err);
      alert('Impossible de charger les détails de ce projet.');
      setIsModalOpen(false);
    } finally {
      setProjectDetailsLoading(false);
    }
  };

  const openEvalModal = (project) => {
    setSelectedProject(project);
    setEvaluationData({
      note: '',
      commentaire: '',
      items: competences.map(c => ({ competence_id: c.id, score: 3, appreciation: '', libelle: c.libelle }))
    });
    setIsEvalModalOpen(true);
  };

  const handleScoreChange = (compId, score) => {
    setEvaluationData(prev => ({
      ...prev,
      items: prev.items.map(item => item.competence_id === compId ? { ...item, score } : item)
    }));
  };

  const submitEvaluation = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingEval(true);
      const payload = {
        projet_id: selectedProject.id,
        etudiant_id: selectedProject.etudiant_id,
        note: evaluationData.note,
        commentaire: evaluationData.commentaire,
        items: evaluationData.items
      };

      if (isPro) {
        await supervisorService.createProfessionalEvaluation(payload);
      } else {
        await supervisorService.createAcademicEvaluation(payload);
      }
      
      alert('Évaluation enregistrée avec succès !');
      setIsEvalModalOpen(false);
    } catch (err) {
      console.error(err);
      alert(err.error || 'Erreur lors de l\'enregistrement de l\'évaluation.');
    } finally {
      setIsSubmittingEval(false);
    }
  };

  if (loading) {
// ... existing loader code ...
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader size="lg" text="Chargement de vos projets..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#0B1C3F] tracking-tight">
              Projets <span className="text-[#1E4AA8]">Supervisés</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Gérez, suivez et évaluez l'excellence académique de vos étudiants.
            </p>
          </div>
        </header>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border-2 border-red-200 bg-red-50 p-5 text-red-700 shadow-sm">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm font-bold leading-6">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.length === 0 ? (
            <div className="col-span-full pt-12 pb-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50">
              <FolderKanban className="h-20 w-20 text-slate-200 mb-6" />
              <h3 className="text-xl font-black text-slate-400">Aucun projet actif</h3>
              <p className="text-slate-400 text-sm mt-2 text-center max-w-sm font-medium">
                Vous n'avez pas encore d'étudiants assignés pour ce cycle.
              </p>
            </div>
          ) : (
            projects.map(project => (
              <Card key={project.id} className="group border-none shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 h-full flex flex-col rounded-[2rem] overflow-hidden">
                <Card.Content className="p-8 flex flex-col flex-1 bg-white">
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-blue-50 p-3 rounded-2xl text-[#1E4AA8]">
                      <FolderKanban size={24} />
                    </div>
                    <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-tighter">
                      {project.statut || 'En cours'}
                    </div>
                  </div>
                  
                  <h3 className="font-black text-2xl text-[#0B1C3F] leading-tight line-clamp-2 min-h-[4rem] group-hover:text-[#1E4AA8] transition-colors">
                    {project.titre}
                  </h3>
                  
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#0B1C3F] text-sm">
                        {project.etudiant_nom?.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Étudiant</p>
                        <p className="text-sm font-bold text-[#0B1C3F]">{project.etudiant_nom}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#1E4AA8]">
                         <CalendarDays size={18} />
                       </div>
                       <div>
                         <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Échéance</p>
                         <p className="text-sm font-bold text-[#0B1C3F]">
                           {project.date_fin ? new Date(project.date_fin).toLocaleDateString() : "Non définie"}
                         </p>
                       </div>
                    </div>
                  </div>

                  <div className="mt-8 space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase">
                       <span className="text-slate-400">Progression</span>
                       <span className="text-[#1E4AA8]">65%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-[#1E4AA8] w-[65%] rounded-full shadow-inner" />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-10">
                    <Button 
                      variant="outline" 
                      className="flex-1 rounded-2xl border-slate-200 font-bold py-6 group/btn"
                      onClick={() => openProjectDetails(project.id)}
                    >
                      Détails <ChevronRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                    <Button 
                      className="flex-1 rounded-2xl bg-[#0B1C3F] hover:bg-[#1E4AA8] font-bold py-6 shadow-lg shadow-blue-900/10"
                      onClick={() => openEvalModal(project)}
                    >
                      Évaluer
                    </Button>
                  </div>
                </Card.Content>
              </Card>
            ))
          )}
        </div>

        {/* Modal de Détails Premium */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={null}
          maxWidth="max-w-4xl"
          padding="none"
        >
          {projectDetailsLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <Loader size="lg" />
              <p className="text-slate-500 font-bold animate-pulse">Assemblage des données...</p>
            </div>
          ) : selectedProject ? (
            <div className="flex flex-col md:flex-row min-h-[600px] overflow-hidden rounded-3xl">
              {/* Left Sidebar: Info */}
              <div className="w-full md:w-80 bg-slate-50 p-8 border-r border-slate-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#1E4AA8] text-white flex items-center justify-center font-black shadow-lg shadow-blue-600/20">
                    {selectedProject.titre[0]}
                  </div>
                  <div>
                    <h3 className="font-black text-[#0B1C3F] line-clamp-1">{selectedProject.titre}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID #{selectedProject.id}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Statut</p>
                    <span className="px-3 py-1 bg-[#1E4AA8] text-white text-[10px] font-black rounded-lg uppercase">
                      {selectedProject.statut || 'Actif'}
                    </span>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Étudiant</p>
                    <Card className="shadow-none border-slate-200">
                       <Card.Content className="p-3 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1E4AA8] flex items-center justify-center text-xs font-bold">
                            {selectedProject.etudiant_nom?.[0]}
                          </div>
                          <p className="text-xs font-bold text-[#0B1C3F] truncate">{selectedProject.etudiant_nom}</p>
                       </Card.Content>
                    </Card>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Progression</p>
                    <div className="h-2 bg-slate-200 rounded-full mb-1">
                      <div className="h-full bg-emerald-500 w-[70%] rounded-full" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 text-right">70% complété</p>
                  </div>
                </div>
              </div>

              {/* Main Content: Description & Timeline */}
              <div className="flex-1 p-10 bg-white overflow-y-auto max-h-[80vh]">
                 <section className="mb-10">
                   <h4 className="text-2xl font-black text-[#0B1C3F] mb-6 flex items-center gap-3">
                     <FileText className="text-[#1E4AA8]" /> Description
                   </h4>
                   <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 text-slate-600 font-medium leading-relaxed">
                     {selectedProject.description}
                   </div>
                 </section>

                 <section>
                   <h4 className="text-2xl font-black text-[#0B1C3F] mb-8 flex items-center gap-3">
                     <HistoryIcon className="text-[#1E4AA8]" /> Timeline du Projet
                   </h4>
                   
                   <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                     {timeline.length === 0 ? (
                       <p className="text-slate-400 italic">Aucune activité enregistrée.</p>
                     ) : (
                       timeline.map((item, idx) => (
                         <div key={idx} className="relative group/time">
                            <div className={`absolute -left-[29px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm ring-2 ${
                              item.type === 'LIVRABLE' ? 'ring-blue-500 bg-blue-500' :
                              item.type === 'EVALUATION' ? 'ring-emerald-500 bg-emerald-500' :
                              'ring-slate-300 bg-slate-300'
                            }`} />
                            <div>
                               <div className="flex justify-between items-start">
                                  <h5 className="font-black text-[#0B1C3F] text-sm group-hover/time:text-[#1E4AA8] transition-colors">{item.label}</h5>
                                  <span className="text-[10px] font-black text-slate-400 uppercase">{new Date(item.date).toLocaleDateString()}</span>
                               </div>
                               <p className="text-xs text-slate-500 mt-1 font-medium">
                                 {item.type === 'LIVRABLE' ? `Statut: ${item.meta}` : `Note: ${item.meta}/20`}
                               </p>
                            </div>
                         </div>
                       ))
                     )}
                   </div>
                 </section>

                 <section className="mt-12 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                    <ProjectChat projectId={selectedProject.id} currentUser={user} />
                 </section>
              </div>
            </div>
          ) : null}
        </Modal>
        
        {/* Modal d'Évaluation Premium */}
        <Modal
          isOpen={isEvalModalOpen}
          onClose={() => !isSubmittingEval && setIsEvalModalOpen(false)}
          title={null}
          maxWidth={isPro ? "max-w-3xl" : "max-w-xl"}
          padding="none"
        >
          <div className="bg-[#0B1C3F] p-8 text-white relative overflow-hidden">
             <div className="relative z-10">
               <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Session d'Évaluation</span>
               <h2 className="text-2xl font-black mt-1">
                 {selectedProject?.titre}
               </h2>
               <p className="text-blue-100/60 text-sm mt-3 font-medium">Attribuez une note et un feedback constructif à l'étudiant.</p>
             </div>
             <Star size={100} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
          </div>

          <form onSubmit={submitEvaluation} className="p-8 space-y-8 bg-white">
            {!isPro ? (
              // Academic Evaluation
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Note Digitale</p>
                     <input 
                      type="number"
                      step="0.25"
                      min="0"
                      max="20"
                      required
                      placeholder="0.00"
                      className="w-full bg-transparent text-3xl font-black text-[#0B1C3F] outline-none placeholder:text-slate-200"
                      value={evaluationData.note}
                      onChange={(e) => setEvaluationData({...evaluationData, note: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-xs text-slate-400 font-medium italic">
                      * La note doit être comprise entre 0 et 20. Elle sera visible par l'étudiant et l'administration.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                   <p className="text-[10px] font-black text-slate-400 uppercase ml-1">Appréciation Globale</p>
                   <textarea 
                    rows={5}
                    required
                    placeholder="Détaillez les points forts et les axes d'amélioration..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#1E4AA8]/10 transition-all"
                    value={evaluationData.commentaire}
                    onChange={(e) => setEvaluationData({...evaluationData, commentaire: e.target.value})}
                  />
                </div>
              </div>
            ) : (
              // Professional Evaluation (Competences)
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {evaluationData.items.map((item) => (
                    <div key={item.competence_id} className="p-6 border border-slate-100 rounded-3xl bg-slate-50/30 group hover:border-[#1E4AA8]/20 transition-all">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <span className="font-bold text-[#0B1C3F] text-sm group-hover:text-[#1E4AA8] transition-colors">{item.libelle}</span>
                        <div className="flex gap-1 bg-white p-1 rounded-xl shadow-inner uppercase">
                          {[0, 1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => handleScoreChange(item.competence_id, s)}
                              className={`w-9 h-9 rounded-lg text-xs font-black transition-all ${
                                item.score === s 
                                ? 'bg-[#1E4AA8] text-white shadow-lg shadow-blue-600/20' 
                                : 'text-slate-400 hover:bg-slate-50'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                   <p className="text-[10px] font-black text-slate-400 uppercase ml-1">Commentaires Pro</p>
                   <textarea 
                    rows={4}
                    placeholder="Remarques générales sur les soft skills et savoir-être..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#1E4AA8]/10 transition-all"
                    value={evaluationData.commentaire}
                    onChange={(e) => setEvaluationData({...evaluationData, commentaire: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 rounded-2xl border-slate-200 py-6 font-bold"
                onClick={() => setIsEvalModalOpen(false)}
                disabled={isSubmittingEval}
              >
                Plus tard
              </Button>
              <Button 
                type="submit" 
                className="flex-[2] rounded-2xl bg-[#1E4AA8] hover:bg-[#0B1C3F] py-6 font-black shadow-xl shadow-blue-900/10"
                disabled={isSubmittingEval}
                loading={isSubmittingEval}
              >
                Publier l'évaluation
              </Button>
            </div>
          </form>
        </Modal>

      </div>
    </DashboardLayout>
  );
}
