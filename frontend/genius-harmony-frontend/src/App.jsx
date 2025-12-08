import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import GenericDashboard from "./pages/GenericDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminUsers from "./pages/AdminUsers";
import ProjetsList from "./pages/ProjetsList";
import ProjetDetails from "./pages/ProjetDetails";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Page de login publique */}
          <Route path="/login" element={<Login />} />

          {/* Dashboard générique pour tout utilisateur connecté */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <GenericDashboard />
              </ProtectedRoute>
            }
          />

          {/* Dashboard admin – réservé aux rôles "admin" */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* gestion utilisateurs admin */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          {/* Pages projets - accessibles à tous les utilisateurs connectés */}
          <Route
            path="/projets"
            element={
              <ProtectedRoute>
                <ProjetsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projets/:id"
            element={
              <ProtectedRoute>
                <ProjetDetails />
              </ProtectedRoute>
            }
          />

          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
