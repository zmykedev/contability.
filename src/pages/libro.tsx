import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/data-table"
import { useTransactionStore, selectByPeriodAndType } from "@/store/transaction-store"
import { useUiStore } from "@/store/ui-store"
import { useShallow } from "zustand/react/shallow"
import { formatPeriod } from "@/lib/period"
import { formatCLP } from "@/lib/money"
import { SII_DOCUMENT_LABELS } from "@/types/common"
import type { ColumnDef } from "@tanstack/react-table"
import type { Transaction } from "@/types/transaction"

const libroColumns: ColumnDef<Transaction, unknown>[] = [
  { accessorKey: "date", header: "Fecha" },
  {
    accessorKey: "documentType",
    header: "Tipo Doc",
    cell: ({ row }) => SII_DOCUMENT_LABELS[row.original.documentType] ?? "",
  },
  { accessorKey: "documentNumber", header: "Folio" },
  { accessorKey: "counterpartRut", header: "RUT" },
  { accessorKey: "counterpartName", header: "Razon Social" },
  {
    id: "exento",
    header: "Monto Exento",
    cell: ({ row }) => row.original.isExenta ? formatCLP(row.original.totalAmount) : formatCLP(0),
  },
  {
    accessorKey: "netoAmount",
    header: "Monto Neto",
    cell: ({ row }) => row.original.isExenta ? formatCLP(0) : formatCLP(row.original.netoAmount),
  },
  {
    accessorKey: "ivaAmount",
    header: "IVA",
    cell: ({ row }) => formatCLP(row.original.ivaAmount),
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ row }) => formatCLP(row.original.totalAmount),
  },
]

function LibroSummary({ transactions }: { transactions: Transaction[] }) {
  const totalExento = transactions.filter((tx) => tx.isExenta).reduce((s, tx) => s + tx.totalAmount, 0)
  const totalNeto = transactions.filter((tx) => !tx.isExenta).reduce((s, tx) => s + tx.netoAmount, 0)
  const totalIva = transactions.reduce((s, tx) => s + tx.ivaAmount, 0)
  const totalAmount = transactions.reduce((s, tx) => s + tx.totalAmount, 0)

  if (transactions.length === 0) return null

  return (
    <div className="flex justify-end gap-6 rounded-md bg-muted p-3 text-sm">
      <div>Exento: <span className="font-bold">{formatCLP(totalExento)}</span></div>
      <div>Neto: <span className="font-bold">{formatCLP(totalNeto)}</span></div>
      <div>IVA: <span className="font-bold">{formatCLP(totalIva)}</span></div>
      <div>Total: <span className="font-bold">{formatCLP(totalAmount)}</span></div>
    </div>
  )
}

export function LibroPage() {
  const currentPeriod = useUiStore((s) => s.currentPeriod)
  const ventas = useTransactionStore(useShallow(selectByPeriodAndType(currentPeriod, "venta")))
  const compras = useTransactionStore(useShallow(selectByPeriodAndType(currentPeriod, "compra")))

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">
        Libro de Compra y Venta — {formatPeriod(currentPeriod)}
      </h2>

      <Tabs defaultValue="ventas" className="no-print-tabs">
        <TabsList className="no-print">
          <TabsTrigger value="ventas">Libro de Ventas</TabsTrigger>
          <TabsTrigger value="compras">Libro de Compras</TabsTrigger>
        </TabsList>

        <TabsContent value="ventas" className="space-y-4">
          <DataTable
            columns={libroColumns}
            data={ventas}
            emptyMessage="No hay ventas en este periodo"
          />
          <LibroSummary transactions={ventas} />
        </TabsContent>

        <TabsContent value="compras" className="space-y-4">
          <DataTable
            columns={libroColumns}
            data={compras}
            emptyMessage="No hay compras en este periodo"
          />
          <LibroSummary transactions={compras} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
