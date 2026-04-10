// Usamos zod/v3 para compatibilidad con @hookform/resolvers
import { z } from "zod/v3"
import { SiiDocumentType, TaxRegime } from "@/types/common"
import { validateRut } from "./rut"

// Interfaces explícitas — la inferencia de Zod v3/v4 con coerce/preprocess
// no siempre es compatible con react-hook-form sin estas definiciones.
export interface TransactionFormData {
  date: string
  documentType: SiiDocumentType
  documentNumber: number
  counterpartRut: string
  counterpartName: string
  description: string
  netoAmount: number
  isExenta: boolean
  isHonorario: boolean
  isNegative: boolean
}

export interface CompanyFormData {
  rut: string
  razonSocial: string
  giro: string
  direccion: string
  comuna: string
  ciudad: string
  telefono: string
  email: string
  representanteLegal: string
  rutRepresentante: string
  taxRegime: TaxRegime
  ppmRate: number
  actividadEconomica: string
  inicioActividades: string
}

// Los schemas validan en runtime; los tipos son los interfaces de arriba.
// Se castean como ZodType<T> para que zodResolver infiera correctamente.
export const transactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  documentType: z.coerce.number().transform((n) => n as SiiDocumentType),
  documentNumber: z.coerce.number().int().positive("Folio debe ser positivo"),
  counterpartRut: z.string().min(1, "RUT requerido").refine(validateRut, "RUT inválido"),
  counterpartName: z.string().min(1, "Razón social requerida"),
  description: z.string().default(""),
  netoAmount: z.coerce.number().int().min(1, "Monto debe ser positivo"),
  isExenta: z.boolean().default(false),
  isHonorario: z.boolean().default(false),
  isNegative: z.boolean().default(false),
}) as z.ZodType<TransactionFormData>

export const companySchema = z.object({
  rut: z.string().min(1, "RUT requerido").refine(validateRut, "RUT inválido"),
  razonSocial: z.string().min(1, "Razón social requerida"),
  giro: z.string().min(1, "Giro requerido"),
  direccion: z.string().min(1, "Dirección requerida"),
  comuna: z.string().min(1, "Comuna requerida"),
  ciudad: z.string().min(1, "Ciudad requerida"),
  telefono: z.string().default(""),
  email: z.union([z.string().email("Email inválido"), z.literal("")]).default(""),
  representanteLegal: z.string().default(""),
  rutRepresentante: z.string().default(""),
  taxRegime: z.nativeEnum(TaxRegime),
  ppmRate: z.coerce.number().min(0).max(1),
  actividadEconomica: z.string().default(""),
  inicioActividades: z.string().default(""),
}) as z.ZodType<CompanyFormData>
