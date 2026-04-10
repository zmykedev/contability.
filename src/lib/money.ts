import type { CLP } from "@/types/common"

export function formatCLP(amount: CLP): string {
  const abs = Math.abs(amount)
  const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return amount < 0 ? `-$${formatted}` : `$${formatted}`
}

export function parseCLP(input: string): CLP | null {
  const cleaned = input.replace(/[$.\s]/g, "").replace(/,/g, "")
  if (cleaned === "" || cleaned === "-") return null
  const num = parseInt(cleaned, 10)
  if (isNaN(num)) return null
  return num
}

export function roundCLP(amount: number): CLP {
  return Math.round(amount)
}
