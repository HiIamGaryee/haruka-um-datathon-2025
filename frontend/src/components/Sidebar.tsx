import { NavLink } from "react-router-dom";
import { LayoutDashboard, BarChart3, FileText } from "lucide-react";
import { cn } from "../lib/utils";
import { Separator } from "./ui/separator";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Forecast", icon: BarChart3, path: "/forecast" },
  { label: "Reports", icon: FileText, path: "/report" },
];

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      {/* BRAND */}
      <div className="px-6 py-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted border-2 border-border shadow-sm">
            <span className="text-2xl font-bold text-foreground">H</span>
          </div>
          <div className="flex flex-col">
            <div className="text-xl font-bold text-foreground leading-tight">
              Haruka UM
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Datathon 2025
            </div>
          </div>
        </div>
      </div>

      <Separator className="mx-4" />

      {/* NAV */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={label}
            to={path}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-lg",
                "hover:bg-muted/50",
                isActive
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-primary/70"
                  )}
                />
                <span
                  className={cn(
                    "flex-1",
                    isActive && "font-semibold text-primary"
                  )}
                >
                  {label}
                </span>
                {isActive && (
                  <>
                    <div className="absolute left-0 bottom-0 top-0 w-1 rounded-r-full bg-primary" />
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <Separator className="mx-4" />

      {/* FOOTER */}
      <div className="px-6 py-5">
        <div className="text-xs text-muted-foreground text-center font-medium">
          v1.0 · AZ Theme
        </div>
      </div>
    </aside>
  );
}
