import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"
import { Button } from "./ui/button"
import { cn } from "../lib/utils"

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  )

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      root.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [isDark])

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setIsDark(!isDark)}
      className="gap-2"
    >
      {isDark ? (
        <>
          <Moon className="h-4 w-4" />
          <span className="hidden sm:inline">Night Mode</span>
        </>
      ) : (
        <>
          <Sun className="h-4 w-4" />
          <span className="hidden sm:inline">Day Mode</span>
        </>
      )}
    </Button>
  )
}
