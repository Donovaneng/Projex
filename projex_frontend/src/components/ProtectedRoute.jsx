import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute = ({ allowedRoles = [] }) => {

  const { user, loading } = useAuth();
  const location = useLocation();

  // Loader pendant la vérification
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  // Non connecté
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Vérification des rôles
  if (allowedRoles.length > 0) {

    const normalizedRoles = allowedRoles.map(r => r.toUpperCase());

    const userRole =
      user.role?.toUpperCase() ||
      user.role_initial?.toUpperCase();

    if (!normalizedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};