import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import supervisorService from '../../services/supervisorService';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  CheckCircle, 
  Clock,
  FolderKanban,
  CalendarDays,
  AlertTriangle,
  Eye,
  Star,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function EncadreurAcadDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    projects: 0,
    students: 0,
    evaluations: 0,
    pendingDeliverables: 0
  });
  const [projects, setProjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [pendingDeliverables, setPendingDeliverables] = useState([]);

  // Charger les données du dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [projectsRes, studentsRes, evaluationsRes, deliverablesRes] = await Promise.all([
        supervisorService.getProjects(),
        supervisorService.getStudents(),
        supervisorService.getEvaluations(),
        supervisorService.getDeliverablesToReview()
      ]);

      setProjects(projectsRes.projects || []);
      setStudents(studentsRes.students || []);
      setEvaluations(evaluationsRes.evaluations || []);
      setPendingDeliverables(deliverablesRes.deliverables || []);

      // Calculer les statistiques
      setStats({
        projects: (projectsRes.projects || []).length,
        students: (studentsRes.students || []).length,
        evaluations: (evaluationsRes.evaluations || []).length,
        pendingDeliverables: (deliverablesRes.deliverables || []).length
      });

    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      // Fallback gracieux si l'API échoue
      setError('Impossible de charger les données du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Approuver un livrable
  const approveDeliverable = async (deliverableId, feedback = '') => {
    try {
      await supervisorService.approveDeliverable(deliverableId, feedback);
      loadDashboardData(); // Recharger les données
    } catch (err) {
      console.error('Erreur lors de l\'approbation du livrable:', err);
      setError('Impossible d\'approuver le livrable');
    }
  };

  // Rejeter un livrable
  const rejectDeliverable = async (deliverableId, reason) => {
    try {
      await supervisorService.rejectDeliverable(deliverableId, reason);
      loadDashboardData(); // Recharger les données
    } catch (err) {
      console.error('Erreur lors du rejet du livrable:', err);
      setError('Impossible de rejeter le livrable');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader size="lg" text="Chargement du tableau de bord..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold text-[#0B1C3F]">
            Espace Encadreur Académique
          </h1>
          <p className="text-slate-500 mt-2">
            Bienvenue, {user?.prenom} {user?.nom}. Supervisez vos projets et évaluez les étudiants.
          </p>
        </header>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm leading-6">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card padding="md" className="flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="rounded-xl flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600">
              <FolderKanban size={24} />
            </div>
            <div>
               <p className="text-sm text-slate-500 font-medium">Projets supervisés</p>
               <h3 className="text-2xl font-bold text-[#0B1C3F]">{stats.projects}</h3>
            </div>
          </Card>

          <Card padding="md" className="flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="rounded-xl flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600">
              <Users size={24} />
            </div>
            <div>
               <p className="text-sm text-slate-500 font-medium">Étudiants suivis</p>
               <h3 className="text-2xl font-bold text-[#0B1C3F]">{stats.students}</h3>
            </div>
          </Card>

          <Card padding="md" className="flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="rounded-xl flex items-center justify-center w-12 h-12 bg-green-100 text-green-600">
              <FileText size={24} />
            </div>
            <div>
               <p className="text-sm text-slate-500 font-medium">Évaluations</p>
               <h3 className="text-2xl font-bold text-[#0B1C3F]">{stats.evaluations}</h3>
            </div>
          </Card>

          <Card padding="md" className="flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="rounded-xl flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-600">
              <Clock size={24} />
            </div>
            <div>
               <p className="text-sm text-slate-500 font-medium">Livrables en attente</p>
               <h3 className="text-2xl font-bold text-[#0B1C3F]">{stats.pendingDeliverables}</h3>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Column: Projects & Students */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Projets Supervisés */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-[#0B1C3F]">
                  <FolderKanban className="h-6 w-6 text-[#1E4AA8]" />
                  Mes Projets Supervisés
                </h2>
              </div>

              <Card className="shadow-sm border-slate-200">
                <Card.Content className="p-0">
                  {projects.length === 0 ? (
                    <div className="text-center py-10 px-4">
                      <FolderKanban className="mx-auto text-slate-300 mb-3 h-10 w-10" />
                      <p className="text-slate-500 text-sm">Aucun projet assigné pour le moment.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {projects.map(project => (
                        <div key={project.id} className="p-5 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-lg text-[#0B1C3F]">{project.titre}</h3>
                            <span className={`shrink-0 ml-4 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              project.statut === 'EN_COURS' 
                                ? 'bg-green-100 text-green-700'
                                : project.statut === 'EN_ATTENTE'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {project.statut?.replace('_', ' ') || 'ACTIF'}
                            </span>
                          </div>
                          <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                            {project.description || "Aucune description fournie."}
                          </p>
                          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                              {project.etudiant_nom && (
                                <div className="flex items-center gap-1.5 text-[#1E4AA8] font-medium">
                                  <Users className="h-4 w-4" />
                                  <span>{project.etudiant_nom}</span>
                                </div>
                              )}
                              {project.date_fin && (
                                <div className="flex items-center gap-1.5">
                                  <CalendarDays className="h-4 w-4" />
                                  <span>Fin: {new Date(project.date_fin).toLocaleDateString('fr-FR')}</span>
                                </div>
                              )}
                            </div>
                            <Button size="sm" variant="outline" icon={Eye}>
                              Détails
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Content>
              </Card>
            </section>

             {/* Étudiants Suivis */}
             <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-[#0B1C3F]">
                  <Users className="h-6 w-6 text-[#1E4AA8]" />
                  Mes Étudiants
                </h2>
              </div>

              {students.length === 0 ? (
                <Card padding="xl" className="text-center border-dashed border-2 border-slate-200 shadow-none">
                  <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Aucun étudiant assigné.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {students.map(student => (
                    <Card key={student.id} hover="scale" className="border border-slate-200">
                      <Card.Content className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.prenom + ' ' + student.nom)}&background=1E4AA8&color=fff&rounded=true`}
                            alt="avatar"
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <h3 className="font-bold text-[#0B1C3F] leading-tight text-sm">
                              {student.prenom} {student.nom}
                            </h3>
                            <p className="text-xs text-slate-500">{student.email}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Projet:</span>
                            <span className="font-medium text-[#0B1C3F] truncate max-w-[120px]">{student.projet_titre || 'Non défini'}</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Progression:</span>
                            <span className="font-bold text-[#1E4AA8]">{student.progression || 0}%</span>
                          </div>
                          {/* ProgressBar logic here */}
                          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                            <div className="bg-[#1E4AA8] h-1.5 rounded-full" style={{ width: `${student.progression || 0}%` }}></div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                           <Button size="sm" variant="outline" className="w-full" icon={Eye}>
                             Profil
                           </Button>
                           <Button size="sm" variant="primary" className="w-full bg-[#1E4AA8] hover:bg-[#153476]" icon={MessageSquare}>
                             Message
                           </Button>
                        </div>
                      </Card.Content>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Side Column: Reviews & Evaluations */}
          <div className="space-y-8">
            
            {/* Livrables en attente */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-[#0B1C3F]">
                  <Clock className="h-6 w-6 text-[#1E4AA8]" />
                  Livrables à Réviser
                  {stats.pendingDeliverables > 0 && (
                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-bold ml-2">
                      {stats.pendingDeliverables}
                    </span>
                  )}
                </h2>
              </div>

              <Card className="shadow-sm border-slate-200">
                <Card.Content className="p-0">
                  {pendingDeliverables.length === 0 ? (
                    <div className="text-center py-10 px-4">
                      <CheckCircle className="mx-auto text-green-400 mb-3 h-10 w-10" />
                      <p className="text-slate-500 text-sm">Tous les livrables sont à jour.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto scrollbar-hide">
                      {pendingDeliverables.map(deliverable => (
                        <div key={deliverable.id} className="p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-sm text-[#0B1C3F]">{deliverable.titre}</h4>
                              <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                <Users className="h-3 w-3" /> {deliverable.etudiant_nom}
                              </p>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                              {new Date(deliverable.submitted_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          
                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              variant="success"
                              className="w-full py-1.5 text-xs bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                              onClick={() => approveDeliverable(deliverable.id)}
                              icon={CheckCircle2}
                            >
                              Valider
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              className="w-full py-1.5 text-xs bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                              onClick={() => {
                                const reason = prompt('Raison du rejet:');
                                if (reason) rejectDeliverable(deliverable.id, reason);
                              }}
                              icon={XCircle}
                            >
                              Rejeter
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Content>
              </Card>
            </section>

             {/* Évaluations Récentes */}
             <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-[#0B1C3F]">
                  <Star className="h-6 w-6 text-[#1E4AA8]" />
                  Dernières Évaluations
                </h2>
              </div>

              <Card className="shadow-sm border-slate-200">
                <Card.Content className="p-0">
                  {evaluations.length === 0 ? (
                    <div className="text-center py-10 px-4">
                      <FileText className="mx-auto text-slate-300 mb-3 h-10 w-10" />
                      <p className="text-slate-500 text-sm">Aucune évaluation effectuée.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {evaluations.slice(0, 5).map(evaluation => (
                        <div key={evaluation.id} className="p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-[#0B1C3F] text-sm">
                                {evaluation.etudiant_prenom} {evaluation.etudiant_nom}
                              </h3>
                              <p className="text-xs text-slate-500 truncate max-w-[150px]">{evaluation.projet_titre}</p>
                            </div>
                            <div className="text-right">
                              {evaluation.note && (
                                <div className="text-base font-bold text-[#1E4AA8] bg-[#1E4AA8]/10 px-2 rounded">
                                  {evaluation.note}/20
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {evaluation.commentaire && (
                            <p className="text-slate-600 text-xs my-2 italic border-l-2 border-slate-200 pl-2">
                              "{evaluation.commentaire}"
                            </p>
                          )}
                          
                          <div className="flex justify-between items-center mt-3">
                             <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                              Le {new Date(evaluation.created_at).toLocaleDateString('fr-FR')}
                             </span>
                             <button className="text-xs font-semibold text-[#1E4AA8] hover:underline flex items-center gap-1">
                               Détails <Eye className="h-3 w-3"/>
                             </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Content>
              </Card>
            </section>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
