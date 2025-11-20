import { useEffect, useState } from "react";

/**
 * Hook to manage Bootstrap theme and app background color based on system dark mode
 * @returns isDark - boolean indicating if dark mode is active
 */
export function useBootstrapTheme() {
  const [isDark, setIsDark] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  useEffect(() => {
    function updateTheme() {
      const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.setAttribute("data-bs-theme", isDarkMode ? "dark" : "light");
      setIsDark(isDarkMode);
    }

    updateTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", updateTheme);

    return () => {
      mediaQuery.removeEventListener("change", updateTheme);
    };
  }, []);

  return isDark;
}
