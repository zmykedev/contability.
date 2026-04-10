import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { PeriodSelector } from "@/components/period-selector"
import { useCompanyStore } from "@/store/company-store"
import { useUiStore } from "@/store/ui-store"

export function AppHeader() {
  const companyName = useCompanyStore((s) => s.company.razonSocial)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)

  return (
    <header className="no-print flex h-14 items-center gap-4 border-b bg-background px-4">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="size-5" />
      </Button>
      <div className="flex-1">
        {companyName && (
          <span className="text-sm font-medium text-muted-foreground">
            {companyName}
          </span>
        )}
      </div>
      <PeriodSelector />
      <ThemeToggle />
    </header>
  )
}
