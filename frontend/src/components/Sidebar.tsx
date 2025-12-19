import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  ShieldAlert,
  Layers,
} from "lucide-react";
import { cn } from "../lib/utils"; // Assuming you have a standard utils file, if not, remove 'cn' and use string templates

// Simple utility if you don't have cn
const cx = (...classes: (string | undefined | boolean)[]) =>
  classes.filter(Boolean).join(" ");

const NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Cash Forecast", icon: BarChart3, path: "/forecast" },
  { label: "Liquidity Risk", icon: ShieldAlert, path: "/liquidity-risk" },
  { label: "Cash Structure", icon: Layers, path: "/cash-structure" },
  { label: "Executive Report", icon: FileText, path: "/report" },
];

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-card">
      {/* BRAND HEADER */}
      <div className="px-6 py-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-md">
            {/* White Text on Mulberry Background */}
            <span className="text-2xl font-bold text-white">H</span>
          </div>
          <div className="flex flex-col">
            <div className="text-xl font-bold text-secondary leading-tight">
              Haruka UM
            </div>
            <div className="text-xs text-muted-foreground mt-1 font-medium">
              AZ Theme v1.0
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-border mx-6" />

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={label}
            to={path}
            className={({ isActive }) =>
              cx(
                "group relative flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-lg",
                isActive
                  ? "bg-primary/10 text-primary" // Active: Light Mulberry BG + Mulberry Text
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cx(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span>{label}</span>
                {isActive && (
                  <div className="absolute left-0 h-full w-1 rounded-r-full bg-primary" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="p-6 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          Powered by @HiIamGaryee
        </div>
      </div>
    </aside>
  );
}
