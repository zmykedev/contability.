import type { UUID, CLP, RUT, ISODateString, PeriodKey } from "./common"
import type { SiiDocumentType } from "./common"

export type TransactionType = "venta" | "compra"

export interface Transaction {
  id: UUID
  type: TransactionType
  date: ISODateString
  period: PeriodKey
  documentType: SiiDocumentType
  documentNumber: number
  counterpartRut: RUT
  counterpartName: string
  description: string
  netoAmount: CLP       // Para honorarios: monto bruto del servicio
  ivaAmount: CLP        // Para honorarios: siempre 0
  totalAmount: CLP      // Para honorarios: igual a netoAmount
  retencionAmount: CLP  // Solo para honorarios: 14.5% del bruto
  isExenta: boolean
  isHonorario: boolean  // true = boleta de honorarios electrónica
  isNegative: boolean   // true = nota de crédito (reduce totales)
  createdAt: string
  updatedAt: string
}
