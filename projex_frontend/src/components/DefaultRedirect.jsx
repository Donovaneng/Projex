import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function DefaultRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // or spinner
  }

  if (user) {
    const role = (user.role || '').toUpperCase();
    switch (role) {
      case 'ADMIN':
        return <Navigate to="/admin/dashboard" replace />;
      case 'ETUDIANT':
        return <Navigate to="/student/dashboard" replace />;
      case 'ENCADREUR_ACAD':
        return <Navigate to="/encadreur-acad/dashboard" replace />;
      case 'ENCADREUR_PRO':
        return <Navigate to="/encadreur-pro/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <Navigate to="/login" replace />;
}
