import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  // Tant qu'on ne sait pas encore si l'utilisateur est connecté
  if (loading) {
    return <div style={{ padding: "2rem" }}>Chargement...</div>;
  }

  // Pas connecté → vers /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Rôles non autorisés → vers /dashboard (ou autre)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Tout est ok → on affiche la page protégée
  return children;
}
