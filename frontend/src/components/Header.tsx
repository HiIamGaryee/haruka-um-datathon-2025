import { NavLink, useLocation } from "react-router-dom"
import ThemeToggle from "./ThemeToggle"
import { LayoutDashboard, BarChart3, FileText } from "lucide-react"
import { cn } from "../lib/utils"
import { Separator } from "./ui/separator"

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Forecast", icon: BarChart3, path: "/forecast" },
  { label: "Report", icon: FileText, path: "/report" },
]

export default function Header() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-foreground">
            Haruka UM Cash Flow Dashboard
          </h1>
          <p className="text-xs text-muted-foreground">Datathon 2025</p>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>

      <Separator />

      <nav className="container flex items-center gap-1 px-6">
        {navItems.map(({ label, icon: Icon, path }) => {
          const isActive = location.pathname === path
          return (
            <NavLink
              key={path}
              to={path}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                "relative border-b-2 border-transparent",
                isActive
                  ? "text-primary border-primary"
                  : "text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          )
        })}
      </nav>
    </header>
  )
}
