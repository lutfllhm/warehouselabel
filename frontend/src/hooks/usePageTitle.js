import { useEffect } from "react";

/**
 * Custom hook to dynamically update page title
 * @param {string} title - The page title
 * @param {string} suffix - Optional suffix (default: "RBM Warehouse Label")
 */
export function usePageTitle(title, suffix = "RBM Warehouse Label") {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} - ${suffix}` : suffix;

    // Cleanup: restore previous title when component unmounts
    return () => {
      document.title = previousTitle;
    };
  }, [title, suffix]);
}
