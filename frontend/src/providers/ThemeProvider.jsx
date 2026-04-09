import { useLayoutEffect, useMemo } from "react";
import { ThemeContext } from "./ThemeContext.js";

function applyDarkMode() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const body = document.body;
  const appRoot = document.getElementById("root");
  
  // Force dark mode
  root.classList.add("dark");
  root.classList.remove("light");
  if (body) {
    body.classList.add("dark");
    body.classList.remove("light");
  }
  if (appRoot) {
    appRoot.classList.add("dark");
    appRoot.classList.remove("light");
  }
  
  root.style.colorScheme = "dark";
  root.setAttribute("data-theme", "dark");
}

export function ThemeProvider({ children }) {
  // Always use dark theme
  const theme = "dark";

  useLayoutEffect(() => {
    applyDarkMode();
  }, []);

  // Dummy functions for compatibility
  const setTheme = () => {};
  const toggleTheme = () => {};

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

