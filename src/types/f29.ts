import type { CLP, PeriodKey } from "./common"

export interface F29Data {
  period: PeriodKey

  // Ventas (Debito Fiscal)
  ventasAfectasNeto: CLP       // Codigo 538
  ventasExentas: CLP           // Codigo 586
  debitoFiscal: CLP            // IVA sobre ventas afectas

  // Compras (Credito Fiscal)
  comprasAfectasNeto: CLP      // Codigo 111
  comprasExentas: CLP
  creditoFiscal: CLP           // IVA sobre compras afectas

  // Calculo IVA
  diferenciaDebitoCreditoIva: CLP  // Codigo 91
  remanenteMesAnterior: CLP       // Codigo 77
  ivaDeterminado: CLP

  // PPM
  baseImponiblePpm: CLP
  tasaPpm: number
  ppmDeterminado: CLP

  // Retencion Honorarios
  retencionHonorarios: CLP

  // Remanente generado este mes (para el siguiente)
  remanenteSiguiente: CLP

  // Total
  totalAPagar: CLP

  // Conteos
  cantidadDocVentas: number
  cantidadDocCompras: number
}
