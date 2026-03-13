import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/layout/AdminLayout';

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Tableau de bord Étudiant
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Bienvenue, {user?.prenom} {user?.nom}
          </p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <h3 className="text-gray-600 text-sm font-semibold">Projets assignés</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <h3 className="text-gray-600 text-sm font-semibold">Tâches en cours</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <h3 className="text-gray-600 text-sm font-semibold">Livrables</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">0</p>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">
            Le dashboard étudiant sera développé prochainement...
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
