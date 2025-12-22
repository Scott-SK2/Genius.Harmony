import { createContext, useState, useContext, useEffect } from "react";

const ThemeContext = createContext();

export const themes = {
  light: {
    // Backgrounds
    bg: {
      primary: "#faf8ff", // Violet très très clair
      secondary: "#ffffff",
      tertiary: "#f8f5ff", // Légèrement violet
      card: "#ffffff",
      hover: "#f3edff", // Violet clair au survol
    },
    // Text
    text: {
      primary: "#2d1b69", // Violet très foncé
      secondary: "#6b46c1", // Violet moyen
      tertiary: "#9f7aea", // Violet clair
      inverse: "#ffffff",
    },
    // Borders
    border: {
      light: "#e9d8fd", // Violet très clair
      medium: "#d6bcfa", // Violet clair
      dark: "#b794f4", // Violet moyen clair
    },
    // Colors
    colors: {
      primary: "#7c3aed", // Violet principal
      secondary: "#f97316", // Orange principal
      accent: "#fb923c", // Orange clair
      success: "#10b981", // Vert
      warning: "#f59e0b", // Orange warning
      danger: "#ef4444", // Rouge
      info: "#3b82f6", // Bleu
      purple: "#7c3aed",
      violet: "#a78bfa",
      orange: "#f97316",
      orangeLight: "#fb923c",
    },
    // Shadows
    shadow: {
      sm: "0 1px 3px rgba(124, 58, 237, 0.1)",
      md: "0 4px 6px rgba(124, 58, 237, 0.15)",
      lg: "0 10px 15px rgba(124, 58, 237, 0.2)",
      xl: "0 20px 25px rgba(124, 58, 237, 0.25)",
    },
  },
  dark: {
    // Backgrounds
    bg: {
      primary: "#0f0a1e", // Violet très très foncé
      secondary: "#1a0f3d", // Violet ultra foncé
      tertiary: "#2d1b69", // Violet très foncé
      card: "#1e1347", // Violet foncé
      hover: "#3d2578", // Violet moyen foncé
    },
    // Text
    text: {
      primary: "#f3edff", // Blanc légèrement violet
      secondary: "#c4b5fd", // Violet clair
      tertiary: "#a78bfa", // Violet moyen clair
      inverse: "#0f0a1e",
    },
    // Borders
    border: {
      light: "#4c1d95", // Violet foncé
      medium: "#6b46c1", // Violet moyen
      dark: "#7c3aed", // Violet principal
    },
    // Colors
    colors: {
      primary: "#8b5cf6", // Violet principal (plus clair en mode sombre)
      secondary: "#fb923c", // Orange principal
      accent: "#fdba74", // Orange clair
      success: "#10b981", // Vert
      warning: "#fbbf24", // Orange/jaune warning
      danger: "#f87171", // Rouge
      info: "#60a5fa", // Bleu
      purple: "#8b5cf6",
      violet: "#a78bfa",
      orange: "#fb923c",
      orangeLight: "#fdba74",
    },
    // Shadows
    shadow: {
      sm: "0 1px 3px rgba(139, 92, 246, 0.3)",
      md: "0 4px 6px rgba(139, 92, 246, 0.4)",
      lg: "0 10px 15px rgba(139, 92, 246, 0.5)",
      xl: "0 20px 25px rgba(139, 92, 246, 0.6)",
    },
  },
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
    document.body.style.backgroundColor = isDark
      ? themes.dark.bg.primary
      : themes.light.bg.primary;
    document.body.style.color = isDark
      ? themes.dark.text.primary
      : themes.light.text.primary;
  }, [isDark]);

  const theme = isDark ? themes.dark : themes.light;

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
