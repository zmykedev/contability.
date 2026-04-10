/**
 * Utilidad para importar documentos tributarios desde CSV/Excel
 * Soporta el formato de exportación del SII (libro de compras/ventas)
 * y un formato genérico simple.
 */

import type { TransactionType } from "@/types/transaction"
import { SiiDocumentType } from "@/types/common"
import { formatRut, validateRut } from "./rut"

export interface ImportRow {
  date: string
  documentType: SiiDocumentType
  documentNumber: number
  counterpartRut: string
  counterpartName: string
  netoAmount: number
  ivaAmount: number
  totalAmount: number
  isExenta: boolean
  isHonorario: boolean
  isNegative: boolean
  description: string
  // Para preview
  _raw?: string
  _error?: string
}

export interface ImportResult {
  valid: ImportRow[]
  errors: Array<{ row: number; message: string; raw: string }>
}

// Mapeo de códigos DTE a SiiDocumentType
const DTE_MAP: Record<number, SiiDocumentType> = {
  33: SiiDocumentType.FACTURA_ELECTRONICA,
  34: SiiDocumentType.FACTURA_EXENTA_ELECTRONICA,
  39: SiiDocumentType.BOLETA_ELECTRONICA,
  41: SiiDocumentType.BOLETA_EXENTA_ELECTRONICA,
  46: SiiDocumentType.FACTURA_COMPRA_ELECTRONICA,
  52: SiiDocumentType.GUIA_DESPACHO_ELECTRONICA,
  56: SiiDocumentType.NOTA_DEBITO_ELECTRONICA,
  61: SiiDocumentType.NOTA_CREDITO_ELECTRONICA,
}

const NOTA_CREDITO_TYPES = new Set([SiiDocumentType.NOTA_CREDITO_ELECTRONICA])
const EXENTA_TYPES = new Set([
  SiiDocumentType.FACTURA_EXENTA_ELECTRONICA,
  SiiDocumentType.BOLETA_EXENTA_ELECTRONICA,
])

function cleanNumber(s: string): number {
  if (!s) return 0
  // Eliminar puntos de miles, espacios, signos de moneda, comillas
  const cleaned = s.trim().replace(/[$."\s]/g, "").replace(/,/g, "")
  const n = parseInt(cleaned, 10)
  return isNaN(n) ? 0 : Math.abs(n)
}

function parseDate(s: string): string | null {
  if (!s) return null
  s = s.trim()
  // Formato DD/MM/YYYY (formato SII)
  let m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (m) return `${m[3]}-${m[2]}-${m[1]}`
  // Formato YYYY-MM-DD
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (m) return s
  // Formato DD-MM-YYYY
  m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (m) return `${m[3]}-${m[2]}-${m[1]}`
  return null
}

function detectSeparator(header: string): string {
  if (header.includes(";")) return ";"
  if (header.includes("\t")) return "\t"
  return ","
}

/**
 * Detecta si el CSV es formato SII (libro de compras/ventas)
 * El formato SII tiene columnas como: Fecha;Tipo DTE;Nro DTE;RUT;Razón Social;...
 */
function isSiiFormat(headers: string[]): boolean {
  const h = headers.map((h) => h.toLowerCase().trim())
  return (
    h.some((x) => x.includes("tipo dte") || x.includes("tipo doc")) &&
    h.some((x) => x.includes("nro dte") || x.includes("folio") || x.includes("n° dte"))
  )
}

/**
 * Parsea CSV en formato SII (exportación directa del portal SII)
 * Columnas esperadas:
 * Fecha | Tipo DTE | Nro DTE | RUT | Razón Social | Monto Exento | Monto Neto | IVA | Total
 */
function parseSiiRow(
  cols: string[],
  headers: string[],
  rowNum: number,
  _type: TransactionType
): ImportRow | null {
  const h = headers.map((x) => x.toLowerCase().trim())

  const get = (keys: string[]): string => {
    for (const k of keys) {
      const idx = h.findIndex((x) => x.includes(k))
      if (idx >= 0 && cols[idx] !== undefined) return cols[idx]!.trim()
    }
    return ""
  }

  const rawDate = get(["fecha"])
  const rawDte = get(["tipo dte", "tipo doc"])
  const rawFolio = get(["nro dte", "folio", "n° dte", "numero"])
  const rawRut = get(["rut"])
  const rawName = get(["razón social", "razon social", "nombre"])
  const rawExento = get(["monto exento", "exento"])
  const rawNeto = get(["monto neto", "neto"])
  const rawIva = get(["iva"])
  const rawTotal = get(["total"])

  const date = parseDate(rawDate)
  if (!date) {
    return {
      _error: `Fila ${rowNum}: fecha inválida "${rawDate}"`,
      date: "", documentType: SiiDocumentType.FACTURA_ELECTRONICA,
      documentNumber: 0, counterpartRut: "", counterpartName: "",
      netoAmount: 0, ivaAmount: 0, totalAmount: 0, isExenta: false,
      isHonorario: false, isNegative: false, description: "",
      _raw: cols.join(";"),
    }
  }

  const dteCode = parseInt(rawDte.replace(/\D/g, ""), 10)
  const documentType = DTE_MAP[dteCode]
  if (!documentType) {
    return {
      _error: `Fila ${rowNum}: tipo DTE desconocido "${rawDte}"`,
      date, documentType: SiiDocumentType.FACTURA_ELECTRONICA,
      documentNumber: 0, counterpartRut: "", counterpartName: "",
      netoAmount: 0, ivaAmount: 0, totalAmount: 0, isExenta: false,
      isHonorario: false, isNegative: false, description: "",
      _raw: cols.join(";"),
    }
  }

  const documentNumber = parseInt(rawFolio.replace(/\D/g, ""), 10) || 0
  const rutRaw = rawRut.trim()
  const counterpartRut = validateRut(rutRaw) ? formatRut(rutRaw) : rutRaw
  const counterpartName = rawName

  const netoExento = cleanNumber(rawExento)
  const netoAfecto = cleanNumber(rawNeto)
  const ivaAmount = cleanNumber(rawIva)
  const totalAmount = cleanNumber(rawTotal) || netoAfecto + ivaAmount + netoExento

  // Si hay monto exento pero no neto afecto, es exenta
  const isExenta = EXENTA_TYPES.has(documentType) || (netoExento > 0 && netoAfecto === 0)
  const netoAmount = isExenta ? netoExento : netoAfecto
  const isNegative = NOTA_CREDITO_TYPES.has(documentType)

  return {
    date,
    documentType,
    documentNumber,
    counterpartRut,
    counterpartName,
    netoAmount,
    ivaAmount,
    totalAmount,
    isExenta,
    isHonorario: false,
    isNegative,
    description: "",
    _raw: cols.join(";"),
  }
}

/**
 * Parsea CSV en formato genérico/simple
 * Columnas esperadas:
 * fecha | tipo_dte | folio | rut | razon_social | neto | iva | total
 */
function parseGenericRow(
  cols: string[],
  headers: string[],
  rowNum: number,
  _type: TransactionType
): ImportRow | null {
  const h = headers.map((x) => x.toLowerCase().trim().replace(/[^a-z0-9]/g, "_"))

  const get = (keys: string[]): string => {
    for (const k of keys) {
      const idx = h.findIndex((x) => x.includes(k))
      if (idx >= 0 && cols[idx] !== undefined) return cols[idx]!.trim()
    }
    return ""
  }

  const rawDate = get(["fecha", "date"])
  const rawDte = get(["tipo", "dte", "tipo_doc", "documento"])
  const rawFolio = get(["folio", "numero", "nro"])
  const rawRut = get(["rut"])
  const rawName = get(["razon", "nombre", "name", "contraparte"])
  const rawNeto = get(["neto", "base", "monto_neto"])
  const rawIva = get(["iva"])
  const rawTotal = get(["total"])

  const date = parseDate(rawDate)
  if (!date) {
    return {
      _error: `Fila ${rowNum}: fecha inválida "${rawDate}"`,
      date: "", documentType: SiiDocumentType.FACTURA_ELECTRONICA,
      documentNumber: 0, counterpartRut: "", counterpartName: "",
      netoAmount: 0, ivaAmount: 0, totalAmount: 0, isExenta: false,
      isHonorario: false, isNegative: false, description: "",
      _raw: cols.join(";"),
    }
  }

  const dteCode = parseInt(rawDte.replace(/\D/g, ""), 10) || 33
  const documentType = DTE_MAP[dteCode] ?? SiiDocumentType.FACTURA_ELECTRONICA
  const documentNumber = parseInt(rawFolio.replace(/\D/g, ""), 10) || rowNum
  const rutRaw = rawRut.trim()
  const counterpartRut = validateRut(rutRaw) ? formatRut(rutRaw) : rutRaw
  const counterpartName = rawName

  const netoAmount = cleanNumber(rawNeto)
  const ivaAmount = cleanNumber(rawIva)
  const totalAmount = cleanNumber(rawTotal) || netoAmount + ivaAmount

  const isExenta = EXENTA_TYPES.has(documentType)
  const isNegative = NOTA_CREDITO_TYPES.has(documentType)

  if (netoAmount === 0 && totalAmount === 0) {
    return {
      _error: `Fila ${rowNum}: monto cero, fila omitida`,
      date, documentType, documentNumber, counterpartRut, counterpartName,
      netoAmount: 0, ivaAmount: 0, totalAmount: 0, isExenta,
      isHonorario: false, isNegative, description: "",
      _raw: cols.join(";"),
    }
  }

  return {
    date,
    documentType,
    documentNumber,
    counterpartRut,
    counterpartName,
    netoAmount,
    ivaAmount,
    totalAmount,
    isExenta,
    isHonorario: false,
    isNegative,
    description: "",
    _raw: cols.join(";"),
  }
}

export function parseCsvContent(
  content: string,
  type: TransactionType
): ImportResult {
  const lines = content.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) {
    return { valid: [], errors: [{ row: 0, message: "Archivo vacío o sin encabezados", raw: "" }] }
  }

  const sep = detectSeparator(lines[0]!)
  const headers = lines[0]!.split(sep)
  const isSii = isSiiFormat(headers)

  const valid: ImportRow[] = []
  const errors: ImportResult["errors"] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]!.trim()
    if (!line) continue

    const cols = line.split(sep)
    const row = isSii
      ? parseSiiRow(cols, headers, i + 1, type)
      : parseGenericRow(cols, headers, i + 1, type)

    if (!row) continue

    if (row._error) {
      errors.push({ row: i + 1, message: row._error, raw: row._raw ?? line })
    } else {
      valid.push(row)
    }
  }

  return { valid, errors }
}

export async function parseExcelFile(
  file: File,
  type: TransactionType
): Promise<ImportResult> {
  // Usar SheetJS (xlsx) para leer el Excel y convertir a CSV
  try {
    const { read, utils } = await import("xlsx")
    const buffer = await file.arrayBuffer()
    const workbook = read(buffer, { type: "array", cellDates: true })
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      return { valid: [], errors: [{ row: 0, message: "Excel sin hojas", raw: "" }] }
    }
    const sheet = workbook.Sheets[sheetName]!
    const csv = utils.sheet_to_csv(sheet, { forceQuotes: false })
    return parseCsvContent(csv, type)
  } catch {
    return { valid: [], errors: [{ row: 0, message: "Error al leer el archivo Excel. Asegúrate de que sea un .xlsx válido.", raw: "" }] }
  }
}

export async function parseFile(file: File, type: TransactionType): Promise<ImportResult> {
  const name = file.name.toLowerCase()
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    return parseExcelFile(file, type)
  }
  // CSV / TXT
  const text = await file.text()
  return parseCsvContent(text, type)
}
