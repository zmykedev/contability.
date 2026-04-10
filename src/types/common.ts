export type UUID = string
export type CLP = number
export type RUT = string
export type PeriodKey = string // "YYYY-MM"
export type ISODateString = string // "YYYY-MM-DD"

export enum SiiDocumentType {
  FACTURA_ELECTRONICA = 33,
  FACTURA_EXENTA_ELECTRONICA = 34,
  BOLETA_ELECTRONICA = 39,
  BOLETA_EXENTA_ELECTRONICA = 41,
  FACTURA_COMPRA_ELECTRONICA = 46,
  GUIA_DESPACHO_ELECTRONICA = 52,
  NOTA_DEBITO_ELECTRONICA = 56,
  NOTA_CREDITO_ELECTRONICA = 61,
}

export const SII_DOCUMENT_LABELS: Record<number, string> = {
  [SiiDocumentType.FACTURA_ELECTRONICA]: "Factura Electrónica",
  [SiiDocumentType.FACTURA_EXENTA_ELECTRONICA]: "Factura Exenta Electrónica",
  [SiiDocumentType.BOLETA_ELECTRONICA]: "Boleta Electrónica",
  [SiiDocumentType.BOLETA_EXENTA_ELECTRONICA]: "Boleta Exenta Electrónica",
  [SiiDocumentType.FACTURA_COMPRA_ELECTRONICA]: "Factura de Compra Electrónica",
  [SiiDocumentType.GUIA_DESPACHO_ELECTRONICA]: "Guía de Despacho Electrónica",
  [SiiDocumentType.NOTA_DEBITO_ELECTRONICA]: "Nota de Débito Electrónica",
  [SiiDocumentType.NOTA_CREDITO_ELECTRONICA]: "Nota de Crédito Electrónica",
}

export enum TaxRegime {
  PRO_PYME_GENERAL = "14D_N3",
  PRO_PYME_TRANSPARENTE = "14D_N8",
}

export const IVA_RATE = 0.19
export const RETENCION_HONORARIOS_RATE = 0.145
