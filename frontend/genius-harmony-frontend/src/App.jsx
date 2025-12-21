import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import GenericDashboard from "./pages/GenericDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminUsers from "./pages/AdminUsers";
import AdminPoles from "./pages/AdminPoles";
import PoleDetails from "./pages/PoleDetails";
import ProjetsList from "./pages/ProjetsList";
import ProjetDetails from "./pages/ProjetDetails";
import UserProfile from "./pages/UserProfile";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Pages publiques */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Dashboard générique pour tout utilisateur connecté */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AdminLayout pageTitle="Mon Dashboard">
                    <GenericDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Dashboard admin – réservé aux rôles "admin" et "super_admin" */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                  <AdminLayout pageTitle="Dashboard Administrateur">
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* gestion utilisateurs - accessible en lecture pour membres, artistes, chefs de pôle */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["admin", "super_admin", "chef_pole", "membre", "artiste"]}>
                  <AdminLayout pageTitle="Liste des Utilisateurs">
                    <AdminUsers />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Profil utilisateur */}
            <Route
              path="/users/:id/profile"
              element={
                <ProtectedRoute>
                  <AdminLayout pageTitle="Profil Utilisateur">
                    <UserProfile />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* gestion pôles admin */}
            <Route
              path="/admin/poles"
              element={
                <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                  <AdminLayout pageTitle="Gestion des Pôles">
                    <AdminPoles />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Détails d'un pôle */}
            <Route
              path="/admin/poles/:id"
              element={
                <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                  <AdminLayout pageTitle="Détails du Pôle">
                    <PoleDetails />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Pages projets - accessibles à tous les utilisateurs connectés */}
            <Route
              path="/projets"
              element={
                <ProtectedRoute>
                  <AdminLayout pageTitle="Mes Projets">
                    <ProjetsList />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/projets/:id"
              element={
                <ProtectedRoute>
                  <AdminLayout pageTitle="Détails du Projet">
                    <ProjetDetails />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Redirection par défaut */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
