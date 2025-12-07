import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Dashboard Admin – Genius.Harmony</h1>
      <p>Bienvenue, <strong>{user?.username}</strong></p>
      <p>Rôle : <strong>{user?.role}</strong></p>

      <hr style={{ margin: "2rem 0" }} />

      <h2>Vue d’ensemble</h2>
      <ul>
        <li>Nombre de pôles (cinéma, musique, événement, …) – (à venir)</li>
        <li>Nombre de membres et stagiaires – (à venir)</li>
        <li>Nombre de clients / partenaires – (à venir)</li>
        <li>Projets en cours – (à venir)</li>
      </ul>

      <p>
        Ici on ajoutera ensuite :
      </p>
      <ul>
        <li>Gestion des pôles</li>
        <li>Gestion des utilisateurs & rôles</li>
        <li>Intégration avec Odoo (clients, factures, etc.)</li>
      </ul>
    </div>
  );
}