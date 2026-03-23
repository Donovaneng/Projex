import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import studentService from '../../services/studentService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { FileText, UploadCloud, CheckCircle, AlertTriangle, Clock, MessageCircle, Edit2 } from 'lucide-react';
import { formatFileUrl } from '../../utils/file';

export default function StudentDeliverables() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deliverables, setDeliverables] = useState([]);
  
  // Projects list for the dropdown
  const [projects, setProjects] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Discussion / Comments state
  const [selectedLivrable, setSelectedLivrable] = useState(null);
  const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const [newDeliverable, setNewDeliverable] = useState({
    projet_id: '',
    titre: '',
    description: '',
    file: null
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [delivRes, projRes] = await Promise.all([
        studentService.getDeliverables().catch(() => ({ deliverables: [] })),
        studentService.getProjects().catch(() => ({ projects: [] }))
      ]);

      setDeliverables(delivRes.deliverables || delivRes || []);
      setProjects(projRes.projects || projRes || []);

    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Impossible de charger vos livrables.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUploadDeliverable = async (e) => {
    e.preventDefault();
    if (!newDeliverable.file || !newDeliverable.projet_id) {
      alert("Veuillez remplir tous les champs obligatoires (Projet, Fichier).");
      return;
    }

    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('projet_id', newDeliverable.projet_id);
      formData.append('titre', newDeliverable.titre);
      formData.append('description', newDeliverable.description);
      formData.append('fichier', newDeliverable.file);

      await studentService.uploadDeliverable(formData);
      
      setIsModalOpen(false);
      setNewDeliverable({ projet_id: '', titre: '', description: '', file: null });
      loadData();
    } catch (err) {
      console.error(err);
      alert('Erreur: ' + (err.error || 'Impossible de déposer le livrable.'));
    } finally {
      setIsUploading(false);
    }
  };

  const openDiscussion = async (deliv) => {
    try {
      setSelectedLivrable(deliv);
      setIsDiscussionOpen(true);
      const res = await studentService.getDeliverableComments(deliv.id);
      setComments(res.comments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await studentService.addDeliverableComment(selectedLivrable.id, newComment);
      setNewComment('');
      const res = await studentService.getDeliverableComments(selectedLivrable.id);
      setComments(res.comments || []);
    } catch (err) {
      alert("Erreur lors de l'envoi du commentaire");
    }
  };

  const openEditModal = (deliv) => {
    setIsEditMode(true);
    setSelectedLivrable(deliv);
    setNewDeliverable({
      projet_id: deliv.project_id,
      titre: deliv.titre,
      description: deliv.description || '',
      file: null
    });
    setIsModalOpen(true);
  };

  const handleUpdateDeliverable = async (e) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      await studentService.updateDeliverable(selectedLivrable.id, {
        titre: newDeliverable.titre,
        description: newDeliverable.description
      });
      setIsModalOpen(false);
      setIsEditMode(false);
      loadData();
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    } finally {
      setIsUploading(false);
    }
  };

  const StatusBadge = ({ stat }) => {
    switch (stat) {
      case 'VALIDE':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 tracking-wider">VALIDÉ</span>;
      case 'REJETE':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 tracking-wider">REJETÉ</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 tracking-wider">EN ATTENTE</span>;
    }
  };

  const handleDeleteDeliverable = async (delivId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce livrable ?")) return;
    try {
      await studentService.deleteDeliverable(delivId);
      loadData();
    } catch (err) {
      alert(err.error || "Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader size="lg" text="Chargement de vos livrables..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Mes Livrables">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0B1C3F] flex items-center gap-3">
              <FileText className="h-8 w-8 text-[#1E4AA8]" />
              Mes Livrables
            </h1>
            <p className="text-slate-500 mt-2">
              Déposez vos travaux finaux et consultez leur état de validation.
            </p>
          </div>
          
          <Button 
            className="bg-[#1E4AA8] hover:bg-[#153476]" 
            icon={UploadCloud}
            onClick={() => setIsModalOpen(true)}
          >
            Déposer un livrable
          </Button>
        </header>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm leading-6">{error}</p>
          </div>
        )}

        {deliverables.length === 0 ? (
          <Card padding="xl" className="text-center border-dashed border-2 border-slate-200 shadow-none bg-slate-50 pb-16 pt-12">
             <UploadCloud className="h-16 w-16 text-slate-300 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-slate-600 mb-1">Aucun livrable déposé</h3>
             <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
               Vous n'avez pas encore soumis de fichiers dans le cadre de vos projets.
             </p>
             <Button onClick={() => setIsModalOpen(true)} icon={UploadCloud} variant="outline">
               Créer mon premier dépôt
             </Button>
          </Card>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Titre & Description</th>
                    <th className="px-6 py-4">Projet</th>
                    <th className="px-6 py-4">Date de dépôt</th>
                    <th className="px-6 py-4 text-center">Statut</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deliverables.map((deliv) => (
                    <tr key={deliv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${deliv.statut === 'VALIDE' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            {deliv.statut === 'VALIDE' ? <CheckCircle size={18} /> : <FileText size={18} />}
                          </div>
                          <div>
                            <p className="font-bold text-[#0B1C3F] max-w-[200px] truncate">{deliv.titre}</p>
                            <p className="text-xs text-slate-500 max-w-[200px] truncate">{deliv.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {deliv.projet_titre || "Inconnu"}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {deliv.submitted_at ? new Date(deliv.submitted_at).toLocaleDateString('fr-FR') : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge stat={deliv.statut} />
                      </td>
                       <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                           <button 
                             onClick={() => openDiscussion(deliv)}
                             className="p-1.5 text-slate-400 hover:text-[#1E4AA8] hover:bg-blue-50 rounded-lg transition-colors"
                             title="Discuter"
                           >
                              <MessageCircle size={16} />
                           </button>
                           <button 
                             onClick={() => openEditModal(deliv)}
                             className="p-1.5 text-slate-400 hover:text-[#1E4AA8] hover:bg-blue-50 rounded-lg transition-colors"
                             title="Modifier"
                           >
                              <Edit2 size={16} />
                           </button>
                           <a 
                             href={formatFileUrl(deliv.file_path)} 
                             download 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="p-1.5 text-slate-400 hover:text-[#1E4AA8] hover:bg-blue-50 rounded-lg transition-colors"
                             title="Télécharger"
                           >
                             <UploadCloud size={16} className="rotate-180" />
                           </a>
                           <button 
                             onClick={() => handleDeleteDeliverable(deliv.id)}
                             className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                             title="Supprimer"
                           >
                             <AlertTriangle size={16} />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal de Dépôt / Édition */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => !isUploading && (setIsModalOpen(false), setIsEditMode(false))}
          title={isEditMode ? "Modifier le livrable" : "Soumettre un nouveau livrable"}
        >
          <form onSubmit={isEditMode ? handleUpdateDeliverable : handleUploadDeliverable} className="space-y-4">
            
            {!isEditMode && (
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Sélectionner un Projet <span className="text-red-500">*</span></label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#1E4AA8]/20 focus:border-[#1E4AA8]/50 transition-all font-medium"
                  value={newDeliverable.projet_id}
                  onChange={(e) => setNewDeliverable({...newDeliverable, projet_id: e.target.value})}
                  required
                >
                  <option value="">-- Choisir un projet --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.titre}</option>
                  ))}
                </select>
              </div>
            )}

            <Input 
              label="Titre du fichier/livrable"
              placeholder="Ex: CDC_Version_Finale"
              required
              value={newDeliverable.titre}
              onChange={(e) => setNewDeliverable({...newDeliverable, titre: e.target.value})}
            />
            
            <Input 
              label="Description (Optionnelle)"
              type="textarea"
              rows={3}
              placeholder="Note éventuelle pour votre encadreur..."
              value={newDeliverable.description}
              onChange={(e) => setNewDeliverable({...newDeliverable, description: e.target.value})}
            />
            
            {!isEditMode && (
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Fichier Joint <span className="text-red-500">*</span></label>
                <input
                  type="file"
                  required
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#1E4AA8] hover:file:bg-blue-100 transition-colors"
                  onChange={(e) => setNewDeliverable({...newDeliverable, file: e.target.files[0]})}
                />
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
                onClick={() => { setIsModalOpen(false); setIsEditMode(false); }}
                disabled={isUploading}
              >
                Annuler
              </button>
              <Button 
                type="submit" 
                className="w-full bg-[#1E4AA8] hover:bg-[#153476]"
                disabled={isUploading || (!isEditMode && (!newDeliverable.projet_id || !newDeliverable.titre || !newDeliverable.file))}
                loading={isUploading}
              >
                {isEditMode ? "Enregistrer les modifications" : "Soumettre le livrable"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal de Discussion */}
        <Modal
          isOpen={isDiscussionOpen}
          onClose={() => setIsDiscussionOpen(false)}
          title={`Discussion : ${selectedLivrable?.titre}`}
          size="lg"
        >
          <div className="flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 rounded-xl mb-4">
              {comments.length === 0 ? (
                <p className="text-center text-slate-400 mt-10 italic">Aucun commentaire pour le moment.</p>
              ) : (
                comments.map(c => (
                  <div key={c.id} className={`flex flex-col ${c.author_id === selectedLivrable.etudiant_id ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm ${
                      c.author_id === selectedLivrable.etudiant_id 
                        ? 'bg-[#1E4AA8] text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                    }`}>
                      <p className="font-bold mb-1 text-[10px] opacity-80 uppercase tracking-tighter">
                        {c.prenom} {c.nom} • {new Date(c.created_at).toLocaleString()}
                      </p>
                      <p>{c.commentaire}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handlePostComment} className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E4AA8]/20"
                placeholder="Votre message..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button type="submit" className="bg-[#1E4AA8]" icon={MessageCircle} disabled={!newComment.trim()}>
                Envoyer
              </Button>
            </form>
          </div>
        </Modal>

      </div>
    </DashboardLayout>
  );
}
