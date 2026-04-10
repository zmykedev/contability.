import type { Transaction } from "@/types/transaction"
import type { F29Data } from "@/types/f29"
import type { CLP, PeriodKey } from "@/types/common"
import { SiiDocumentType } from "@/types/common"
import { calculateIva, calculatePpm } from "./tax"

// Tipos de documento que representan ajustes negativos (reducen base)
const NOTA_CREDITO_TYPES = new Set<number>([SiiDocumentType.NOTA_CREDITO_ELECTRONICA])

export function computeF29(
  transactions: Transaction[],
  period: PeriodKey,
  ppmRate: number,
  remanenteMesAnterior: CLP
): F29Data {
  const periodTx = transactions.filter((tx) => tx.period === period)

  const ventas = periodTx.filter((tx) => tx.type === "venta")
  // Compras regulares (excluye honorarios que se tratan por separado)
  const compras = periodTx.filter((tx) => tx.type === "compra" && !tx.isHonorario)
  const honorarios = periodTx.filter((tx) => tx.type === "compra" && tx.isHonorario)

  // --- Ventas ---
  const ventasAfectas = ventas.filter((tx) => !tx.isExenta)
  const ventasExentas = ventas.filter((tx) => tx.isExenta)

  // Nota de crédito en ventas: reduce el débito fiscal
  const ventasAfectasPositivas = ventasAfectas.filter((tx) => !NOTA_CREDITO_TYPES.has(tx.documentType))
  const ventasAfectasNegativas = ventasAfectas.filter((tx) => NOTA_CREDITO_TYPES.has(tx.documentType))
  const ventasExentasPositivas = ventasExentas.filter((tx) => !NOTA_CREDITO_TYPES.has(tx.documentType))
  const ventasExentasNegativas = ventasExentas.filter((tx) => NOTA_CREDITO_TYPES.has(tx.documentType))

  const ventasAfectasNeto =
    sum(ventasAfectasPositivas, "netoAmount") - sum(ventasAfectasNegativas, "netoAmount")
  const ventasExentasTotal =
    sum(ventasExentasPositivas, "totalAmount") - sum(ventasExentasNegativas, "totalAmount")

  // --- Compras ---
  const comprasAfectas = compras.filter((tx) => !tx.isExenta)
  const comprasExentas = compras.filter((tx) => tx.isExenta)

  // Nota de crédito en compras: reduce el crédito fiscal
  const comprasAfectasPositivas = comprasAfectas.filter((tx) => !NOTA_CREDITO_TYPES.has(tx.documentType))
  const comprasAfectasNegativas = comprasAfectas.filter((tx) => NOTA_CREDITO_TYPES.has(tx.documentType))
  const comprasExentasPositivas = comprasExentas.filter((tx) => !NOTA_CREDITO_TYPES.has(tx.documentType))
  const comprasExentasNegativas = comprasExentas.filter((tx) => NOTA_CREDITO_TYPES.has(tx.documentType))

  const comprasAfectasNeto =
    sum(comprasAfectasPositivas, "netoAmount") - sum(comprasAfectasNegativas, "netoAmount")
  const comprasExentasTotal =
    sum(comprasExentasPositivas, "totalAmount") - sum(comprasExentasNegativas, "totalAmount")

  // --- Cálculos IVA ---
  const debitoFiscal = calculateIva(ventasAfectasNeto)
  const creditoFiscal = calculateIva(comprasAfectasNeto)

  const diferenciaDebitoCreditoIva = debitoFiscal - creditoFiscal
  const ivaConRemanente = diferenciaDebitoCreditoIva - remanenteMesAnterior
  const ivaDeterminado = Math.max(0, ivaConRemanente)
  const remanenteSiguiente = Math.max(0, -ivaConRemanente)

  // --- PPM ---
  const ppmDeterminado = calculatePpm(ventasAfectasNeto, ppmRate)

  // --- Retención Honorarios ---
  const retencionHonorarios = honorarios.reduce((s, tx) => s + tx.retencionAmount, 0)

  const totalAPagar = ivaDeterminado + ppmDeterminado + retencionHonorarios

  const cantDocVentas = ventas.length
  const cantDocCompras = compras.length + honorarios.length

  return {
    period,
    ventasAfectasNeto,
    ventasExentas: ventasExentasTotal,
    debitoFiscal,
    comprasAfectasNeto,
    comprasExentas: comprasExentasTotal,
    creditoFiscal,
    diferenciaDebitoCreditoIva,
    remanenteMesAnterior,
    ivaDeterminado,
    remanenteSiguiente,
    baseImponiblePpm: Math.max(0, ventasAfectasNeto),
    tasaPpm: ppmRate,
    ppmDeterminado,
    retencionHonorarios,
    totalAPagar,
    cantidadDocVentas: cantDocVentas,
    cantidadDocCompras: cantDocCompras,
  }
}

function sum(transactions: Transaction[], field: "netoAmount" | "totalAmount"): CLP {
  return transactions.reduce((acc, tx) => acc + tx[field], 0)
}
