import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import adminService from '../../services/adminService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { 
  FolderKanban, Users, FileText, Award, Calendar, 
  ArrowLeft, Download, ExternalLink, User, ShieldCheck,
  CheckCircle2, Clock
} from 'lucide-react';
import { formatFileUrl } from '../../utils/file';
import { useAuth } from '../../hooks/useAuth';
import ProjectChat from '../../components/project/ProjectChat';
import { generateDefensePDF } from '../../utils/exportUtils';
import { FileDown } from 'lucide-react';

export default function AdminProjectDetails() {
  const { user: currentUser } = useAuth();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        const res = await adminService.getProjectDetails(id);
        setData(res);
      } catch (err) {
        console.error(err);
        setError('Impossible de charger les détails du projet');
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader size="lg" text="Chargement du projet..." />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-8 text-center bg-white rounded-xl shadow-sm border border-slate-200 mt-12">
          <FolderKanban className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Projet introuvable</h2>
          <p className="text-slate-500 mb-6">{error || "Ce projet n'existe pas ou a été supprimé."}</p>
          <Link to="/admin/projects">
            <Button icon={ArrowLeft} variant="outline">Retour à la liste</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const { project, team, deliverables, evaluations, soutenance } = data;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Header Navigation */}
        <nav className="flex items-center justify-between gap-4">
           <div className="flex items-center gap-4">
              <Link to="/admin/projects">
                <Button variant="outline" size="sm" icon={ArrowLeft}>Retour</Button>
              </Link>
              <div className="h-4 w-px bg-slate-200"></div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Détails du Projet #{id}</span>
           </div>
           
           <Button 
            className="bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-900/10" 
            icon={FileDown}
            onClick={() => generateDefensePDF(data)}
           >
            Générer PV (PDF)
           </Button>
        </nav>

        {/* Project Header Info */}
        <header className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
             <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                project.statut === 'EN_COURS' ? 'bg-green-100 text-green-700' :
                project.statut === 'TERMINE' ? 'bg-blue-100 text-blue-700' :
                project.statut === 'EN_ATTENTE' ? 'bg-orange-100 text-orange-700' :
                'bg-slate-100 text-slate-600'
             }`}>
                {project.statut?.replace('_', ' ')}
             </span>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 items-start">
             <div className="p-4 bg-blue-50 rounded-2xl text-[#1E4AA8]">
                <FolderKanban size={48} strokeWidth={1.5} />
             </div>
             <div className="flex-1 space-y-2">
                <h1 className="text-4xl font-black text-[#0B1C3F] tracking-tight">{project.titre}</h1>
                <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">{project.description}</p>
                <div className="flex flex-wrap gap-4 pt-4 text-sm font-medium">
                   <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Calendar size={16} />
                      <span>Fin : {new Date(project.date_fin).toLocaleDateString()}</span>
                   </div>
                   {soutenance && (
                      <div className="flex items-center gap-2 text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
                        <Award size={16} />
                        <span>Soutenance le {new Date(soutenance.date_soutenance).toLocaleDateString()}</span>
                      </div>
                   )}
                </div>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Deliverables Section */}
            <Card className="border-slate-200 overflow-hidden">
              <Card.Header className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#0B1C3F] flex items-center gap-3">
                  <FileText className="h-6 w-6 text-[#1E4AA8]" />
                  Livrables & Documents
                </h2>
                <span className="bg-white px-2 py-1 rounded-md text-xs font-bold text-slate-500 border border-slate-200">
                  {deliverables.length} fichiers
                </span>
              </Card.Header>
              <Card.Content className="p-0">
                <div className="divide-y divide-slate-100">
                  {deliverables.map((d) => (
                    <div key={d.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                          <Download size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-700">{d.titre}</p>
                          <div className="flex items-center gap-3 text-[10px] uppercase font-bold text-slate-400 mt-1">
                             <span>Par {d.prenom} {d.nom}</span>
                             <span>•</span>
                             <span>{new Date(d.submitted_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <a 
                        href={formatFileUrl(d.file_path)} 
                        target="_blank" 
                        rel="noreferrer"
                      >
                        <Button size="sm" variant="outline" icon={ExternalLink}>Voir</Button>
                      </a>
                    </div>
                  ))}
                  {deliverables.length === 0 && (
                    <div className="p-12 text-center text-slate-400 italic">Aucun livrable déposé pour le moment.</div>
                  )}
                </div>
              </Card.Content>
            </Card>

            {/* Evaluations Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Academic Evaluation */}
               <Card className="border-slate-200">
                  <Card.Header className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-[#0B1C3F] flex items-center gap-2">
                      <Award className="h-5 w-5 text-blue-600" />
                      Note Académique
                    </h3>
                  </Card.Header>
                  <Card.Content className="p-6">
                    {evaluations.academique ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-3xl font-black text-blue-700">{evaluations.academique.note}/20</span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Évalué le {new Date(evaluations.academique.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-600 italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                          "{evaluations.academique.commentaire}"
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-400 italic text-sm">Non encore évalué par l'académique.</div>
                    )}
                  </Card.Content>
               </Card>

               {/* Pro Evaluation */}
               <Card className="border-slate-200">
                  <Card.Header className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-[#0B1C3F] flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-green-600" />
                      Note Professionnelle
                    </h3>
                  </Card.Header>
                  <Card.Content className="p-6">
                    {evaluations.professionnelle ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-3xl font-black text-green-700">Validé</span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                             {evaluations.professionnelle.items?.length || 0} critères évalués
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                           "{evaluations.professionnelle.commentaire_global}"
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-400 italic text-sm">Non encore évalué par le tuteur pro.</div>
                    )}
                  </Card.Content>
               </Card>
  
            <ProjectChat projectId={id} currentUser={currentUser} />
          </div>

          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* Team Section */}
            <Card className="border-slate-200">
              <Card.Header className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-[#0B1C3F] flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#1E4AA8]" />
                  Équipe du Projet
                </h2>
              </Card.Header>
              <Card.Content className="p-0">
                <div className="divide-y divide-slate-100">
                  {team.map((m) => (
                    <div key={m.id} className="p-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-500 overflow-hidden">
                        {m.image_profil ? (
                          <img src={formatFileUrl(m.image_profil)} alt="" className="h-full w-full object-cover" />
                        ) : (
                          `${m.prenom[0]}${m.nom[0]}`
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700 leading-tight">{m.prenom} {m.nom}</p>
                        <p className={`text-[10px] font-black uppercase tracking-tighter ${
                           m.role === 'ETUDIANT' ? 'text-blue-500' : 
                           m.role === 'ENCADREUR_ACAD' ? 'text-purple-500' : 'text-green-500'
                        }`}>
                           {m.role?.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card>

            {/* Project Status Log (Audit) */}
            <Card className="border-slate-200">
              <Card.Header className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-[#0B1C3F] flex items-center gap-2">
                  <Clock className="h-5 w-5 text-slate-400" />
                  Cycle de vie
                </h2>
              </Card.Header>
              <Card.Content className="p-6">
                 <div className="space-y-6">
                    <div className="flex gap-4">
                       <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                          <CheckCircle2 size={14} />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-slate-700">Projet créé</p>
                          <p className="text-[10px] text-slate-400 uppercase font-black">{new Date(project.created_at).toLocaleDateString()}</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                          team.some(m => m.role === 'ENCADREUR_ACAD') ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                       }`}>
                          <Users size={14} />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-slate-700">Équipe assignée</p>
                          <p className="text-[10px] text-slate-400 uppercase font-black">
                             {team.length > 0 ? "Complété" : "En attente"}
                          </p>
                       </div>
                    </div>
                 </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
