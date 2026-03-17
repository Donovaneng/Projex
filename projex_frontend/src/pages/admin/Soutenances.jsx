import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import adminService from '../../services/adminService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import { Calendar, Users, MapPin, GraduationCap, Plus, Trash2, Edit3, Save, X, Info, Clock } from 'lucide-react';
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
    jury: ''
  });

  const [editNote, setEditNote] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSoutenance, setSelectedSoutenance] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sRes, pRes] = await Promise.all([
        adminService.getSoutenances(),
        adminService.getProjects()
      ]);
      setSoutenances(sRes.soutenances || []);
      // On ne garde que les projets terminés ou en cours pour la soutenance
      setProjects(pRes.projects?.filter(p => ['TERMINE', 'EN_COURS'].includes(p.statut)) || []);
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
      await adminService.scheduleSoutenance({
        ...formData,
        admin_id: user.id
      });
      setIsModalOpen(false);
      setFormData({ projet_id: '', date: '', salle: '', jury: '' });
      loadData();
    } catch (err) {
      alert("Erreur lors de la planification");
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
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader size="lg" text="Chargement du planning des soutenances..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#0B1C3F] flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-[#1E4AA8]" />
              Gestion des Soutenances
            </h1>
            <p className="text-slate-500 mt-2">Planifiez et évaluez les soutenances des étudiants.</p>
          </div>
          {user?.role === 'ADMIN' && (
            <Button icon={Plus} onClick={() => setIsModalOpen(true)}>Programmer une soutenance</Button>
          )}
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
           <div className="xl:col-span-3">
              <DefenseCalendar 
                soutenances={soutenances} 
                onSelectDate={(day) => {
                  setSelectedDay(day);
                  setFormData(prev => ({ ...prev, date: format(day, "yyyy-MM-dd'T'HH:mm") }));
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

                          {user?.role === 'ADMIN' && (
                            <div className="flex gap-2 pt-2">
                              <Button className="flex-1 rounded-xl bg-[#0B1C3F]" size="sm" icon={Edit3} onClick={() => {
                                setEditNote(selectedSoutenance.id);
                              }}>Noter</Button>
                              <Button variant="outline" className="rounded-xl border-red-100 text-red-500 hover:bg-red-50" size="sm" icon={Trash2} onClick={() => handleDelete(selectedSoutenance.id)}>Supprimer</Button>
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
                      <option key={p.id} value={p.id}>{p.titre} ({p.prenom_etudiant} {p.nom_etudiant})</option>
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
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Membres du Jury</label>
                  <textarea 
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1E4AA8] outline-none min-h-[80px]"
                    placeholder="Noms des membres, séparés par des virgules"
                    value={formData.jury}
                    onChange={(e) => setFormData({...formData, jury: e.target.value})}
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
