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
  Briefcase,
  CalendarDays,
  AlertTriangle,
  Eye,
  Star,
  TrendingUp,
  Award
} from 'lucide-react';

export default function EncadreurProDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    interns: 0,
    activeInternships: 0,
    evaluations: 0,
    pendingEvaluations: 0
  });
  const [internships, setInternships] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [students, setStudents] = useState([]);

  // Charger les données du dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [studentsRes, evaluationsRes] = await Promise.all([
        supervisorService.getStudents(),
        supervisorService.getEvaluations()
      ]);

      setStudents(studentsRes.students || []);
      setEvaluations(evaluationsRes.evaluations || []);

      // Transformer les étudiants en stage (simulation)
      const internshipData = (studentsRes.students || []).map(student => ({
        id: student.id,
        etudiant: `${student.prenom} ${student.nom}`,
        poste: student.poste || 'Stagiaire',
        debut: student.stage_debut,
        fin: student.stage_fin,
        status: student.stage_status || 'En cours',
        evaluation: student.evaluation_status || 'En attente',
        progression: student.progression || 0
      }));

      setInternships(internshipData);

      // Calculer les statistiques
      setStats({
        interns: (studentsRes.students || []).length,
        activeInternships: internshipData.filter(i => i.status === 'En cours').length,
        evaluations: (evaluationsRes.evaluations || []).length,
        pendingEvaluations: internshipData.filter(i => i.evaluation === 'En attente').length
      });

    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      // Fallback
      setError('Impossible de charger les données du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Créer une évaluation professionnelle
  const createProfessionalEvaluation = async (studentId) => {
    try {
      const score = prompt('Note générale (sur 20):');
      const comment = prompt('Commentaire général:');
      
      if (score && comment) {
        await supervisorService.createProfessionalEvaluation({
          student_id: studentId,
          score: parseFloat(score),
          commentaire_global: comment,
          competences: []
        });
        loadDashboardData();
      }
    } catch (err) {
      console.error('Erreur lors de la création de l\'évaluation:', err);
      setError('Impossible de créer l\'évaluation');
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
            Espace Encadreur Professionnel
          </h1>
          <p className="text-slate-500 mt-2">
            Bienvenue, {user?.prenom} {user?.nom}. Suivez la progression de vos stagiaires.
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
            <div className="rounded-xl flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600">
              <Users size={24} />
            </div>
            <div>
               <p className="text-sm text-slate-500 font-medium">Stagiaires</p>
               <h3 className="text-2xl font-bold text-[#0B1C3F]">{stats.interns}</h3>
            </div>
          </Card>

          <Card padding="md" className="flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="rounded-xl flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600">
              <Briefcase size={24} />
            </div>
            <div>
               <p className="text-sm text-slate-500 font-medium">Stages actifs</p>
               <h3 className="text-2xl font-bold text-[#0B1C3F]">{stats.activeInternships}</h3>
            </div>
          </Card>

          <Card padding="md" className="flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="rounded-xl flex items-center justify-center w-12 h-12 bg-green-100 text-green-600">
              <Star size={24} />
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
               <p className="text-sm text-slate-500 font-medium">À évaluer</p>
               <h3 className="text-2xl font-bold text-[#0B1C3F]">{stats.pendingEvaluations}</h3>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Column: Interns */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Stagiaires Actifs */}
             <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-[#0B1C3F]">
                  <Briefcase className="h-6 w-6 text-[#1E4AA8]" />
                  Mes Stagiaires
                </h2>
              </div>

              {internships.length === 0 ? (
                <Card padding="xl" className="text-center border-dashed border-2 border-slate-200 shadow-none">
                  <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Aucun stagiaire assigné pour le moment.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {internships.map(internship => (
                    <Card key={internship.id} className="border border-slate-200 hover:border-[#1E4AA8]/30 transition-shadow">
                      <Card.Content className="p-5">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                          <div className="flex items-center gap-4">
                            <img 
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(internship.etudiant)}&background=1E4AA8&color=fff&rounded=true`}
                              alt="avatar"
                              className="w-12 h-12 rounded-full hidden sm:block"
                            />
                            <div>
                              <h3 className="font-bold text-lg text-[#0B1C3F] leading-tight flex items-center gap-2">
                                {internship.etudiant}
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  internship.status === 'En cours'
                                    ? 'bg-green-100 text-green-700'
                                    : internship.status === 'Terminé'
                                    ? 'bg-slate-100 text-slate-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}>
                                  {internship.status}
                                </span>
                              </h3>
                              <p className="text-slate-500 text-sm font-medium mt-1">{internship.poste}</p>
                            </div>
                          </div>
                          
                          <div className="w-full sm:w-auto text-right bg-slate-50 p-2 sm:p-0 sm:bg-transparent rounded-lg sm:rounded-none">
                            <div className="flex items-center justify-between sm:justify-end gap-2 mb-1">
                              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Évaluation:</span>
                              <span className={`inline-flex items-center gap-1 font-bold text-xs ${
                                internship.evaluation === 'Complétée'
                                  ? 'text-green-600'
                                  : 'text-orange-600'
                              }`}>
                                {internship.evaluation === 'Complétée' ? <CheckCircle size={14}/> : <Clock size={14}/>}
                                {internship.evaluation}
                              </span>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-3 mt-1 sm:mt-0">
                               <span className="text-xs font-semibold text-slate-600">Progression</span>
                               <span className="font-bold text-[#1E4AA8] text-sm">{internship.progression}%</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Barre de progression */}
                        <div className="mb-4">
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-[#1E4AA8] h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${internship.progression}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                             <div className="flex items-center gap-1.5">
                                <CalendarDays className="h-4 w-4" />
                                <span>Début: {internship.debut ? new Date(internship.debut).toLocaleDateString('fr-FR') : '-'}</span>
                             </div>
                             <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                <span>Fin: {internship.fin ? new Date(internship.fin).toLocaleDateString('fr-FR') : '-'}</span>
                             </div>
                          </div>
                          
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button size="sm" variant="outline" icon={Eye} className="w-full sm:w-auto">
                              Détails
                            </Button>
                            {internship.evaluation !== 'Complétée' && (
                              <Button 
                                size="sm" 
                                variant="primary"
                                onClick={() => createProfessionalEvaluation(internship.id)}
                                className="w-full sm:w-auto bg-[#1E4AA8] hover:bg-[#153476]"
                              >
                                Évaluer
                              </Button>
                            )}
                          </div>
                        </div>

                      </Card.Content>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Side Column: Evaluations & Stats */}
          <div className="space-y-8">
            
            {/* Évaluations à faire */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-[#0B1C3F]">
                  <Clock className="h-6 w-6 text-[#1E4AA8]" />
                  À Évaluer
                  {stats.pendingEvaluations > 0 && (
                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-bold ml-2">
                      {stats.pendingEvaluations}
                    </span>
                  )}
                </h2>
              </div>

              <Card className="shadow-sm border-slate-200">
                <Card.Content className="p-0">
                  {stats.pendingEvaluations === 0 ? (
                    <div className="text-center py-10 px-4">
                      <CheckCircle className="mx-auto text-green-400 mb-3 h-10 w-10" />
                      <p className="text-slate-500 text-sm">Toutes les évaluations sont complétées.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto scrollbar-hide">
                      {internships
                        .filter(i => i.evaluation === 'En attente')
                        .map(internship => (
                          <div key={internship.id} className="p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold text-sm text-[#0B1C3F]">{internship.etudiant}</h4>
                                <p className="text-xs text-slate-500 font-medium">{internship.poste}</p>
                              </div>
                              <span className="text-xs font-bold text-[#1E4AA8] bg-[#1E4AA8]/10 px-2 py-0.5 rounded">
                                {internship.progression}%
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => createProfessionalEvaluation(internship.id)}
                              className="w-full text-xs shadow-sm"
                              icon={Star}
                            >
                              Évaluer maintenant
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </Card.Content>
              </Card>
            </section>

             {/* Statistiques rapides */}
             <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-[#0B1C3F]">
                  <TrendingUp className="h-6 w-6 text-[#1E4AA8]" />
                  Performance Globale
                </h2>
              </div>

              <Card className="shadow-sm border-slate-200 bg-gradient-to-br from-[#1E4AA8] to-[#153476] text-white">
                <Card.Content className="p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-xl p-4 text-center">
                       <Award className="h-6 w-6 mx-auto mb-2 opacity-80" />
                       <div className="text-2xl font-bold mb-1">
                          {evaluations.length > 0 
                            ? (evaluations.reduce((acc, e) => acc + (parseFloat(e.score) || 0), 0) / evaluations.length).toFixed(1)
                            : '—'
                          }
                       </div>
                       <p className="text-[10px] uppercase tracking-wider font-semibold opacity-80">Moyenne /20</p>
                    </div>
                    
                    <div className="bg-white/10 rounded-xl p-4 text-center">
                       <Users className="h-6 w-6 mx-auto mb-2 opacity-80" />
                       <div className="text-2xl font-bold mb-1">
                          {students.length > 0 
                            ? Math.round((students.filter(s => s.progression >= 80).length / students.length) * 100)
                            : 0
                          }%
                       </div>
                       <p className="text-[10px] uppercase tracking-wider font-semibold opacity-80">Stages &gt;80%</p>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </section>
          </div>
        </div>

        {/* Dernières Évaluations (Pleine largeur) */}
         <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-[#0B1C3F]">
                <FileText className="h-6 w-6 text-[#1E4AA8]" />
                Historique des Évaluations
              </h2>
            </div>
            
            {evaluations.length === 0 ? (
                <Card padding="xl" className="text-center border-dashed border-2 border-slate-200 shadow-none">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Aucune évaluation n'a été effectuée.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {evaluations.slice(0, 6).map(evaluation => (
                    <Card key={evaluation.id} className="border border-slate-200 hover:shadow-md transition-shadow">
                      <Card.Content className="p-4">
                         <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-100">
                           <div className="flex items-center gap-3">
                             <div className="bg-green-100 p-2 rounded-lg text-green-600">
                               <Star size={20} />
                             </div>
                             <div>
                               <h3 className="font-bold text-sm text-[#0B1C3F] leading-tight">
                                 {evaluation.etudiant_prenom} {evaluation.etudiant_nom}
                               </h3>
                               <p className="text-[11px] text-slate-500 uppercase tracking-widest mt-0.5">{evaluation.poste || "Stagiaire"}</p>
                             </div>
                           </div>
                           
                           {evaluation.score && (
                             <div className="text-right">
                               <div className="text-lg font-black text-[#1E4AA8]">{evaluation.score}</div>
                               <div className="text-[10px] text-slate-400 font-bold uppercase">sur 20</div>
                             </div>
                           )}
                         </div>

                         {evaluation.commentaire && (
                            <p className="text-slate-600 text-xs italic mb-4 line-clamp-2">
                              "{evaluation.commentaire}"
                            </p>
                          )}

                         <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                              Le {new Date(evaluation.created_at).toLocaleDateString('fr-FR')}
                            </span>
                            <button className="text-xs font-semibold text-[#1E4AA8] hover:underline flex items-center gap-1">
                              Voir la fiche <Eye className="h-3 w-3" />
                            </button>
                         </div>
                      </Card.Content>
                    </Card>
                  ))}
                </div>
              )}
        </div>

      </div>
    </DashboardLayout>
  );
}
