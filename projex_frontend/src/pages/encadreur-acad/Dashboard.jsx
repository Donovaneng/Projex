import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/layout/AdminLayout';
import { Users, FileText, MessageSquare, CheckCircle, Clock } from 'lucide-react';

export default function EncadreurAcadDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Mock data - À remplacer par des appels API
  const stats = {
    groupes: 3,
    etudiants: 12,
    evaluations: 5,
    messages: 8,
  };

  const groups = [
    {
      id: 1,
      nom: 'Groupe 1 - Système Bancaire',
      etudiants: 4,
      evaluations_faites: 2,
      status: 'En cours',
    },
    {
      id: 2,
      nom: 'Groupe 2 - Gestion Hôtel',
      etudiants: 4,
      evaluations_faites: 3,
      status: 'En cours',
    },
    {
      id: 3,
      nom: 'Groupe 3 - Plateforme E-learning',
      etudiants: 4,
      evaluations_faites: 1,
      status: 'À démarrer',
    },
  ];

  const evaluations = [
    {
      id: 1,
      etudiant: 'Ahmed Boutheina',
      groupe: 'Groupe 1',
      status: 'Complétée',
      date: '2026-03-10',
    },
    {
      id: 2,
      etudiant: 'Fatima Khaled',
      groupe: 'Groupe 1',
      status: 'En attente',
      date: '-',
    },
    {
      id: 3,
      etudiant: 'Karim Sedira',
      groupe: 'Groupe 2',
      status: 'Complétée',
      date: '2026-03-08',
    },
  ];

  return (
    <DashboardLayout>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Tableau de bord Encadreur Académique
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
                <p className="text-gray-600 text-sm font-semibold">Groupes</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.groupes}</p>
              </div>
              <Users size={32} className="text-blue-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Étudiants</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.etudiants}</p>
              </div>
              <Users size={32} className="text-green-500 opacity-50" />
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

        {/* Mes Groupes */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b-4 border-blue-600">
            <h2 className="text-2xl font-bold text-gray-900">👥 Mes Groupes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map(group => (
              <div
                key={group.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-t-4 border-blue-600"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-3">{group.nom}</h3>

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <p>
                    <span className="font-semibold">Étudiants :</span> {group.etudiants}
                  </p>
                  <p>
                    <span className="font-semibold">Évaluations :</span>{' '}
                    {group.evaluations_faites}/{group.etudiants}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-semibold">Status :</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        group.status === 'En cours'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {group.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded text-sm transition-colors">
                    Voir détails
                  </button>
                  <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded text-sm transition-colors">
                    Évaluer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Évaluations Récentes */}
        <section>
          <div className="flex items-center justify-between mb-6 pb-4 border-b-4 border-blue-600">
            <h2 className="text-2xl font-bold text-gray-900">📋 Évaluations Récentes</h2>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Étudiant
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Groupe
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Date
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {evaluations.map(evaluation => (
                  <tr key={evaluation.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{evaluation.etudiant}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{evaluation.groupe}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          evaluation.status === 'Complétée'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {evaluation.status === 'Complétée' ? (
                          <CheckCircle size={14} />
                        ) : (
                          <Clock size={14} />
                        )}
                        {evaluation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{evaluation.date}</td>
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
      </div>
    </DashboardLayout>
  );
}
