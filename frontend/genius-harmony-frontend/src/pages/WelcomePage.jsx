import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useResponsive } from "../hooks/useResponsive";

export default function WelcomePage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const [isWaving, setIsWaving] = useState(true);

  // Animation de la main qui salue
  useEffect(() => {
    const interval = setInterval(() => {
      setIsWaving((prev) => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Redirection automatique après 5 secondes (optionnel)
  useEffect(() => {
    const timer = setTimeout(() => {
      // navigate("/universe");
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleEnterUniverse = () => {
    navigate("/universe");
  };

  const firstName = user?.first_name || user?.username || "Artiste";

  return (
    <div style={styles.container}>
      {/* Vidéo en arrière-plan */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={styles.video}
      >
        <source
          src="/videos/welcome-background.mp4"
          type="video/mp4"
        />
        {/* Fallback image si la vidéo ne charge pas */}
        <img
          src="/images/welcome-fallback.jpg"
          alt="Background"
          style={styles.fallbackImage}
        />
      </video>

      {/* Overlay sombre */}
      <div style={styles.overlay} />

      {/* Contenu principal */}
      <div style={styles.content}>
        {/* Emoji main qui salue */}
        <div
          style={{
            ...styles.emoji,
            transform: isWaving ? "rotate(0deg)" : "rotate(20deg)",
          }}
        >
          👋
        </div>

        {/* Message de bienvenue */}
        <h1 style={{ ...styles.greeting, fontSize: isMobile ? "24px" : "32px" }}>
          Heureux de te revoir,
        </h1>
        <h2 style={{ ...styles.name, fontSize: isMobile ? "28px" : "36px" }}>
          {firstName}
        </h2>

        {/* Bouton pour entrer dans l'univers */}
        <button
          onClick={handleEnterUniverse}
          style={{
            ...styles.button,
            ...(isMobile ? styles.buttonMobile : {}),
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.05)";
            e.target.style.boxShadow = "0 12px 32px rgba(255, 255, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0 8px 24px rgba(255, 255, 255, 0.2)";
          }}
        >
          Entrer dans l'univers →
        </button>

        {/* Menu discret en bas */}
        <div style={styles.bottomMenu}>
          <button
            onClick={() => navigate("/profile")}
            style={styles.menuButton}
          >
            Profil
          </button>
          <span style={styles.menuSeparator}>•</span>
          <button
            onClick={() => navigate("/projets")}
            style={styles.menuButton}
          >
            Projets
          </button>
          <span style={styles.menuSeparator}>•</span>
          <button
            onClick={() => navigate("/notifications")}
            style={styles.menuButton}
          >
            Notifications
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: "relative",
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  video: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    filter: "blur(10px) brightness(0.4)",
    zIndex: 0,
  },
  fallbackImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 1,
  },
  content: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "2rem",
  },
  emoji: {
    fontSize: "64px",
    marginBottom: "2rem",
    transition: "transform 0.3s ease",
    transformOrigin: "bottom right",
  },
  greeting: {
    color: "#e0e0e0",
    fontWeight: 300,
    margin: 0,
    marginBottom: "0.5rem",
  },
  name: {
    color: "#ffffff",
    fontWeight: 400,
    margin: 0,
    marginBottom: "3rem",
  },
  button: {
    background: "linear-gradient(90deg, #8B5CF6 0%, #6366F1 100%)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: 600,
    padding: "18px 40px",
    borderRadius: "50px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 8px 32px rgba(139, 92, 246, 0.5)",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
  },
  buttonMobile: {
    fontSize: "16px",
    padding: "14px 28px",
  },
  bottomMenu: {
    position: "fixed",
    bottom: "2rem",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    zIndex: 10,
  },
  menuButton: {
    background: "transparent",
    border: "none",
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: "14px",
    cursor: "pointer",
    transition: "color 0.3s ease",
    fontWeight: 400,
  },
  menuSeparator: {
    color: "rgba(255, 255, 255, 0.3)",
    fontSize: "14px",
  },
};
