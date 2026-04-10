import { useState } from "react"
import { Plus, MoreHorizontal, Pencil, Trash2, Upload } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { DataTable } from "@/components/data-table"
import { TransactionForm } from "@/components/transaction-form"
import { ImportTransactions } from "@/components/import-transactions"
import { useTransactionStore, selectByPeriodAndType } from "@/store/transaction-store"
import { useUiStore } from "@/store/ui-store"
import { formatPeriod } from "@/lib/period"
import { formatCLP } from "@/lib/money"
import { SII_DOCUMENT_LABELS, SiiDocumentType } from "@/types/common"
import type { Transaction } from "@/types/transaction"
import { useShallow } from "zustand/react/shallow"

export function VentasPage() {
  const currentPeriod = useUiStore((s) => s.currentPeriod)
  const ventas = useTransactionStore(useShallow(selectByPeriodAndType(currentPeriod, "venta")))
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction)

  const [formOpen, setFormOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editTx, setEditTx] = useState<Transaction | null>(null)
  const [deleteTx, setDeleteTx] = useState<Transaction | null>(null)

  const totalNeto = ventas.reduce((s, tx) => s + tx.netoAmount, 0)
  const totalIva = ventas.reduce((s, tx) => s + tx.ivaAmount, 0)
  const totalAmount = ventas.reduce((s, tx) => s + tx.totalAmount, 0)

  const columns: ColumnDef<Transaction, unknown>[] = [
    { accessorKey: "date", header: "Fecha" },
    {
      accessorKey: "documentType",
      header: "Tipo Doc",
      cell: ({ row }) => (
        <span className="flex items-center gap-1">
          {SII_DOCUMENT_LABELS[row.original.documentType] ?? ""}
          {row.original.documentType === SiiDocumentType.NOTA_CREDITO_ELECTRONICA && (
            <Badge variant="outline" className="text-[10px] py-0 text-orange-600 border-orange-400">NC</Badge>
          )}
        </span>
      ),
    },
    { accessorKey: "documentNumber", header: "Folio" },
    { accessorKey: "counterpartRut", header: "RUT" },
    { accessorKey: "counterpartName", header: "Razon Social" },
    {
      accessorKey: "netoAmount",
      header: "Neto",
      cell: ({ row }) => formatCLP(row.original.netoAmount),
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
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditTx(row.original); setFormOpen(true) }}>
              <Pencil className="mr-2 size-4" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDeleteTx(row.original)} className="text-destructive">
              <Trash2 className="mr-2 size-4" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Ventas — {formatPeriod(currentPeriod)}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="mr-2 size-4" /> Importar
          </Button>
          <Button onClick={() => { setEditTx(null); setFormOpen(true) }}>
            <Plus className="mr-2 size-4" /> Nueva Venta
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={ventas}
        emptyMessage="No hay ventas en este periodo"
      />

      {ventas.length > 0 && (
        <div className="flex justify-end gap-6 rounded-md bg-muted p-3 text-sm">
          <div>Neto: <span className="font-bold">{formatCLP(totalNeto)}</span></div>
          <div>IVA: <span className="font-bold">{formatCLP(totalIva)}</span></div>
          <div>Total: <span className="font-bold">{formatCLP(totalAmount)}</span></div>
        </div>
      )}

      <TransactionForm
        type="venta"
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditTx(null) }}
        editTransaction={editTx}
      />

      <ImportTransactions
        type="venta"
        open={importOpen}
        onOpenChange={setImportOpen}
      />

      <Dialog open={!!deleteTx} onOpenChange={() => setDeleteTx(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminacion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Eliminar documento {deleteTx?.documentNumber} de {deleteTx?.counterpartName}?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTx(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTx) {
                  deleteTransaction(deleteTx.id)
                  setDeleteTx(null)
                }
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
