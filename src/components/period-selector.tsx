import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUiStore } from "@/store/ui-store"
import { getRecentPeriods, formatPeriod } from "@/lib/period"

const periods = getRecentPeriods(24)

export function PeriodSelector() {
  const currentPeriod = useUiStore((s) => s.currentPeriod)
  const setCurrentPeriod = useUiStore((s) => s.setCurrentPeriod)

  return (
    <Select value={currentPeriod} onValueChange={setCurrentPeriod}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {periods.map((p) => (
          <SelectItem key={p} value={p}>
            {formatPeriod(p)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
