import { useBootstrapTheme } from "./useBootstrapTheme";
import { DateRangePicker } from "./DateRangePicker";

export default function App() {
  const isDark = useBootstrapTheme();

  return (
    <div 
      className="w-100 vh-100 p-3" 
      style={{ backgroundColor: isDark ? '#111827' : 'white' }}
    >
      <DateRangePicker />
    </div>
  );
}
