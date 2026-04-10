import type { CLP } from "@/types/common"
import { formatCLP } from "@/lib/money"
import { cn } from "@/lib/utils"

interface MoneyDisplayProps {
  amount: CLP
  className?: string
  showSign?: boolean
}

export function MoneyDisplay({ amount, className, showSign }: MoneyDisplayProps) {
  return (
    <span
      className={cn(
        "tabular-nums",
        showSign && amount > 0 && "text-green-600 dark:text-green-400",
        showSign && amount < 0 && "text-red-600 dark:text-red-400",
        className
      )}
    >
      {showSign && amount > 0 ? "+" : ""}
      {formatCLP(amount)}
    </span>
  )
}
