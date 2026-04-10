import { Outlet } from "react-router-dom"
import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"
import { useUiStore } from "@/store/ui-store"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { AppSidebar as SidebarContent } from "./app-sidebar"

export function AppLayout() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen)
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 md:hidden">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
