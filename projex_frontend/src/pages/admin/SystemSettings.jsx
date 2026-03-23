import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import adminService from '../../services/adminService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import { Settings, Calendar, Tag, ShieldCheck, Plus, History as HistoryIcon, Clock, Trash2, CheckSquare, FileText, Archive } from 'lucide-react';

export default function SystemSettings() {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [periods, setPeriods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const [newPeriod, setNewPeriod] = useState({ nom: '', debut: '', fin: '' });
  const [newCategory, setNewCategory] = useState({ nom: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [pRes, cRes, lRes] = await Promise.all([
        adminService.getPeriods(),
        adminService.getCategories(),
        adminService.getAuditLogs(50)
      ]);
      setPeriods(pRes.periods || []);
      setCategories(cRes.categories || []);
      setAuditLogs(lRes.logs || []);
    } catch (err) {
      setError("Erreur lors du chargement des paramètres");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePeriod = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await adminService.createPeriod(newPeriod);
      setNewPeriod({ nom: '', debut: '', fin: '' });
      loadData();
    } catch (err) {
      alert("Erreur lors de la création de la période");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await adminService.createCategory({ label: newCategory.nom });
      setNewCategory({ nom: '' });
      loadData();
    } catch (err) {
      alert("Erreur lors de la création de la catégorie");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePeriod = async (periodId, currentStatus) => {
    try {
      await adminService.togglePeriod(periodId, !currentStatus);
      loadData();
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    }
  };
  const handleArchivePeriod = async (periodId) => {
    if (!window.confirm("Voulez-vous vraiment clore et archiver cette période ? Tous les projets en cours seront marqués comme TERMINÉS.")) return;
    try {
      setIsSubmitting(true);
      await adminService.archivePeriod(periodId);
      loadData();
    } catch (err) {
      alert("Erreur lors de l'archivage");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePeriod = async (periodId) => {
    if (!window.confirm("Supprimer cette période ?")) return;
    try {
      await adminService.deletePeriod(periodId);
      loadData();
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Supprimer cette catégorie ?")) return;
    try {
      await adminService.deleteCategory(categoryId);
      loadData();
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader size="lg" text="Chargement des paramètres système..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        <header>
          <h1 className="text-3xl font-bold text-[#0B1C3F] flex items-center gap-3">
            <Settings className="h-8 w-8 text-[#1E4AA8]" />
            Configuration Système
          </h1>
          <p className="text-slate-500 mt-2">
            Gérez les périodes académiques, les catégories de projets et consultez les logs d'audit.
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Périodes Académiques */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-[#1E4AA8]" />
              <h2 className="text-xl font-bold text-[#0B1C3F]">Périodes Académiques</h2>
            </div>
            
            <Card className="border border-slate-200">
              <form onSubmit={handleCreatePeriod} className="p-4 bg-slate-50 rounded-t-xl border-b border-slate-200 space-y-4">
                <Input 
                  label="Nom (ex: 2024-2025)" 
                  value={newPeriod.nom} 
                  onChange={(e) => setNewPeriod({...newPeriod, nom: e.target.value})}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input type="date" label="Début" value={newPeriod.debut} onChange={(e) => setNewPeriod({...newPeriod, debut: e.target.value})} required />
                  <Input type="date" label="Fin" value={newPeriod.fin} onChange={(e) => setNewPeriod({...newPeriod, fin: e.target.value})} required />
                </div>
                <Button type="submit" icon={Plus} className="w-full" loading={isSubmitting}>Ajouter la période</Button>
              </form>
              <div className="divide-y divide-slate-100">
                {periods.map(p => (
                  <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="font-bold text-[#0B1C3F] flex items-center gap-2">
                        {p.nom}
                        {Number(p.actif) === 1 ? (
                          <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">Actif</span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">Inactif</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">Du {new Date(p.date_debut).toLocaleDateString('fr-FR')} au {new Date(p.date_fin).toLocaleDateString('fr-FR')}</div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleTogglePeriod(p.id, Number(p.actif) === 1)}
                        className={`p-2 rounded-lg transition-colors ${Number(p.actif) === 1 ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100'}`}
                        title={Number(p.actif) === 1 ? "Désactiver" : "Activer"}
                      >
                        <CheckSquare className="h-4 w-4" />
                      </button>
                      {Number(p.actif) === 1 && (
                        <button 
                          onClick={() => handleArchivePeriod(p.id)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Archiver (clôturer la période)"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeletePeriod(p.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Catégories de Projets */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-bold text-[#0B1C3F]">Catégories de Projets</h2>
            </div>

            <Card className="border border-slate-200">
              <form onSubmit={handleCreateCategory} className="p-4 bg-slate-50 rounded-t-xl border-b border-slate-200 flex gap-2 items-end">
                <div className="flex-1">
                  <Input 
                    label="Nouvelle Catégorie" 
                    placeholder="ex: Développement Web"
                    value={newCategory.nom}
                    onChange={(e) => setNewCategory({nom: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" icon={Plus} loading={isSubmitting}>Ajouter</Button>
              </form>
              <div className="p-4 flex flex-wrap gap-3">
                {categories.map(c => (
                  <div key={c.id} className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg group transition-all hover:pr-1">
                    <span className="text-sm font-semibold">{c.label || c.nom}</span>
                    <button 
                      onClick={() => handleDeleteCategory(c.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-purple-200 rounded text-purple-600 transition-all"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {categories.length === 0 && <p className="text-slate-400 text-sm italic w-full text-center py-4">Aucune catégorie définie.</p>}
              </div>
            </Card>
          </section>
        </div>

        {/* Maintenance Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-[#0B1C3F]">Opérations de Maintenance</h2>
          </div>
          <Card className="border border-slate-200">
             <Card.Content className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-start gap-4">
                      <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600">
                         <ShieldCheck size={24} />
                      </div>
                      <div>
                         <h3 className="font-bold text-slate-800">Sauvegarde de sécurité</h3>
                         <p className="text-sm text-slate-500">Générez manuellement un point de restauration de la base de données.</p>
                      </div>
                      <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50" onClick={async () => {
                         const res = await adminService.backupDatabase();
                         alert(res.message);
                         loadData();
                      }}>
                         Démarrer le backup
                      </Button>
                   </div>

                   <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-start gap-4">
                      <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#1E4AA8]">
                         <FileText className="h-6 w-6" />
                      </div>
                      <div>
                         <h3 className="font-bold text-slate-800">Rapport de Synthèse</h3>
                         <p className="text-sm text-slate-500">Générez un rapport PDF global de tous les projets et notes de la période.</p>
                      </div>
                      <Button variant="outline" className="border-[#1E4AA8] text-[#1E4AA8] hover:bg-blue-50" onClick={async () => {
                         const res = await adminService.generateGlobalReport();
                         alert(res.message);
                         loadData();
                      }}>
                         Générer le rapport
                      </Button>
                   </div>
                </div>
             </Card.Content>
          </Card>
        </section>

        {/* Audit Logs */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <HistoryIcon className="h-5 w-5 text-slate-600" />
            <h2 className="text-xl font-bold text-[#0B1C3F]">Journal d'activité (Logs d'audit)</h2>
          </div>

          <Card className="overflow-hidden border border-slate-200 shadow-sm">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2 text-slate-600">
               <ShieldCheck size={18} />
               <span className="text-sm font-bold uppercase tracking-wider">Activité récente du système</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/50 text-slate-500 font-semibold text-xs border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3">Utilisateur</th>
                    <th className="px-6 py-3">Action</th>
                    <th className="px-6 py-3">Détails</th>
                    <th className="px-6 py-3 text-right">Date / Heure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map(log => {
                    const details = log.details ? JSON.parse(log.details) : null;
                    const getActionColor = (action) => {
                       if (action.includes('CREATE') || action.includes('ACTIVATE') || action.includes('APPROVE')) return 'bg-green-100 text-green-700';
                       if (action.includes('DELETE') || action.includes('REJECT')) return 'bg-red-100 text-red-700';
                       return 'bg-blue-100 text-blue-700';
                    };
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#0B1C3F] flex items-center gap-2">
                             {log.prenom} {log.nom}
                          </div>
                          <div className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full inline-block mt-1 ${
                            log.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                            log.role?.includes('ENCADREUR') ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {log.role}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${getActionColor(log.action)}`}>
                            {log.action?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[11px] text-slate-600 max-w-[400px]">
                            <span className="font-bold text-slate-400 mr-2">[{log.entity} #{log.entity_id}]</span>
                            {details ? Object.entries(details).map(([key, val]) => (
                              <span key={key} className="inline-block bg-white border border-slate-100 px-1.5 py-0.5 rounded mr-1 mb-1 text-[10px]">
                                <span className="text-slate-400">{key}:</span> {String(val)}
                              </span>
                            )) : <span className="italic text-slate-300">Aucun détail supplémentaire</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end gap-0.5">
                             <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                <Clock size={10} /> {new Date(log.created_at).toLocaleDateString('fr-FR')}
                             </div>
                             <div className="text-[10px] font-black text-slate-300 uppercase leading-none">
                                {new Date(log.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                             </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-slate-500 italic">
                        Aucun log d'activité pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}
