import type { CLP } from "@/types/common"
import { IVA_RATE, RETENCION_HONORARIOS_RATE } from "@/types/common"
import { roundCLP } from "./money"

export function calculateIva(neto: CLP): CLP {
  return roundCLP(neto * IVA_RATE)
}

export function extractNeto(total: CLP): CLP {
  return roundCLP(total / (1 + IVA_RATE))
}

export function extractIva(total: CLP): CLP {
  return total - extractNeto(total)
}

export function calculatePpm(ventasAfectasNeto: CLP, tasaPpm: number): CLP {
  return roundCLP(ventasAfectasNeto * tasaPpm)
}

export function calculateRetencion(montoHonorarios: CLP): CLP {
  return roundCLP(montoHonorarios * RETENCION_HONORARIOS_RATE)
}
