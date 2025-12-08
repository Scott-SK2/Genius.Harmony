import { createContext, useState, useContext, useEffect } from "react";

const ThemeContext = createContext();

export const themes = {
  light: {
    // Backgrounds
    bg: {
      primary: "#f5f7fa",
      secondary: "#ffffff",
      tertiary: "#f8f9fa",
      card: "#ffffff",
      hover: "#f1f3f5",
    },
    // Text
    text: {
      primary: "#2c3e50",
      secondary: "#7f8c8d",
      tertiary: "#95a5a6",
      inverse: "#ffffff",
    },
    // Borders
    border: {
      light: "#e9ecef",
      medium: "#dee2e6",
      dark: "#ced4da",
    },
    // Colors
    colors: {
      primary: "#3498db",
      success: "#27ae60",
      warning: "#f39c12",
      danger: "#e74c3c",
      info: "#1abc9c",
      purple: "#9b59b6",
      indigo: "#6366f1",
      pink: "#ec4899",
    },
    // Shadows
    shadow: {
      sm: "0 1px 3px rgba(0, 0, 0, 0.1)",
      md: "0 4px 6px rgba(0, 0, 0, 0.1)",
      lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
      xl: "0 20px 25px rgba(0, 0, 0, 0.15)",
    },
  },
  dark: {
    // Backgrounds
    bg: {
      primary: "#0f172a",
      secondary: "#1e293b",
      tertiary: "#334155",
      card: "#1e293b",
      hover: "#334155",
    },
    // Text
    text: {
      primary: "#f1f5f9",
      secondary: "#cbd5e1",
      tertiary: "#94a3b8",
      inverse: "#0f172a",
    },
    // Borders
    border: {
      light: "#334155",
      medium: "#475569",
      dark: "#64748b",
    },
    // Colors
    colors: {
      primary: "#3b82f6",
      success: "#10b981",
      warning: "#f59e0b",
      danger: "#ef4444",
      info: "#06b6d4",
      purple: "#a855f7",
      indigo: "#6366f1",
      pink: "#ec4899",
    },
    // Shadows
    shadow: {
      sm: "0 1px 3px rgba(0, 0, 0, 0.3)",
      md: "0 4px 6px rgba(0, 0, 0, 0.3)",
      lg: "0 10px 15px rgba(0, 0, 0, 0.4)",
      xl: "0 20px 25px rgba(0, 0, 0, 0.5)",
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
