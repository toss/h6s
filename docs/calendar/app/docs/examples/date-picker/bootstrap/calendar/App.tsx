import { useEffect, useState } from "react";
import DateCalendar from "./DateCalendar";

export default function App() {
  const [isDark, setIsDark] = useState(() => 
    typeof window !== 'undefined' && window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  // Detect system dark mode and update Bootstrap theme
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

  return (
    <div 
      className="w-100 vh-100 p-3" 
      style={{ backgroundColor: isDark ? '#111827' : 'white' }}
    >
      <DateCalendar />
    </div>
  );
}
