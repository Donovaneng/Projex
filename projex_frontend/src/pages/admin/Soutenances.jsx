import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import adminService from '../../services/adminService';
import reportService from '../../services/reportService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import { Calendar, Users, MapPin, GraduationCap, Plus, Trash2, Edit3, Save, X, Info, Clock, FileDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import DefenseCalendar from '../../components/calendar/DefenseCalendar';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminSoutenances() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [soutenances, setSoutenances] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    projet_id: '',
    date: '',
    salle: '',
    jury_membres: '', // External text notes
    jury: [] // Structured array of {user_id, external_name, role}
  });

  const [users, setUsers] = useState([]);
  const [memberToAdd, setMemberToAdd] = useState({ user_id: '', role: 'EXAMINATEUR', external_name: '' });

  const [editNote, setEditNote] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSoutenance, setSelectedSoutenance] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'

  const loadData = async () => {
    try {
      setLoading(true);
      const [sRes, pRes, uRes] = await Promise.all([
        adminService.getSoutenances(),
        adminService.getProjects(),
        adminService.getAllUsers().catch(() => ({ users: [] }))
      ]);
      setSoutenances(sRes.soutenances || []);
      // On ne garde que les projets terminés ou en cours pour la soutenance
      setProjects(pRes.projects?.filter(p => ['TERMINE', 'EN_COURS', 'CLOTURE'].includes(p.statut)) || []);
      // On garde les encadreurs pour le jury
      setUsers(uRes.users?.filter(u => ['ENCADREUR_ACAD', 'ENCADREUR_PRO'].includes(u.role)) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (modalMode === 'create') {
        await adminService.scheduleSoutenance({
          ...formData,
          admin_id: user.id
        });
        alert('Soutenance programmée !');
      } else {
        await adminService.updateSoutenance(selectedSoutenance.id, formData);
        alert('Soutenance mise à jour !');
      }
      setIsModalOpen(false);
      setFormData({ projet_id: '', date: '', salle: '', jury_membres: '', jury: [] });
      loadData();
      if (selectedSoutenance) setSelectedSoutenance(null);
    } catch (err) {
      alert("Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await adminService.updateSoutenance(id, data);
      setEditNote(null);
      loadData();
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette soutenance ?")) return;
    try {
      await adminService.deleteSoutenance(id);
      loadData();
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Organisation des Soutenances">
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader size="lg" text="Chargement du planning des soutenances..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Organisation des Soutenances">
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#0B1C3F] flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-[#1E4AA8]" />
              Gestion des Soutenances
            </h1>
            <p className="text-slate-500 mt-2">Planifiez et constituez les jurys pour les soutenances.</p>
          </div>
          {user?.role === 'ADMIN' && (
            <Button icon={Plus} onClick={() => {
              setModalMode('create');
              setFormData({ projet_id: '', date: '', salle: '', jury_membres: '', jury: [] });
              setIsModalOpen(true);
            }}>Programmer</Button>
          )}
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
           <div className="xl:col-span-3">
              <DefenseCalendar 
                soutenances={soutenances} 
                onSelectDate={(day) => {
                   setSelectedDay(day);
                   setModalMode('create');
                   setFormData({
                      projet_id: '',
                      date: format(day, "yyyy-MM-dd'T'HH:mm"),
                      salle: '',
                      jury_membres: '',
                      jury: []
                   });
                   setIsModalOpen(true);
                }}
                onSelectDefense={(def) => setSelectedSoutenance(def)}
              />
           </div>

           <div className="space-y-6">
              <AnimatePresence mode="wait">
                {selectedSoutenance ? (
                  <motion.div
                    key={selectedSoutenance.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Card className="border-[#1E4AA8]/20 shadow-xl shadow-blue-500/5 overflow-hidden rounded-[2rem]">
                       <div className="bg-[#1E4AA8] p-6 text-white">
                          <div className="flex justify-between items-start mb-4">
                             <div className="p-2 bg-white/10 rounded-xl">
                                <Info size={20} />
                             </div>
                             <button onClick={() => setSelectedSoutenance(null)} className="text-white/60 hover:text-white">
                                <X size={20} />
                             </button>
                          </div>
                          <h3 className="text-xl font-black leading-tight mb-2">{selectedSoutenance.projet_titre}</h3>
                          <p className="text-[10px] uppercase font-black tracking-widest text-white/60">Détails de la soutenance</p>
                       </div>
                       
                       <Card.Content className="p-6 space-y-6">
                          <div className="space-y-4">
                             <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                   <Users size={16} className="text-[#1E4AA8]" />
                                </div>
                                <div>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidat</p>
                                   <p className="text-sm font-bold text-[#0B1C3F]">{selectedSoutenance.prenom} {selectedSoutenance.nom}</p>
                                </div>
                             </div>

                             <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                   <MapPin size={16} className="text-[#1E4AA8]" />
                                </div>
                                <div>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lieu / Salle</p>
                                   <p className="text-sm font-bold text-[#0B1C3F]">{selectedSoutenance.salle || "Non définie"}</p>
                                </div>
                             </div>

                             <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                   <Clock size={16} className="text-[#1E4AA8]" />
                                </div>
                                <div>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Heure</p>
                                   <p className="text-sm font-bold text-[#0B1C3F]">{new Date(selectedSoutenance.date_soutenance).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</p>
                                </div>
                             </div>
                          </div>

                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Résultat Final</p>
                             <div className="text-3xl font-black text-center text-[#1E4AA8]">
                                {selectedSoutenance.note_finale ? `${selectedSoutenance.note_finale}/20` : "--/20"}
                             </div>
                             {selectedSoutenance.observations && (
                                <p className="text-[11px] text-slate-500 italic mt-3 text-center">"{selectedSoutenance.observations}"</p>
                             )}
                          </div>

                          <div className="space-y-4 pt-4 border-t border-slate-100">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Composition du Jury</p>
                             <div className="space-y-2">
                                {selectedSoutenance.jury && selectedSoutenance.jury.length > 0 ? (
                                   selectedSoutenance.jury.map((m, idx) => (
                                      <div key={idx} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-lg">
                                         <div className="flex flex-col">
                                            <span className="font-bold text-[#0B1C3F]">{m.prenom} {m.nom} {m.external_name}</span>
                                            <span className="text-[10px] text-[#1E4AA8] font-bold uppercase">{m.role}</span>
                                         </div>
                                      </div>
                                   ))
                                ) : (
                                   <p className="text-xs text-slate-400 italic font-medium">Aucun membre assigné ou : {selectedSoutenance.jury_membres}</p>
                                )}
                             </div>
                          </div>

                          {user?.role === 'ADMIN' && (
                            <div className="flex gap-2 pt-2">
                              <Button className="flex-1 rounded-xl bg-[#0B1C3F]" size="sm" icon={Edit3} onClick={() => {
                                setModalMode('edit');
                                setFormData({
                                  projet_id: selectedSoutenance.projet_id,
                                  date: format(new Date(selectedSoutenance.date_soutenance), "yyyy-MM-dd'T'HH:mm"),
                                  salle: selectedSoutenance.salle || '',
                                  jury_membres: selectedSoutenance.jury_membres || '',
                                  jury: selectedSoutenance.jury || []
                                });
                                setIsModalOpen(true);
                              }}>Modifier</Button>
                               <Button variant="outline" className="rounded-xl border-red-100 text-red-500 hover:bg-red-50" size="sm" icon={Trash2} onClick={() => handleDelete(selectedSoutenance.id)}>Supprimer</Button>
                               <Button 
                                 variant="outline" 
                                 className="rounded-xl border-blue-100 text-blue-600 hover:bg-blue-50" 
                                 size="sm" 
                                 icon={FileDown} 
                                 onClick={() => reportService.generateDefensePV(selectedSoutenance)}
                               >PV (PDF)</Button>
                             </div>
                          )}
                       </Card.Content>
                    </Card>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 p-8 text-center">
                     <div className="p-4 rounded-full bg-white mb-4 shadow-sm">
                        <Info className="text-slate-300" size={32} />
                     </div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Sélectionnez un événement pour voir les détails</p>
                  </div>
                )}
              </AnimatePresence>
           </div>
        </div>

        {/* Modal Programmation */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1C3F]/60 backdrop-blur-sm p-4">
            <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
              <Card.Header className="flex justify-between items-center border-b border-slate-100 p-6">
                <h2 className="text-xl font-bold text-[#0B1C3F]">Programmer une soutenance</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
              </Card.Header>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Projet</label>
                  <select 
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1E4AA8] outline-none"
                    value={formData.projet_id}
                    onChange={(e) => setFormData({...formData, projet_id: e.target.value})}
                    required
                  >
                    <option value="">Sélectionner un projet</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.titre} ({p.etudiant_prenom} {p.etudiant_nom})</option>
                    ))}
                  </select>
                </div>
                <Input 
                  type="datetime-local" 
                  label="Date et Heure" 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
                <Input 
                  label="Salle" 
                  placeholder="ex: Salle de conférence B" 
                  value={formData.salle}
                  onChange={(e) => setFormData({...formData, salle: e.target.value})}
                />
                <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <label className="text-xs font-bold text-slate-500 uppercase">Membres du Jury</label>
                  
                  <div className="flex gap-2">
                    <select 
                      className="flex-1 p-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1E4AA8] outline-none"
                      value={memberToAdd.user_id}
                      onChange={(e) => setMemberToAdd({...memberToAdd, user_id: e.target.value})}
                    >
                      <option value="">Choisir un membre...</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.prenom} {u.nom} ({u.role?.replace('ENCADREUR_', '')})</option>
                      ))}
                      <option value="EXTERNAL">-- Externe --</option>
                    </select>
                    
                    <select 
                      className="w-32 p-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1E4AA8] outline-none"
                      value={memberToAdd.role}
                      onChange={(e) => setMemberToAdd({...memberToAdd, role: e.target.value})}
                    >
                      <option value="PRESIDENT">Président</option>
                      <option value="RAPPORTEUR">Rapporteur</option>
                      <option value="EXAMINATEUR">Examinateur</option>
                      <option value="INVITE">Invité</option>
                    </select>

                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={() => {
                        if (!memberToAdd.user_id && !memberToAdd.external_name) return;
                        
                        const selectedProject = projects.find(p => p.id == formData.projet_id);
                        if (memberToAdd.role === 'PRESIDENT' && selectedProject) {
                           if (memberToAdd.user_id == selectedProject.encadreur_acad_id) {
                              alert("Attention : L'encadreur académique ne peut pas être le Président du jury.");
                              return;
                           }
                        }

                        const user = users.find(u => u.id == memberToAdd.user_id);
                        const newJury = [...formData.jury, {
                          user_id: memberToAdd.user_id === 'EXTERNAL' ? null : memberToAdd.user_id,
                          role: memberToAdd.role,
                          prenom: user ? user.prenom : '',
                          nom: user ? user.nom : '',
                          external_name: memberToAdd.user_id === 'EXTERNAL' ? memberToAdd.external_name : ''
                        }];
                        setFormData({...formData, jury: newJury});
                        setMemberToAdd({ user_id: '', role: 'EXAMINATEUR', external_name: '' });
                      }}
                      className="bg-[#0B1C3F]"
                    >Add</Button>
                  </div>

                  {memberToAdd.user_id === 'EXTERNAL' && (
                    <Input 
                      placeholder="Nom du membre externe"
                      value={memberToAdd.external_name}
                      onChange={(e) => setMemberToAdd({...memberToAdd, external_name: e.target.value})}
                    />
                  )}

                  <div className="space-y-2 mt-2">
                    {formData.jury.map((m, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-2 bg-white rounded-lg border border-slate-100">
                        <span className="font-bold">{m.prenom} {m.nom} {m.external_name} ({m.role})</span>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, jury: formData.jury.filter((_, i) => i !== idx)})}
                          className="text-red-500 hover:text-red-700"
                        ><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Commentaires / Notes Jury</label>
                  <textarea 
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1E4AA8] outline-none min-h-[60px]"
                    placeholder="Informations complémentaires..."
                    value={formData.jury_membres}
                    onChange={(e) => setFormData({...formData, jury_membres: e.target.value})}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" loading={isSubmitting} className="flex-1">Valider la planification</Button>
                  <Button variant="outline" onClick={() => setIsModalOpen(false)} type="button">Annuler</Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
