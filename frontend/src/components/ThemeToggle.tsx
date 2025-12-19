import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setIsDark(!isDark)}
      className="relative gap-2 overflow-hidden transition-all duration-300 hover:border-primary"
    >
      <div className="relative flex items-center justify-center w-4 h-4">
        {isDark ? (
          <Moon className="absolute h-4 w-4 animate-[icon-spin_0.5s_ease-out] text-indigo-300" />
        ) : (
          <Sun className="absolute h-4 w-4 animate-[icon-spin_0.5s_ease-out] text-orange-500" />
        )}
      </div>

      <span className="hidden sm:inline font-medium transition-opacity duration-300">
        {isDark ? "Night Mode" : "Day Mode"}
      </span>
    </Button>
  );
}
