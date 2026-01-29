import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./config/queryClient";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WelcomePage from "./pages/WelcomePage";
import UniversePage from "./pages/UniversePage";
import AdminDashboard from "./pages/AdminDashboard";
import GenericDashboard from "./pages/GenericDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminUsers from "./pages/AdminUsers";
import AdminPoles from "./pages/AdminPoles";
import PoleDetails from "./pages/PoleDetails";
import ProjetsList from "./pages/ProjetsList";
import ProjetDetails from "./pages/ProjetDetails";
import KanbanTaches from "./pages/KanbanTaches";
import UserProfile from "./pages/UserProfile";
import EditProfile from "./pages/EditProfile";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
          <Routes>
            {/* Pages publiques */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Pages d'accueil personnalisées */}
            <Route
              path="/welcome"
              element={
                <ProtectedRoute>
                  <WelcomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/universe"
              element={
                <ProtectedRoute>
                  <AdminLayout pageTitle="Univers Genius.Harmony">
                    <UniversePage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

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

            {/* Profil utilisateur (version courte) */}
            <Route
              path="/users/:id"
              element={
                <ProtectedRoute>
                  <AdminLayout pageTitle="Profil Utilisateur">
                    <UserProfile />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Édition de profil */}
            <Route
              path="/users/:id/edit"
              element={
                <ProtectedRoute>
                  <AdminLayout pageTitle="Modifier le Profil">
                    <EditProfile />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* gestion pôles - accessible en lecture pour membres et chefs de pôle */}
            <Route
              path="/admin/poles"
              element={
                <ProtectedRoute allowedRoles={["admin", "super_admin", "chef_pole", "membre"]}>
                  <AdminLayout pageTitle="Liste des Pôles">
                    <AdminPoles />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Détails d'un pôle */}
            <Route
              path="/admin/poles/:id"
              element={
                <ProtectedRoute allowedRoles={["admin", "super_admin", "chef_pole", "membre"]}>
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

            {/* Pages tâches - accessibles à tous les utilisateurs connectés */}
            <Route
              path="/taches/kanban"
              element={
                <ProtectedRoute>
                  <AdminLayout pageTitle="Kanban des Tâches">
                    <KanbanTaches />
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
    </QueryClientProvider>
  );
}

export default App;
