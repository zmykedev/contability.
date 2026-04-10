import type { Transaction } from "@/types/transaction"
import type { F29Data } from "@/types/f29"
import type { F22Data } from "@/types/f22"

const TASA_PRIMERA_CATEGORIA = 0.25

export function computeF22(
  transactions: Transaction[],
  f29History: F29Data[],
  year: number
): F22Data {
  const yearTx = transactions.filter((tx) => tx.date.startsWith(String(year)))

  const ventas = yearTx.filter((tx) => tx.type === "venta")
  const compras = yearTx.filter((tx) => tx.type === "compra")

  const ventasAfectas = ventas.filter((tx) => !tx.isExenta)
  const ventasExentas = ventas.filter((tx) => tx.isExenta)

  const totalIngresosAfectos = ventasAfectas.reduce((s, tx) => s + tx.netoAmount, 0)
  const totalIngresosExentos = ventasExentas.reduce((s, tx) => s + tx.totalAmount, 0)
  const totalGastos = compras.reduce((s, tx) => s + tx.netoAmount, 0)

  const baseImponible = Math.max(0, totalIngresosAfectos - totalGastos)
  const impuestoPrimeraCategoria = Math.round(baseImponible * TASA_PRIMERA_CATEGORIA)

  const ppmPagados = f29History
    .filter((f) => f.period.startsWith(String(year)))
    .reduce((s, f) => s + f.ppmDeterminado, 0)

  const creditosPorRetencion = 0

  const saldo = impuestoPrimeraCategoria - ppmPagados - creditosPorRetencion
  const diferenciaAPagar = Math.max(0, saldo)
  const devolucion = Math.max(0, -saldo)

  return {
    year,
    totalIngresosAfectos,
    totalIngresosExentos,
    totalGastos,
    baseImponible,
    impuestoPrimeraCategoria,
    ppmPagados,
    creditosPorRetencion,
    diferenciaAPagar,
    devolucion,
  }
}
