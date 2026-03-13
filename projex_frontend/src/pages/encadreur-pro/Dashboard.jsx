import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Users, FileText, MessageSquare, CheckCircle, Clock, Briefcase } from 'lucide-react';

export default function EncadreurProDashboard() {
  const { user } = useAuth();

  // Mock data - À remplacer par des appels API
  const stats = {
    stagiaires: 4,
    stages: 2,
    evaluations: 3,
    messages: 5,
  };

  const internships = [
    {
      id: 1,
      etudiant: 'Amine Harrag',
      poste: 'Développeur Full Stack',
      debut: '2026-02-01',
      fin: '2026-05-31',
      status: 'En cours',
      evaluation: 'Complétée',
    },
    {
      id: 2,
      etudiant: 'Nadia Bouhadjar',
      poste: 'Data Analyst',
      debut: '2026-02-15',
      fin: '2026-06-15',
      status: 'En cours',
      evaluation: 'En attente',
    },
    {
      id: 3,
      etudiant: 'Moussa Sedira',
      poste: 'QA Engineer',
      debut: '2026-01-15',
      fin: '2026-04-15',
      status: 'Terminé',
      evaluation: 'Complétée',
    },
    {
      id: 4,
      etudiant: 'Leila Aissa',
      poste: 'DevOps Engineer',
      debut: '2026-03-01',
      fin: '2026-06-01',
      status: 'À démarrer',
      evaluation: 'Non commencée',
    },
  ];

  const evaluations = [
    {
      id: 1,
      etudiant: 'Amine Harrag',
      poste: 'Développeur Full Stack',
      status: 'Complétée',
      date: '2026-03-11',
      score: '18/20',
    },
    {
      id: 2,
      etudiant: 'Moussa Sedira',
      poste: 'QA Engineer',
      status: 'Complétée',
      date: '2026-03-05',
      score: '16/20',
    },
    {
      id: 3,
      etudiant: 'Nadia Bouhadjar',
      poste: 'Data Analyst',
      status: 'En attente',
      date: '-',
      score: '-',
    },
  ];

  return (
    <DashboardLayout>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Tableau de bord Encadreur Professionnel
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Bienvenue, {user?.prenom} {user?.nom}
          </p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Stagiaires</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.stagiaires}</p>
              </div>
              <Users size={32} className="text-blue-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Stages</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.stages}</p>
              </div>
              <Briefcase size={32} className="text-green-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Évaluations</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.evaluations}</p>
              </div>
              <FileText size={32} className="text-purple-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Messages</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.messages}</p>
              </div>
              <MessageSquare size={32} className="text-orange-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Mes Stagiaires */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b-4 border-blue-600">
            <h2 className="text-2xl font-bold text-gray-900">👥 Mes Stagiaires</h2>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Étudiant
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Poste
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Période
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Évaluation
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {internships.map(internship => (
                  <tr key={internship.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {internship.etudiant}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{internship.poste}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(internship.debut).toLocaleDateString('fr-FR')} →{' '}
                      {new Date(internship.fin).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          internship.status === 'En cours'
                            ? 'bg-green-100 text-green-700'
                            : internship.status === 'Terminé'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {internship.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          internship.evaluation === 'Complétée'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {internship.evaluation === 'Complétée' ? (
                          <CheckCircle size={14} />
                        ) : (
                          <Clock size={14} />
                        )}
                        {internship.evaluation}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-blue-600 hover:text-blue-900 font-semibold text-sm">
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Évaluations */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b-4 border-blue-600">
            <h2 className="text-2xl font-bold text-gray-900">📊 Mes Évaluations</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {evaluations.map(evaluation => (
              <div
                key={evaluation.id}
                className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">{evaluation.etudiant}</h3>
                <p className="text-sm text-gray-600 mb-4">{evaluation.poste}</p>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status :</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        evaluation.status === 'Complétée'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {evaluation.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Date :</span>
                    <span className="text-sm text-gray-900 font-semibold">
                      {evaluation.date}
                    </span>
                  </div>

                  {evaluation.score !== '-' && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Score :</span>
                      <span className="text-sm text-blue-600 font-bold">{evaluation.score}</span>
                    </div>
                  )}
                </div>

                <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors">
                  Voir détails
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
