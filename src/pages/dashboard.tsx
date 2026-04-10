import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { MoneyDisplay } from "@/components/money-display"
import { useTransactionStore, selectTransactionsByPeriod } from "@/store/transaction-store"
import { useCompanyStore } from "@/store/company-store"
import { useUiStore } from "@/store/ui-store"
import { useShallow } from "zustand/react/shallow"
import { formatPeriod } from "@/lib/period"
import { calculateIva, calculatePpm } from "@/lib/tax"
import { formatCLP } from "@/lib/money"
import { SII_DOCUMENT_LABELS } from "@/types/common"
import { Settings } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Transaction } from "@/types/transaction"

const recentColumns: ColumnDef<Transaction, unknown>[] = [
  { accessorKey: "date", header: "Fecha" },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => (row.original.type === "venta" ? "Venta" : "Compra"),
  },
  {
    accessorKey: "documentType",
    header: "Documento",
    cell: ({ row }) => SII_DOCUMENT_LABELS[row.original.documentType] ?? "",
  },
  { accessorKey: "counterpartName", header: "Contraparte" },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ row }) => formatCLP(row.original.totalAmount),
  },
]

export function DashboardPage() {
  const currentPeriod = useUiStore((s) => s.currentPeriod)
  const transactions = useTransactionStore(useShallow(selectTransactionsByPeriod(currentPeriod)))
  const isConfigured = useCompanyStore((s) => s.isConfigured)
  const ppmRate = useCompanyStore((s) => s.company.ppmRate)

  const ventas = transactions.filter((tx) => tx.type === "venta")
  const compras = transactions.filter((tx) => tx.type === "compra")

  const totalVentas = ventas.reduce((s, tx) => s + tx.totalAmount, 0)
  const totalCompras = compras.reduce((s, tx) => s + tx.totalAmount, 0)

  const ventasAfectasNeto = ventas.filter((tx) => !tx.isExenta).reduce((s, tx) => s + tx.netoAmount, 0)
  const comprasAfectasNeto = compras.filter((tx) => !tx.isExenta).reduce((s, tx) => s + tx.netoAmount, 0)

  const debitoFiscal = calculateIva(ventasAfectasNeto)
  const creditoFiscal = calculateIva(comprasAfectasNeto)
  const ivaAPagar = debitoFiscal - creditoFiscal

  const ppmEstimado = calculatePpm(ventasAfectasNeto, ppmRate)

  const recentTx = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        Inicio — {formatPeriod(currentPeriod)}
      </h2>

      {!isConfigured && (
        <Alert>
          <Settings className="size-4" />
          <AlertDescription className="flex items-center gap-2">
            Configura los datos de tu empresa para comenzar.
            <Button variant="link" asChild className="h-auto p-0">
              <Link to="/configuracion">Ir a Configuracion</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MoneyDisplay amount={totalVentas} className="text-2xl font-bold" />
            <p className="text-xs text-muted-foreground">{ventas.length} documentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Compras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MoneyDisplay amount={totalCompras} className="text-2xl font-bold" />
            <p className="text-xs text-muted-foreground">{compras.length} documentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              IVA a Pagar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MoneyDisplay amount={ivaAPagar} className="text-2xl font-bold" showSign />
            <p className="text-xs text-muted-foreground">
              {ivaAPagar >= 0 ? "Debito > Credito" : "Remanente a favor"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              PPM Estimado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MoneyDisplay amount={ppmEstimado} className="text-2xl font-bold" />
            <p className="text-xs text-muted-foreground">Tasa {(ppmRate * 100).toFixed(2)}%</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">Ultimos Documentos</h3>
        <DataTable
          columns={recentColumns}
          data={recentTx}
          emptyMessage="No hay documentos en este periodo"
        />
      </div>
    </div>
  )
}
