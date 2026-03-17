import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Composant pour gérer les redirections depuis les anciennes URLs du backend PHP.
 * Utile pour la compatibilité avec les anciens liens de notifications.
 */
export default function LegacyRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const search = location.search;
    const params = new URLSearchParams(search);
    const id = params.get('id') || params.get('project_id');

    // Redirections spécifiques
    if (path.includes('/projects/livrables') || path.includes('/student/livrables')) {
      navigate('/student/deliverables', { replace: true });
    } else if (path.includes('/admin/projects')) {
      navigate('/admin/projects', { replace: true });
    } else if (path.includes('/admin/users')) {
      navigate('/admin/users', { replace: true });
    } else if (path.includes('/tasks/student')) {
      navigate('/student/tasks', { replace: true });
    } else if (path.includes('/tasks/project')) {
      navigate('/supervisor/projects', { replace: true });
    } else if (path.includes('/dashboard')) {
      navigate('/', { replace: true });
    } else {
      // Par défaut, retour à l'accueil si on ne sait pas où aller
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E4AA8] mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-[#0B1C3F]">Redirection en cours...</h2>
        <p className="text-slate-500">Nous vous redirigeons vers la nouvelle version de la page.</p>
      </div>
    </div>
  );
}
