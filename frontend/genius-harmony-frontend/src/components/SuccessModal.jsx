import { useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

export default function SuccessModal({ isOpen, onClose, title, message, type = "success", autoDismiss = true, dismissDelay = 3000 }) {
  const { theme } = useTheme();

  useEffect(() => {
    if (isOpen && autoDismiss) {
      const timer = setTimeout(() => {
        onClose();
      }, dismissDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoDismiss, dismissDelay, onClose]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          icon: "✓",
          color: "#10b981",
          bgColor: "rgba(16, 185, 129, 0.15)",
          borderColor: "rgba(16, 185, 129, 0.4)",
          iconBg: "rgba(16, 185, 129, 0.2)",
        };
      case "info":
        return {
          icon: "ℹ",
          color: "#3b82f6",
          bgColor: "rgba(59, 130, 246, 0.15)",
          borderColor: "rgba(59, 130, 246, 0.4)",
          iconBg: "rgba(59, 130, 246, 0.2)",
        };
      case "warning":
        return {
          icon: "⚠",
          color: "#f59e0b",
          bgColor: "rgba(245, 158, 11, 0.15)",
          borderColor: "rgba(245, 158, 11, 0.4)",
          iconBg: "rgba(245, 158, 11, 0.2)",
        };
      default:
        return {
          icon: "✓",
          color: "#10b981",
          bgColor: "rgba(16, 185, 129, 0.15)",
          borderColor: "rgba(16, 185, 129, 0.4)",
          iconBg: "rgba(16, 185, 129, 0.2)",
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
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        padding: "1rem",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: theme.bg.tertiary,
          borderRadius: "20px",
          maxWidth: "450px",
          width: "100%",
          padding: "0",
          boxShadow: `0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px ${styles.borderColor}`,
          border: `2px solid ${styles.borderColor}`,
          animation: "slideUp 0.3s ease-out",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar for auto-dismiss */}
        {autoDismiss && (
          <div
            style={{
              height: "4px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              width: "100%",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                backgroundColor: styles.color,
                animation: `progressBar ${dismissDelay}ms linear`,
                boxShadow: `0 0 10px ${styles.color}`,
              }}
            />
          </div>
        )}

        {/* Content */}
        <div style={{ padding: "2rem" }}>
          {/* Icon and Title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: styles.iconBg,
                border: `3px solid ${styles.color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                flexShrink: 0,
                boxShadow: `0 4px 12px ${styles.color}40`,
              }}
            >
              {styles.icon}
            </div>
            <h2
              style={{
                margin: 0,
                color: "#ffffff",
                fontSize: "1.35rem",
                fontWeight: "700",
                flex: 1,
              }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "#9ca3af",
                fontSize: "1.5rem",
                cursor: "pointer",
                padding: "0.25rem",
                lineHeight: 1,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.color = "#ffffff";
                e.target.style.transform = "rotate(90deg)";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "#9ca3af";
                e.target.style.transform = "rotate(0deg)";
              }}
            >
              ✕
            </button>
          </div>

          {/* Message */}
          {message && (
            <div
              style={{
                padding: "1.25rem",
                backgroundColor: styles.bgColor,
                border: `2px solid ${styles.borderColor}`,
                borderRadius: "12px",
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
          )}

          {/* Auto-dismiss notice */}
          {autoDismiss && (
            <div
              style={{
                marginTop: "1.25rem",
                textAlign: "center",
                color: "#9ca3af",
                fontSize: "0.85rem",
              }}
            >
              Ce message se fermera automatiquement...
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes progressBar {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
