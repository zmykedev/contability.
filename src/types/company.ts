import type { RUT, ISODateString } from "./common"
import { TaxRegime } from "./common"

export interface CompanySettings {
  rut: RUT
  razonSocial: string
  giro: string
  direccion: string
  comuna: string
  ciudad: string
  telefono: string
  email: string
  representanteLegal: string
  rutRepresentante: RUT
  taxRegime: TaxRegime
  ppmRate: number
  actividadEconomica: string
  inicioActividades: ISODateString
  createdAt: string
  updatedAt: string
}

export const DEFAULT_COMPANY: CompanySettings = {
  rut: "",
  razonSocial: "",
  giro: "",
  direccion: "",
  comuna: "",
  ciudad: "",
  telefono: "",
  email: "",
  representanteLegal: "",
  rutRepresentante: "",
  taxRegime: TaxRegime.PRO_PYME_GENERAL,
  ppmRate: 0.0025,
  actividadEconomica: "",
  inicioActividades: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
