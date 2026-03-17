import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import adminService from '../../services/adminService';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import { FileText, Download, Clock, User, Folder } from 'lucide-react';
import { formatFileUrl } from '../../utils/file';

export default function AdminDeliverables() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deliverables, setDeliverables] = useState([]);

  useEffect(() => {
    const loadDeliverables = async () => {
      try {
        setLoading(true);
        const res = await adminService.getDeliverables();
        setDeliverables(res.deliverables || []);
      } catch (err) {
        setError("Erreur lors du chargement des livrables");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDeliverables();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader size="lg" text="Chargement de tous les livrables..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-[#0B1C3F] flex items-center gap-3">
            <FileText className="h-8 w-8 text-[#1E4AA8]" />
            Tous les Livrables
          </h1>
          <p className="text-slate-500 mt-2">
            Consultez et gérez l'ensemble des documents déposés par les étudiants.
          </p>
        </header>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        <Card className="overflow-hidden border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Document</th>
                  <th className="px-6 py-4">Étudiant</th>
                  <th className="px-6 py-4 text-center">Statut</th>
                  <th className="px-6 py-4 text-center">Version</th>
                  <th className="px-6 py-4 text-right">Déposé le</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deliverables.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                      Aucun livrable trouvé dans le système.
                    </td>
                  </tr>
                ) : (
                  deliverables.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-[#0B1C3F]">{item.titre}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Folder size={12} /> {item.projet_titre}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {item.prenom[0]}{item.nom[0]}
                          </div>
                          <span className="font-medium text-slate-700">{item.prenom} {item.nom}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.statut === 'VALIDE' ? 'bg-green-100 text-green-700' :
                          item.statut === 'REJETE' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {item.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-400">
                        v{item.version_num}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500 flex items-center justify-end gap-1 mt-3">
                        <Clock size={14} /> {new Date(item.submitted_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a 
                          href={formatFileUrl(item.file_path)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1E4AA8] text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-bold"
                        >
                          <Download size={14} /> Télécharger
                        </a>
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
