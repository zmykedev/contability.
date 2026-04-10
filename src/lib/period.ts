import type { PeriodKey } from "@/types/common"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function getCurrentPeriod(): PeriodKey {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

export function formatPeriod(period: PeriodKey): string {
  const [year, month] = period.split("-")
  const date = new Date(parseInt(year!, 10), parseInt(month!, 10) - 1, 1)
  const formatted = format(date, "MMMM yyyy", { locale: es })
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function dateToPeriod(date: string): PeriodKey {
  return date.slice(0, 7)
}

export function getYearPeriods(year: number): PeriodKey[] {
  return Array.from({ length: 12 }, (_, i) =>
    `${year}-${String(i + 1).padStart(2, "0")}` as PeriodKey
  )
}

export function getRecentPeriods(count: number): PeriodKey[] {
  const periods: PeriodKey[] = []
  const now = new Date()
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    periods.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
  }
  return periods
}
