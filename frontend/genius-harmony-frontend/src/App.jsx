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
import ProjetsList from "./pages/ProjetsList";
import ProjetDetails from "./pages/ProjetDetails";
import KanbanTaches from "./pages/KanbanTaches";
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
                  <Layout>
                    <GenericDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Dashboard admin – réservé aux rôles "admin" */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout pageTitle="Dashboard Administrateur">
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* gestion utilisateurs admin */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout pageTitle="Gestion des Utilisateurs">
                    <AdminUsers />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* gestion pôles admin */}
            <Route
              path="/admin/poles"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout pageTitle="Gestion des Pôles">
                    <AdminPoles />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Pages projets - accessibles à tous les utilisateurs connectés */}
            <Route
              path="/projets"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProjetsList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/projets/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProjetDetails />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Kanban des tâches - accessible à tous les utilisateurs connectés */}
            <Route
              path="/kanban"
              element={
                <ProtectedRoute>
                  <Layout>
                    <KanbanTaches />
                  </Layout>
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
