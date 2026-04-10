import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { MoneyDisplay } from "@/components/money-display"
import { useTransactionStore } from "@/store/transaction-store"
import { useCompanyStore } from "@/store/company-store"
import { computeF22 } from "@/lib/f22"
import { computeF29 } from "@/lib/f29"
import { getYearPeriods } from "@/lib/period"
import { formatCLP } from "@/lib/money"

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

export function F22Page() {
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const transactions = useTransactionStore((s) => s.transactions)
  const ppmRate = useCompanyStore((s) => s.company.ppmRate)
  const companyName = useCompanyStore((s) => s.company.razonSocial)
  const companyRut = useCompanyStore((s) => s.company.rut)

  const periods = getYearPeriods(selectedYear)
  const f29History = periods.map((p) => computeF29(transactions, p, ppmRate, 0))

  const f22 = computeF22(transactions, f29History, selectedYear)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Formulario 22 — Renta Anual</h2>
        <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {companyName && (
        <div className="text-sm text-muted-foreground">
          {companyName} — RUT {companyRut}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ingresos del Ejercicio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Row label="Ingresos afectos (neto)" value={f22.totalIngresosAfectos} />
          <Row label="Ingresos exentos" value={f22.totalIngresosExentos} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gastos del Ejercicio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Row label="Total gastos (neto)" value={f22.totalGastos} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Determinacion de Impuesto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Row label="Base imponible" value={f22.baseImponible} />
          <Row label="Impuesto Primera Categoria (25%)" value={f22.impuestoPrimeraCategoria} />
          <Separator />
          <Row label="PPM pagados en el ano" value={f22.ppmPagados} />
          <Row label="Creditos por retencion" value={f22.creditosPorRetencion} />
        </CardContent>
      </Card>

      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="text-base">Resultado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {f22.diferenciaAPagar > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">Impuesto a pagar</span>
              <MoneyDisplay amount={f22.diferenciaAPagar} className="text-lg font-bold text-red-600" />
            </div>
          )}
          {f22.devolucion > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">Devolucion a favor</span>
              <MoneyDisplay amount={f22.devolucion} className="text-lg font-bold text-green-600" />
            </div>
          )}
          {f22.diferenciaAPagar === 0 && f22.devolucion === 0 && (
            <div className="text-center text-muted-foreground">Sin movimientos</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span>{label}</span>
      <span className="font-medium">{formatCLP(value)}</span>
    </div>
  )
}
