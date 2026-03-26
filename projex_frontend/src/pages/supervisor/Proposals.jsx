import { useState, useEffect } from 'react';
import { 
  FileSearch, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  MessageSquare,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import supervisorService from '../../services/supervisorService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';

export default function SupervisorProposals() {
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const res = await supervisorService.getProposals();
      setProposals(res.proposals || []);
    } catch (err) {
      // ignore
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, []);

  const handleAction = async (proposalId, action) => {
    if (!comment && action === 'REJECT') {
      alert('Veuillez ajouter un motif de rejet.');
      return;
    }

    try {
      setActionLoading(true);
      await supervisorService.handleProposal(proposalId, action, comment);
      setSelectedProposal(null);
      setComment('');
      loadProposals();
    } catch {
      alert('Erreur lors du traitement de la proposition.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <Loader size="lg" text="Chargement des propositions..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="flex items-center gap-4">
          <Link to="/supervisor/dashboard">
            <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0 hover:bg-slate-100">
              <ArrowLeft size={20} className="text-slate-600" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-[#0B1C3F] tracking-tight">Propositions de Projets</h1>
            <p className="text-slate-500 font-medium">Validez les nouveaux sujets soumis par les étudiants.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List Section */}
          <div className="lg:col-span-1 space-y-4">
            {proposals.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-2 border-slate-200 shadow-none">
                <p className="text-slate-400 font-bold">Aucune proposition en attente.</p>
              </Card>
            ) : (
              proposals.map(prop => (
                <Card 
                  key={prop.id} 
                  className={`cursor-pointer transition-all duration-300 border-2 ${selectedProposal?.id === prop.id ? 'border-[#1E4AA8] shadow-lg shadow-blue-900/10' : 'border-transparent hover:border-slate-200'}`}
                  onClick={() => {
                    setSelectedProposal(prop);
                    setComment('');
                  }}
                >
                  <Card.Content className="p-4">
                    <h4 className="font-bold text-[#0B1C3F] line-clamp-1">{prop.titre}</h4>
                    <p className="text-xs text-slate-500 mt-1 uppercase font-black tracking-wider">Par {prop.etudiant_prenom} {prop.etudiant_nom}</p>
                    <div className="mt-3 flex items-center gap-2">
                       <span className="text-[10px] bg-amber-100 text-amber-700 font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                         En attente
                       </span>
                       <span className="text-[10px] text-slate-400 font-bold">
                         {new Date(prop.created_at).toLocaleDateString()}
                       </span>
                    </div>
                  </Card.Content>
                </Card>
              ))
            )}
          </div>

          {/* Details Section */}
          <div className="lg:col-span-2">
            {!selectedProposal ? (
              <Card className="h-full flex flex-col items-center justify-center p-12 text-center border-slate-100 bg-slate-50/30">
                <FileSearch size={48} className="text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-400">Sélectionnez une proposition</h3>
                <p className="text-sm text-slate-400 max-w-xs mt-2 font-medium">Cliquez sur une carte à gauche pour examiner les détails du sujet.</p>
              </Card>
            ) : (
              <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden sticky top-8">
                <div className="bg-gradient-to-r from-[#0B1C3F] to-[#1E4AA8] p-8 text-white">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Détails du sujet</span>
                   <h2 className="text-2xl font-black mt-2 leading-tight">{selectedProposal.titre}</h2>
                   <div className="flex items-center gap-4 mt-6">
                      <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold">
                         {selectedProposal.etudiant_prenom[0]}{selectedProposal.etudiant_nom[0]}
                      </div>
                      <div>
                         <p className="text-sm font-bold">{selectedProposal.etudiant_prenom} {selectedProposal.etudiant_nom}</p>
                         <p className="text-xs opacity-60">Étudiant(e)</p>
                      </div>
                   </div>
                </div>
                
                <Card.Content className="p-8 space-y-8 bg-white">
                  <section>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-[#1E4AA8] mb-4">Description du projet</h5>
                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed font-medium">
                      {selectedProposal.description}
                    </div>
                  </section>

                  <section className="bg-slate-50 p-6 rounded-2xl space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Action & Feedback</h5>
                    <textarea 
                      className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#1E4AA8]/10 transition-all min-h-[120px]"
                      placeholder="Ajoutez vos recommandations, remarques ou motifs de rejet ici..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                    
                    <div className="flex gap-3 pt-2">
                       <Button 
                        className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold py-6 shadow-lg shadow-emerald-500/20"
                        onClick={() => handleAction(selectedProposal.id, 'APPROVE')}
                        disabled={actionLoading}
                       >
                         {actionLoading ? <Loader2 className="animate-spin" /> : <><CheckCircle className="mr-2" size={20} /> Valider le sujet</>}
                       </Button>
                       <Button 
                        variant="outline" 
                        className="flex-1 rounded-xl border-red-100 text-red-600 hover:bg-red-50 font-bold py-6"
                        onClick={() => handleAction(selectedProposal.id, 'REJECT')}
                        disabled={actionLoading}
                       >
                         {actionLoading ? <Loader2 className="animate-spin" /> : <><XCircle className="mr-2" size={20} /> Rejeter / Corriger</>}
                       </Button>
                    </div>
                  </section>
                </Card.Content>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
