import type { CLP } from "./common"

export interface F22Data {
  year: number
  totalIngresosAfectos: CLP
  totalIngresosExentos: CLP
  totalGastos: CLP
  baseImponible: CLP
  impuestoPrimeraCategoria: CLP
  ppmPagados: CLP
  creditosPorRetencion: CLP
  diferenciaAPagar: CLP
  devolucion: CLP
}
