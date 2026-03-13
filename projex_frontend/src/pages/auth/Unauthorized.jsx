import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Accès refusé</h1>
      <p className="text-lg text-gray-700 mb-6">
        Vous n'avez pas la permission d'accéder à cette page.
      </p>
      <Link
        to="/"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
