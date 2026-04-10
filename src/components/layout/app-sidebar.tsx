import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  BookOpen,
  FileText,
  FileSpreadsheet,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/", label: "Inicio", icon: LayoutDashboard },
  { to: "/ventas", label: "Ventas", icon: TrendingUp },
  { to: "/compras", label: "Compras", icon: TrendingDown },
  { to: "/libro", label: "Libro de C/V", icon: BookOpen },
  { to: "/f29", label: "F29", icon: FileText },
  { to: "/f22", label: "F22", icon: FileSpreadsheet },
  { to: "/configuracion", label: "Configuracion", icon: Settings },
]

export function AppSidebar() {
  return (
    <aside className="no-print flex h-full w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center border-b px-4">
        <h1 className="text-lg font-bold tracking-tight">Contability</h1>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )
            }
          >
            <item.icon className="size-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
