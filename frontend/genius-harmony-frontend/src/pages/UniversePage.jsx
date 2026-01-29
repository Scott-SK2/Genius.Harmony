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
  const [modalItem, setModalItem] = useState(null);

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
          title: "Casting Berceau des Anges",
          type: "video",
          src: "https://res.cloudinary.com/djvkp74yf/video/upload/v1769471625/WhatsApp_Vid%C3%A9o_2024-12-29_%C3%A0_21.59.27_7ab9c447_nnfxid.mp4",
          description: "Coulisses du casting",
        },
        {
          id: 2,
          title: "Celui qui plantait des tomates",
          type: "youtube",
          youtubeId: "Kb_yOq8npqM",
          description: "Court-métrage - Quartier Court",
        },
        {
          id: 3,
          title: "Celui qui pensait comme un psychopathe",
          type: "youtube",
          youtubeId: "wn9OhTFKV1c",
          description: "Court-métrage - Quartier Court",
        },
        {
          id: 4,
          title: "Une MAISON (pas très) HANTÉE",
          type: "youtube",
          youtubeId: "MfT44bKGZKQ",
          description: "Court-métrage - BIFFF",
        },
        {
          id: 5,
          title: "Exfiltration",
          type: "youtube",
          youtubeId: "dLIcW45ZNgU",
          description: "Court-métrage action",
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
          title: "Hacking The Game",
          type: "image",
          src: "https://res.cloudinary.com/djvkp74yf/image/upload/v1769473317/Affiche_HackingThe_Game_edition_2_utybdg.jpg",
          description: "Affiche officielle - Édition 2",
        },
        {
          id: 2,
          title: "Hacking The Game",
          type: "image",
          src: "https://res.cloudinary.com/djvkp74yf/image/upload/v1769473521/image00078_x6b25v.jpg",
          description: "Ambiance événement",
        },
        {
          id: 3,
          title: "Hacking The Game",
          type: "image",
          src: "https://res.cloudinary.com/djvkp74yf/image/upload/v1769473498/image00063_vzqchn.jpg",
          description: "Participants et networking",
        },
        {
          id: 4,
          title: "Hacking The Game",
          type: "image",
          src: "https://res.cloudinary.com/djvkp74yf/image/upload/v1769473496/image00062_ezgbpk.jpg",
          description: "Prestations scéniques",
        },
        {
          id: 5,
          title: "Je suis le Kongo",
          type: "image",
          src: "https://res.cloudinary.com/djvkp74yf/image/upload/v1769470595/DSC02249_p5gdqu.jpg",
          description: "Groupe de discussion",
        },
        {
          id: 6,
          title: "Je suis le Kongo",
          type: "image",
          src: "https://res.cloudinary.com/djvkp74yf/image/upload/v1769471105/DSC02027_puv9tq.jpg",
          description: "Échanges culturels",
        },
        {
          id: 7,
          title: "Je suis le Kongo",
          type: "image",
          src: "https://res.cloudinary.com/djvkp74yf/image/upload/v1769470870/DSC02346_u0sp3q.jpg",
          description: "Projet communautaire",
        },
        {
          id: 8,
          title: "Je suis le Kongo",
          type: "image",
          src: "https://res.cloudinary.com/djvkp74yf/image/upload/v1769470965/DSC02361_fcujj4.jpg",
          description: "Rencontres et débats",
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
          title: "Vodka",
          type: "spotify",
          spotifyUri: "track/1bfVnEe6G8BLQ7VITocWVy",
          artist: "Kaeloo",
          description: "Single - Management Genius.Harmony",
        },
        {
          id: 2,
          title: "Maladie d'amour",
          type: "spotify",
          spotifyUri: "track/5IXnkWW2gz0oJ3iW2H5bAI",
          artist: "Kaeloo",
          description: "Single - Management Genius.Harmony",
        },
        {
          id: 3,
          title: "Doucement",
          type: "spotify",
          spotifyUri: "track/2TlurdSYnfNUpj17Hwrm5h",
          artist: "Kaeloo",
          description: "Single - Management Genius.Harmony",
        },
        {
          id: 4,
          title: "Fuego",
          type: "spotify",
          spotifyUri: "track/19RPyuKEPz3hPxieI9M467",
          artist: "Kaeloo",
          description: "Single - Management Genius.Harmony",
        },
      ],
    },
    {
      id: 4,
      title: "Backstage / Coulisses",
      emoji: "📸",
      color: "#A8E6CF",
      items: [
        {
          id: 1,
          title: "BDA - Behind The Scenes 1",
          type: "video",
          src: "https://res.cloudinary.com/djvkp74yf/video/upload/v1769472661/Snapchat-523409813_uixehm.mp4",
          description: "Coulisses tournage",
        },
        {
          id: 2,
          title: "BDA - Behind The Scenes 2",
          type: "video",
          src: "https://res.cloudinary.com/djvkp74yf/video/upload/v1769472666/Snapchat-503447761_dec50a.mp4",
          description: "Moments backstage",
        },
        {
          id: 3,
          title: "BDA - Behind The Scenes 3",
          type: "video",
          src: "https://res.cloudinary.com/djvkp74yf/video/upload/v1769472671/Snapchat-346902583_qyrkz0.mp4",
          description: "Préparation événement",
        },
        {
          id: 4,
          title: "BDA - Behind The Scenes 4",
          type: "video",
          src: "https://res.cloudinary.com/djvkp74yf/video/upload/v1769472681/Snapchat-701793968_imqqr6.mp4",
          description: "En coulisses",
        },
        {
          id: 5,
          title: "BDA - Behind The Scenes 5",
          type: "video",
          src: "https://res.cloudinary.com/djvkp74yf/video/upload/v1769472673/Snapchat-653594586_zvwiql.mp4",
          description: "Vie du collectif",
        },
      ],
    },
  ];

  const handleCardClick = (item) => {
    setModalItem(item);
  };

  const handleCloseModal = () => {
    setModalItem(null);
  };

  return (
    <div style={styles.container}>
      {/* Contenu principal */}
      <main style={{
        ...styles.main,
        ...(isMobile ? styles.mainMobile : {}),
      }}>
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
      </main>

      {/* Modal pour afficher les médias en grand */}
      {modalItem && (
        <MediaModal
          item={modalItem}
          onClose={handleCloseModal}
          isMobile={isMobile}
        />
      )}
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
    <section style={{
      ...styles.section,
      ...(isMobile ? styles.sectionMobile : {}),
    }}>
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
          loading="lazy"
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
          loading="lazy"
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
      // Optimiser URL Cloudinary si c'est une vidéo Cloudinary
      const optimizedSrc = item.src.includes('cloudinary.com')
        ? item.src.replace('/upload/', '/upload/q_auto,f_auto/')
        : item.src;

      return (
        <video
          src={optimizedSrc}
          poster={item.thumbnail}
          style={styles.media}
          muted
          loop
          preload="none"
          onMouseEnter={(e) => e.target.play()}
          onMouseLeave={(e) => e.target.pause()}
        />
      );
    }

    // Image
    if (item.type === "image") {
      // Optimiser URL Cloudinary si c'est une image Cloudinary
      const optimizedSrc = item.src.includes('cloudinary.com')
        ? item.src.replace('/upload/', '/upload/w_400,h_300,c_fill,q_auto,f_auto/')
        : item.src;

      return (
        <img
          src={optimizedSrc}
          alt={item.title}
          style={styles.media}
          loading="lazy"
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
            loading="lazy"
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

// Composant Modal pour afficher les médias en grand
function MediaModal({ item, onClose, isMobile }) {
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
   */
  const getSpotifyUri = (url) => {
    if (!url) return null;
    const regExp = /spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/;
    const match = url.match(regExp);
    return match ? `${match[1]}/${match[2]}` : null;
  };

  const renderModalContent = () => {
    // YouTube embed
    if (item.type === "youtube") {
      const videoId = item.youtubeId || getYouTubeId(item.src);
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          style={styles.modalMedia}
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
          src={`https://player.vimeo.com/video/${videoId}?autoplay=1`}
          style={styles.modalMedia}
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
          style={styles.modalMedia}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          title={item.title}
        />
      );
    }

    // Vidéo locale ou Cloudinary
    if (item.type === "video") {
      const optimizedSrc = item.src.includes('cloudinary.com')
        ? item.src.replace('/upload/', '/upload/q_auto,f_auto/')
        : item.src;

      return (
        <video
          src={optimizedSrc}
          style={styles.modalMedia}
          controls
          autoPlay
          loop
        />
      );
    }

    // Image
    if (item.type === "image") {
      const optimizedSrc = item.src.includes('cloudinary.com')
        ? item.src.replace('/upload/', '/upload/w_auto,q_auto,f_auto/')
        : item.src;

      return (
        <img
          src={optimizedSrc}
          alt={item.title}
          style={styles.modalMedia}
        />
      );
    }

    return null;
  };

  return (
    <div
      style={styles.modalOverlay}
      onClick={onClose}
    >
      <div
        style={{
          ...styles.modalContent,
          ...(isMobile ? styles.modalContentMobile : {}),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          style={styles.closeButton}
        >
          ✕
        </button>

        {/* Média */}
        {renderModalContent()}

        {/* Informations */}
        <div style={styles.modalInfo}>
          <h3 style={styles.modalTitle}>{item.title}</h3>
          {item.artist && (
            <p style={styles.modalArtist}>{item.artist}</p>
          )}
          {item.description && (
            <p style={styles.modalDescription}>{item.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "calc(100vh - 70px)",
    color: "#ffffff",
  },
  main: {
    padding: "2rem 0",
  },
  mainMobile: {
    display: "flex",
    flexDirection: "row",
    overflowX: "auto",
    overflowY: "hidden",
    padding: "1rem 0",
    scrollSnapType: "x mandatory",
    WebkitOverflowScrolling: "touch",
  },
  section: {
    marginBottom: "3rem",
    padding: "0 2rem",
  },
  sectionMobile: {
    minWidth: "100vw",
    marginBottom: 0,
    padding: "0 1rem",
    scrollSnapAlign: "start",
    flexShrink: 0,
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
    flexDirection: "row",
    gap: "1rem",
    overflowX: "auto",
    overflowY: "hidden",
    scrollSnapType: "x mandatory",
    paddingBottom: "1rem",
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(255, 255, 255, 0.3) transparent",
    WebkitOverflowScrolling: "touch",
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
  // Styles pour le modal
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "2rem",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },
  modalContent: {
    position: "relative",
    maxWidth: "1200px",
    maxHeight: "90vh",
    width: "100%",
    backgroundColor: "#1a1a1a",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 24px 48px rgba(0, 0, 0, 0.8)",
  },
  modalContentMobile: {
    maxHeight: "95vh",
    borderRadius: "12px",
  },
  closeButton: {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    color: "#fff",
    fontSize: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    transition: "all 0.2s ease",
  },
  modalMedia: {
    width: "100%",
    maxHeight: "70vh",
    objectFit: "contain",
    backgroundColor: "#000",
  },
  modalInfo: {
    padding: "1.5rem",
    backgroundColor: "#1a1a1a",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: 600,
    margin: 0,
    marginBottom: "0.5rem",
    color: "#ffffff",
  },
  modalArtist: {
    fontSize: "16px",
    margin: 0,
    marginBottom: "0.5rem",
    color: "#a0a0a0",
  },
  modalDescription: {
    fontSize: "14px",
    margin: 0,
    color: "#808080",
    lineHeight: "1.6",
  },
};
