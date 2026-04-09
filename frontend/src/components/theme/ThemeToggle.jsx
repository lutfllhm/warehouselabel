import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../providers/useTheme.js";

export default function ThemeToggle({ size = 18, variant = "default" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // Variant 1: Default with text (original improved)
  if (variant === "default") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:bg-slate-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900/80 dark:focus-visible:ring-indigo-500/20"
        aria-label="Toggle theme"
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span className="relative z-10 flex items-center gap-2 transition-transform duration-300 group-hover:scale-105">
          <span className="relative">
            <Sun
              size={size}
              className={`absolute inset-0 rotate-0 scale-100 transition-all duration-500 ${
                isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
              }`}
            />
            <Moon
              size={size}
              className={`rotate-0 scale-100 transition-all duration-500 ${
                isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
              }`}
            />
          </span>
          <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
        </span>
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full dark:via-white/10" />
      </button>
    );
  }

  // Variant 2: Icon only with smooth animation
  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className="group relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:bg-slate-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900/80 dark:focus-visible:ring-indigo-500/20"
        aria-label="Toggle theme"
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span className="relative transition-transform duration-300 group-hover:scale-110">
          <Sun
            size={size}
            className={`absolute inset-0 rotate-0 scale-100 transition-all duration-500 ${
              isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
            }`}
          />
          <Moon
            size={size}
            className={`rotate-0 scale-100 transition-all duration-500 ${
              isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
            }`}
          />
        </span>
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full dark:via-white/10" />
      </button>
    );
  }

  // Variant 3: Pill switch style (modern toggle)
  if (variant === "switch") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className="group relative inline-flex h-10 w-20 items-center rounded-full border-2 border-slate-200 bg-slate-100 p-1 shadow-inner transition-all duration-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:focus-visible:ring-indigo-500/20"
        aria-label="Toggle theme"
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md transition-all duration-500 dark:bg-slate-900 ${
            isDark ? "translate-x-10" : "translate-x-0"
          }`}
        >
          <Sun
            size={16}
            className={`absolute rotate-0 scale-100 text-amber-500 transition-all duration-500 ${
              isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
            }`}
          />
          <Moon
            size={16}
            className={`rotate-0 scale-100 text-indigo-400 transition-all duration-500 ${
              isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
            }`}
          />
        </span>
      </button>
    );
  }

  // Variant 4: Minimal with background change
  if (variant === "minimal") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`group relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full transition-all duration-500 hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 dark:focus-visible:ring-indigo-500/20 ${
          isDark
            ? "bg-slate-800 text-amber-300 shadow-lg shadow-slate-900/50"
            : "bg-amber-100 text-amber-600 shadow-lg shadow-amber-500/20"
        }`}
        aria-label="Toggle theme"
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span className="relative transition-transform duration-500 group-hover:rotate-12">
          <Sun
            size={size}
            className={`absolute inset-0 rotate-0 scale-100 transition-all duration-500 ${
              isDark ? "rotate-180 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
            }`}
          />
          <Moon
            size={18}
            className={`rotate-0 scale-100 transition-all duration-500 ${
              isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-180 scale-0 opacity-0"
            }`}
          />
        </span>
      </button>
    );
  }

  // Variant 5: Gradient style (most modern)
  if (variant === "gradient") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`group relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 dark:focus-visible:ring-indigo-500/20 ${
          isDark
            ? "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white"
            : "bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 text-white"
        }`}
        aria-label="Toggle theme"
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span className="relative z-10 transition-transform duration-500 group-hover:rotate-180">
          <Sun
            size={size}
            className={`absolute inset-0 rotate-0 scale-100 transition-all duration-500 ${
              isDark ? "rotate-180 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
            }`}
          />
          <Moon
            size={18}
            className={`rotate-0 scale-100 transition-all duration-500 ${
              isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-180 scale-0 opacity-0"
            }`}
          />
        </span>
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </button>
    );
  }

  return null;
}

