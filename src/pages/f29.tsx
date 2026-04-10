import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { MoneyDisplay } from "@/components/money-display"
import { useTransactionStore } from "@/store/transaction-store"
import { useCompanyStore } from "@/store/company-store"
import { useUiStore } from "@/store/ui-store"
import { computeF29 } from "@/lib/f29"
import { formatPeriod } from "@/lib/period"
import { formatCLP } from "@/lib/money"
import { Info } from "lucide-react"

export function F29Page() {
  const currentPeriod = useUiStore((s) => s.currentPeriod)
  const getRemanente = useUiStore((s) => s.getRemanente)
  const setRemanente = useUiStore((s) => s.setRemanente)
  const transactions = useTransactionStore((s) => s.transactions)
  const ppmRate = useCompanyStore((s) => s.company.ppmRate)
  const companyName = useCompanyStore((s) => s.company.razonSocial)
  const companyRut = useCompanyStore((s) => s.company.rut)
  const taxRegime = useCompanyStore((s) => s.company.taxRegime)

  const remanente = getRemanente(currentPeriod)
  const f29 = computeF29(transactions, currentPeriod, ppmRate, remanente)

  function handleRemanenteChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "")
    const val = parseInt(raw || "0", 10)
    setRemanente(currentPeriod, isNaN(val) ? 0 : val)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Formulario 29 — {formatPeriod(currentPeriod)}</h2>
        <Badge variant="outline">{taxRegime}</Badge>
      </div>

      {companyName && (
        <div className="text-sm text-muted-foreground">
          {companyName} — RUT {companyRut}
        </div>
      )}

      {/* Débito Fiscal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Débito Fiscal (Ventas)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Row label="Cod. 538 — Ventas afectas netas" value={f29.ventasAfectasNeto} />
          <Row label="Cod. 586 — Ventas exentas/no afectas" value={f29.ventasExentas} />
          <Separator />
          <Row label="Débito fiscal IVA 19%" value={f29.debitoFiscal} bold />
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="size-3" />
            {f29.cantidadDocVentas} documento(s) — notas de crédito ya descontadas
          </div>
        </CardContent>
      </Card>

      {/* Crédito Fiscal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Crédito Fiscal (Compras)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Row label="Cod. 111 — Compras afectas netas" value={f29.comprasAfectasNeto} />
          <Row label="Compras exentas/no afectas" value={f29.comprasExentas} />
          <Separator />
          <Row label="Crédito fiscal IVA 19%" value={f29.creditoFiscal} bold />
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="size-3" />
            {f29.cantidadDocCompras} documento(s) — notas de crédito ya descontadas
          </div>
        </CardContent>
      </Card>

      {/* Determinación IVA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Determinación de IVA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Row label="Cod. 91 — Diferencia débito - crédito" value={f29.diferenciaDebitoCreditoIva} />
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="remanente" className="flex-1">
              Cod. 77 — Remanente mes anterior
            </label>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">$</span>
              <input
                id="remanente"
                type="text"
                inputMode="numeric"
                value={remanente === 0 ? "" : remanente.toLocaleString("es-CL")}
                onChange={handleRemanenteChange}
                placeholder="0"
                className="w-36 rounded-md border border-input bg-background px-3 py-1 text-right text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <Separator />
          <Row label="IVA determinado" value={f29.ivaDeterminado} bold />
          {f29.remanenteSiguiente > 0 && (
            <div className="rounded-md bg-green-50 dark:bg-green-950/20 p-2 text-xs text-green-700 dark:text-green-400 flex justify-between">
              <span>Remanente a favor (arrastrar al próximo mes)</span>
              <span className="font-bold">{formatCLP(f29.remanenteSiguiente)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PPM */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pagos Provisionales Mensuales (PPM)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Row label="Base imponible" value={f29.baseImponiblePpm} />
          <div className="flex items-center justify-between text-sm">
            <span>Tasa PPM</span>
            <span className="font-medium">{(f29.tasaPpm * 100).toFixed(4)}%</span>
          </div>
          <Separator />
          <Row label="PPM determinado" value={f29.ppmDeterminado} bold />
        </CardContent>
      </Card>

      {/* Retención Honorarios */}
      {f29.retencionHonorarios > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Retención Honorarios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="Cod. 152 — Retención boletas de honorarios (14.5%)" value={f29.retencionHonorarios} bold />
            <div className="text-xs text-muted-foreground">
              Retención que la empresa debe enterar al SII por cuenta del prestador
            </div>
          </CardContent>
        </Card>
      )}

      {/* Total */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="text-base">Total a Pagar / Ingresar al SII</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>IVA determinado</span>
            <span className="font-medium">{formatCLP(f29.ivaDeterminado)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>PPM</span>
            <span className="font-medium">{formatCLP(f29.ppmDeterminado)}</span>
          </div>
          {f29.retencionHonorarios > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span>Retención honorarios</span>
              <span className="font-medium">{formatCLP(f29.retencionHonorarios)}</span>
            </div>
          )}
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">Total</span>
            <MoneyDisplay amount={f29.totalAPagar} className="text-lg font-bold" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span>{label}</span>
      <MoneyDisplay amount={value} className={bold ? "font-bold" : "font-medium"} />
    </div>
  )
}
