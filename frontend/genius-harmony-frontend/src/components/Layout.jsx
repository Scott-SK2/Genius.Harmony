import Navbar from "./Navbar";
import { useTheme } from "../context/ThemeContext";

export default function Layout({ children }) {
  const { theme } = useTheme();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: theme.bg.primary,
      }}
    >
      <Navbar />
      <main
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "2rem",
        }}
      >
        {children}
      </main>
    </div>
  );
}
