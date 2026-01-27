import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useResponsive } from "../hooks/useResponsive";

export default function UniversePage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  // Données des sections - Contenu réel de Genius Harmony
  const sections = [
    {
      id: 1,
      title: "Cinéma / Tournages",
      emoji: "🎬",
      color: "#FF6B6B",
      items: [
        {
          id: 1,
          title: "Berceau des Anges",
          type: "video",
          thumbnail: "/thumbnails/berceau-des-anges.jpg",
          src: "/videos/berceau-des-anges-trailer.mp4",
          description: "Court-métrage - Quartier Court",
        },
        {
          id: 2,
          title: "Sauf à Gaza",
          type: "video",
          thumbnail: "/thumbnails/sauf-a-gaza.jpg",
          src: "/videos/sauf-a-gaza-trailer.mp4",
          description: "Court-métrage - Quartier Court",
        },
        {
          id: 3,
          title: "Celui qui plantait des tomates",
          type: "video",
          thumbnail: "/thumbnails/tomates.jpg",
          src: "/videos/tomates-trailer.mp4",
          description: "Court-métrage - Quartier Court",
        },
        {
          id: 4,
          title: "Une MAISON pas très HANTÉE",
          type: "video",
          thumbnail: "/thumbnails/maison-hantee.jpg",
          src: "/videos/maison-hantee-trailer.mp4",
          description: "Court-métrage comédie",
        },
        {
          id: 5,
          title: "Exfiltration",
          type: "video",
          thumbnail: "/thumbnails/exfiltration.jpg",
          src: "/videos/exfiltration-trailer.mp4",
          description: "Court-métrage action",
        },
        {
          id: 6,
          title: "Celui qui pensait comme un psychopathe",
          type: "video",
          thumbnail: "/thumbnails/psychopathe.jpg",
          src: "/videos/psychopathe-trailer.mp4",
          description: "Court-métrage thriller",
        },
      ],
    },
    {
      id: 2,
      title: "Événements",
      emoji: "🎉",
      color: "#4ECDC4",
      items: [
        {
          id: 1,
          title: "WoSmen 2025",
          type: "image",
          src: "/images/wosmen-2025.jpg",
          description: "Événement 100% féminin - Mars 2025",
        },
        {
          id: 2,
          title: "Hacking The Game 2025",
          type: "video",
          thumbnail: "/thumbnails/htg-2025.jpg",
          src: "/videos/htg-2025-recap.mp4",
          description: "Diffusion courts-métrages + Networking",
        },
        {
          id: 3,
          title: "Hacking The Game 2024",
          type: "image",
          src: "/images/htg-2024.jpg",
          description: "Édition 2024 - Prestations scéniques",
        },
        {
          id: 4,
          title: "Hacking The Game 2023",
          type: "image",
          src: "/images/htg-2023.jpg",
          description: "Première édition - Brussels",
        },
        {
          id: 5,
          title: "Partenariat BIFFF",
          type: "image",
          src: "/images/bifff-partnership.jpg",
          description: "Brussels International Fantastic Film Festival",
        },
        {
          id: 6,
          title: "Collaboration Lezarts-Urbains",
          type: "image",
          src: "/images/lezarts-urbains.jpg",
          description: "Art urbain & culture émergente",
        },
      ],
    },
    {
      id: 3,
      title: "Musique",
      emoji: "🎵",
      color: "#FFD93D",
      items: [
        {
          id: 1,
          title: "Kaeloo - Single",
          type: "audio",
          thumbnail: "/thumbnails/kaeloo.jpg",
          src: "/audio/kaeloo-single.mp3",
          artist: "Kaeloo",
          description: "En production - Management GH",
        },
        {
          id: 2,
          title: "Kaeloo - Album Teaser",
          type: "video",
          thumbnail: "/thumbnails/kaeloo-album.jpg",
          src: "/videos/kaeloo-album-teaser.mp4",
          artist: "Kaeloo",
          description: "Teaser album à venir",
        },
        {
          id: 3,
          title: "Production musicale",
          type: "image",
          src: "/images/music-production.jpg",
          description: "Studio & production artistique",
        },
        {
          id: 4,
          title: "Management d'artistes",
          type: "image",
          src: "/images/artist-management.jpg",
          description: "Musiciens, acteurs, modèles",
        },
      ],
    },
    {
      id: 4,
      title: "Coulisses / Vie du collectif",
      emoji: "📸",
      color: "#A8E6CF",
      items: [
        {
          id: 1,
          title: "Backstage tournage",
          type: "image",
          src: "/images/backstage-cinema.jpg",
          description: "En coulisses sur nos tournages",
        },
        {
          id: 2,
          title: "Behind The Scenes - HTG",
          type: "video",
          thumbnail: "/thumbnails/bts-htg.jpg",
          src: "/videos/bts-htg.mp4",
          description: "Préparation événement",
        },
        {
          id: 3,
          title: "L'équipe Genius.Harmony",
          type: "image",
          src: "/images/team-gh.jpg",
          description: "Le collectif au complet",
        },
        {
          id: 4,
          title: "Studio sessions",
          type: "video",
          thumbnail: "/thumbnails/studio-session.jpg",
          src: "/videos/studio-session.mp4",
          description: "Sessions d'enregistrement",
        },
        {
          id: 5,
          title: "Networking Brussels",
          type: "image",
          src: "/images/networking.jpg",
          description: "Événements networking",
        },
      ],
    },
  ];

  const handleCardClick = (item) => {
    console.log("Clicked item:", item);
    // Ouvrir modal ou naviguer vers détail
  };

  const handleNavigateToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div style={styles.container}>
      {/* Header fixe */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo}>
            <span style={{ color: "#8B5CF6" }}>Genius</span>
            <span style={{ color: "#ffffff" }}>.Harmony</span>
          </h1>
          <div style={styles.headerRight}>
            <input
              type="search"
              placeholder="Rechercher..."
              style={styles.searchInput}
            />
            <button
              onClick={() => navigate("/profile")}
              style={styles.iconButton}
            >
              👤
            </button>
            <button
              onClick={() => navigate("/notifications")}
              style={styles.iconButton}
            >
              🔔
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main style={styles.main}>
        {sections.map((section) => (
          <Section
            key={section.id}
            section={section}
            isMobile={isMobile}
            hoveredCard={hoveredCard}
            setHoveredCard={setHoveredCard}
            onCardClick={handleCardClick}
          />
        ))}

        {/* Bouton pour aller au dashboard */}
        <div style={styles.dashboardButtonContainer}>
          <button
            onClick={handleNavigateToDashboard}
            style={styles.dashboardButton}
          >
            Accéder à mon espace →
          </button>
        </div>
      </main>
    </div>
  );
}

// Composant Section réutilisable
function Section({ section, isMobile, hoveredCard, setHoveredCard, onCardClick }) {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = direction === "left" ? -300 : 300;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section style={styles.section}>
      {/* Titre de section */}
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>
          <span style={{ marginRight: "0.5rem" }}>{section.emoji}</span>
          <span>SECTION {section.id}</span>
          <span style={{ margin: "0 0.5rem", color: "#666" }}>—</span>
          <span>{section.title}</span>
        </h2>
        {!isMobile && (
          <div style={styles.scrollButtons}>
            <button
              onClick={() => scroll("left")}
              style={styles.scrollButton}
            >
              ←
            </button>
            <button
              onClick={() => scroll("right")}
              style={styles.scrollButton}
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* Container de cartes scrollable */}
      <div
        ref={scrollContainerRef}
        style={styles.cardsContainer}
      >
        {section.items.map((item) => (
          <Card
            key={item.id}
            item={item}
            sectionColor={section.color}
            isMobile={isMobile}
            isHovered={hoveredCard === `${section.id}-${item.id}`}
            onHover={() => setHoveredCard(`${section.id}-${item.id}`)}
            onLeave={() => setHoveredCard(null)}
            onClick={() => onCardClick(item)}
          />
        ))}
      </div>
    </section>
  );
}

// Composant Card réutilisable
function Card({ item, sectionColor, isMobile, isHovered, onHover, onLeave, onClick }) {
  const cardStyle = {
    ...styles.card,
    ...(isMobile ? styles.cardMobile : {}),
    ...(isHovered ? styles.cardHovered : {}),
  };

  /**
   * Fonction pour extraire l'ID YouTube depuis une URL
   */
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  /**
   * Fonction pour extraire l'ID Vimeo depuis une URL
   */
  const getVimeoId = (url) => {
    if (!url) return null;
    const regExp = /vimeo.com\/(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  /**
   * Fonction pour extraire l'URI Spotify depuis une URL
   * Exemple: https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp
   * Retourne: track/3n3Ppam7vgaVa1iaRUc9Lp
   */
  const getSpotifyUri = (url) => {
    if (!url) return null;
    const regExp = /spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/;
    const match = url.match(regExp);
    return match ? `${match[1]}/${match[2]}` : null;
  };

  /**
   * Rendre le média selon le type
   */
  const renderMedia = () => {
    // YouTube embed
    if (item.type === "youtube") {
      const videoId = item.youtubeId || getYouTubeId(item.src);
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          style={styles.media}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={item.title}
        />
      );
    }

    // Vimeo embed
    if (item.type === "vimeo") {
      const videoId = item.vimeoId || getVimeoId(item.src);
      return (
        <iframe
          src={`https://player.vimeo.com/video/${videoId}`}
          style={styles.media}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={item.title}
        />
      );
    }

    // Spotify embed
    if (item.type === "spotify") {
      const spotifyUri = item.spotifyUri || getSpotifyUri(item.src);
      return (
        <iframe
          src={`https://open.spotify.com/embed/${spotifyUri}?utm_source=generator&theme=0`}
          style={styles.media}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title={item.title}
        />
      );
    }

    // Vidéo locale ou Cloudinary
    if (item.type === "video") {
      return (
        <video
          src={item.src}
          poster={item.thumbnail}
          style={styles.media}
          muted
          loop
          onMouseEnter={(e) => e.target.play()}
          onMouseLeave={(e) => e.target.pause()}
        />
      );
    }

    // Image
    if (item.type === "image") {
      return (
        <img
          src={item.src}
          alt={item.title}
          style={styles.media}
        />
      );
    }

    // Audio
    if (item.type === "audio") {
      return (
        <div style={styles.audioCard}>
          <img
            src={item.thumbnail}
            alt={item.title}
            style={styles.media}
          />
          <div style={styles.audioIcon}>🎵</div>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {/* Thumbnail ou media preview */}
      {renderMedia()}

      {/* Overlay avec titre */}
      <div style={styles.cardOverlay}>
        <div style={styles.cardContent}>
          <h3 style={styles.cardTitle}>{item.title}</h3>
          {item.artist && (
            <p style={styles.cardSubtitle}>{item.artist}</p>
          )}
          {item.description && (
            <p style={styles.cardDescription}>{item.description}</p>
          )}
          {(item.type === "video" || item.type === "youtube" || item.type === "vimeo") && (
            <span style={styles.playIcon}>▶</span>
          )}
          {item.type === "audio" && (
            <span style={styles.playIcon}>🎧</span>
          )}
        </div>
      </div>

      {/* Indicateur de type */}
      <div
        style={{
          ...styles.typeIndicator,
          backgroundColor: sectionColor,
        }}
      >
        {item.type === "video" && "📹"}
        {item.type === "image" && "🖼️"}
        {item.type === "audio" && "🎵"}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0A0A0F",
    color: "#ffffff",
  },
  header: {
    position: "sticky",
    top: 0,
    background: "rgba(0, 0, 0, 0.8)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    zIndex: 100,
    padding: "1rem 2rem",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  logo: {
    fontSize: "24px",
    fontWeight: 600,
    margin: 0,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  searchInput: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "8px",
    padding: "0.5rem 1rem",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
  },
  iconButton: {
    background: "transparent",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    padding: "0.5rem",
    transition: "transform 0.2s ease",
  },
  main: {
    padding: "2rem 0",
  },
  section: {
    marginBottom: "3rem",
    padding: "0 2rem",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1rem",
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: 600,
    margin: 0,
    display: "flex",
    alignItems: "center",
  },
  scrollButtons: {
    display: "flex",
    gap: "0.5rem",
  },
  scrollButton: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    color: "#ffffff",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  cardsContainer: {
    display: "flex",
    gap: "1rem",
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    paddingBottom: "1rem",
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(255, 255, 255, 0.3) transparent",
  },
  card: {
    position: "relative",
    width: "280px",
    height: "160px",
    borderRadius: "12px",
    overflow: "hidden",
    cursor: "pointer",
    flexShrink: 0,
    scrollSnapAlign: "start",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
  },
  cardMobile: {
    width: "220px",
    height: "130px",
  },
  cardHovered: {
    transform: "scale(1.05)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
    zIndex: 10,
  },
  media: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  audioCard: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  audioIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "48px",
    opacity: 0.8,
  },
  cardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
    padding: "1rem",
    transform: "translateY(0)",
    transition: "transform 0.3s ease",
  },
  cardContent: {
    position: "relative",
  },
  cardTitle: {
    fontSize: "14px",
    fontWeight: 600,
    margin: 0,
    marginBottom: "0.25rem",
    color: "#ffffff",
  },
  cardSubtitle: {
    fontSize: "12px",
    margin: 0,
    color: "#a0a0a0",
  },
  cardDescription: {
    fontSize: "11px",
    margin: 0,
    marginTop: "0.25rem",
    color: "#808080",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  playIcon: {
    position: "absolute",
    right: "0.5rem",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "20px",
  },
  typeIndicator: {
    position: "absolute",
    top: "0.5rem",
    right: "0.5rem",
    padding: "0.25rem 0.5rem",
    borderRadius: "6px",
    fontSize: "14px",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },
  dashboardButtonContainer: {
    display: "flex",
    justifyContent: "center",
    padding: "3rem 0",
  },
  dashboardButton: {
    background: "linear-gradient(90deg, #8B5CF6 0%, #6366F1 100%)",
    border: "none",
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: 600,
    padding: "1rem 2rem",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 8px 16px rgba(139, 92, 246, 0.3)",
  },
};
