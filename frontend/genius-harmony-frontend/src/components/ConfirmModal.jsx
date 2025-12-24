import { useTheme } from "../context/ThemeContext";

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirmer", cancelText = "Annuler", type = "danger" }) {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: "🗑️",
          color: "#dc2626",
          bgColor: "rgba(220, 38, 38, 0.1)",
          borderColor: "rgba(220, 38, 38, 0.3)",
        };
      case "warning":
        return {
          icon: "⚠️",
          color: "#f59e0b",
          bgColor: "rgba(245, 158, 11, 0.1)",
          borderColor: "rgba(245, 158, 11, 0.3)",
        };
      case "info":
        return {
          icon: "ℹ️",
          color: theme.colors.primary,
          bgColor: "rgba(124, 58, 237, 0.1)",
          borderColor: "rgba(124, 58, 237, 0.3)",
        };
      default:
        return {
          icon: "❓",
          color: theme.colors.primary,
          bgColor: "rgba(124, 58, 237, 0.1)",
          borderColor: "rgba(124, 58, 237, 0.3)",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: theme.bg.tertiary,
          borderRadius: "20px",
          maxWidth: "500px",
          width: "100%",
          padding: "0",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          border: `2px solid ${styles.borderColor}`,
          animation: "modalFadeIn 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête avec icône */}
        <div
          style={{
            padding: "2rem 2rem 1.5rem",
            textAlign: "center",
            borderBottom: `1px solid ${theme.border.light}`,
          }}
        >
          <div
            style={{
              fontSize: "4rem",
              marginBottom: "1rem",
              filter: `drop-shadow(0 4px 12px ${styles.color}40)`,
            }}
          >
            {styles.icon}
          </div>
          <h2
            style={{
              margin: 0,
              color: "#ffffff",
              fontSize: "1.5rem",
              fontWeight: "700",
            }}
          >
            {title}
          </h2>
        </div>

        {/* Message */}
        <div
          style={{
            padding: "2rem",
          }}
        >
          <div
            style={{
              padding: "1.5rem",
              backgroundColor: styles.bgColor,
              border: `2px solid ${styles.borderColor}`,
              borderRadius: "12px",
              marginBottom: "1.5rem",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#ffffff",
                fontSize: "1rem",
                lineHeight: "1.6",
                whiteSpace: "pre-line",
                fontWeight: "500",
              }}
            >
              {message}
            </p>
          </div>

          {/* Boutons d'action */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "rgba(156, 163, 175, 0.2)",
                color: "#d1d5db",
                border: "2px solid rgba(156, 163, 175, 0.3)",
                borderRadius: "10px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "rgba(156, 163, 175, 0.3)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "rgba(156, 163, 175, 0.2)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              {cancelText}
            </button>

            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: type === "danger" ? "#dc2626" : type === "warning" ? "#f59e0b" : theme.colors.primary,
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: `0 4px 12px ${styles.color}40`,
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = type === "danger" ? "#b91c1c" : type === "warning" ? "#d97706" : theme.colors.purpleLight;
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = `0 6px 20px ${styles.color}60`;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = type === "danger" ? "#dc2626" : type === "warning" ? "#f59e0b" : theme.colors.primary;
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = `0 4px 12px ${styles.color}40`;
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
