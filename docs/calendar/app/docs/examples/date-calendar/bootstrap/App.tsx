import { useEffect } from "react";
import DateCalendar from "./DateCalendar";

export default function App() {
  useEffect(() => {
    function updateTheme() {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.setAttribute("data-bs-theme", isDark ? "dark" : "light");
    }

    updateTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", updateTheme);

    return () => {
      mediaQuery.removeEventListener("change", updateTheme);
    };
  }, []);

  return (
    <div className="w-100 vh-100 p-3 bg-body">
      <DateCalendar />
    </div>
  );
}
