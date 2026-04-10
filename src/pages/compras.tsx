import { useState } from "react"
import { Plus, MoreHorizontal, Pencil, Trash2, Upload } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { useShallow } from "zustand/react/shallow"
import { formatPeriod } from "@/lib/period"
import { formatCLP } from "@/lib/money"
import { SII_DOCUMENT_LABELS, SiiDocumentType } from "@/types/common"
import type { Transaction } from "@/types/transaction"

function buildColumns(
  onEdit: (tx: Transaction) => void,
  onDelete: (tx: Transaction) => void,
  isHonorarioTab = false
): ColumnDef<Transaction, unknown>[] {
  const cols: ColumnDef<Transaction, unknown>[] = [
    { accessorKey: "date", header: "Fecha" },
    {
      accessorKey: "documentType",
      header: "Tipo Doc",
      cell: ({ row }) => (
        <span className="flex items-center gap-1 flex-wrap">
          {SII_DOCUMENT_LABELS[row.original.documentType] ?? ""}
          {row.original.isHonorario && (
            <Badge variant="secondary" className="text-[10px] py-0">Honorario</Badge>
          )}
          {row.original.documentType === SiiDocumentType.NOTA_CREDITO_ELECTRONICA && (
            <Badge variant="outline" className="text-[10px] py-0 text-orange-600 border-orange-400">NC</Badge>
          )}
        </span>
      ),
    },
    { accessorKey: "documentNumber", header: "Folio" },
    { accessorKey: "counterpartRut", header: "RUT" },
    { accessorKey: "counterpartName", header: "Razón Social" },
    {
      accessorKey: "netoAmount",
      header: isHonorarioTab ? "Bruto" : "Neto",
      cell: ({ row }) => formatCLP(row.original.netoAmount),
    },
  ]

  if (isHonorarioTab) {
    cols.push({
      accessorKey: "retencionAmount",
      header: "Retención (14.5%)",
      cell: ({ row }) => (
        <span className="text-orange-600 dark:text-orange-400 font-medium">
          {formatCLP(row.original.retencionAmount)}
        </span>
      ),
    })
    cols.push({
      id: "netoPagado",
      header: "Neto Pagado",
      cell: ({ row }) => formatCLP(row.original.netoAmount - row.original.retencionAmount),
    })
  } else {
    cols.push({
      accessorKey: "ivaAmount",
      header: "IVA",
      cell: ({ row }) => formatCLP(row.original.ivaAmount),
    })
    cols.push({
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ row }) => formatCLP(row.original.totalAmount),
    })
  }

  cols.push({
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => { onEdit(row.original); }}>
            <Pencil className="mr-2 size-4" /> Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(row.original)} className="text-destructive">
            <Trash2 className="mr-2 size-4" /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  })

  return cols
}

export function ComprasPage() {
  const currentPeriod = useUiStore((s) => s.currentPeriod)
  const allCompras = useTransactionStore(useShallow(selectByPeriodAndType(currentPeriod, "compra")))
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction)

  const [formOpen, setFormOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editTx, setEditTx] = useState<Transaction | null>(null)
  const [deleteTx, setDeleteTx] = useState<Transaction | null>(null)

  const comprasNormales = allCompras.filter((tx) => !tx.isHonorario)
  const honorarios = allCompras.filter((tx) => tx.isHonorario)

  function handleEdit(tx: Transaction) {
    setEditTx(tx)
    setFormOpen(true)
  }

  const comprasColumns = buildColumns(handleEdit, setDeleteTx, false)
  const honorariosColumns = buildColumns(handleEdit, setDeleteTx, true)

  const totalNeto = comprasNormales.reduce((s, tx) => s + tx.netoAmount, 0)
  const totalIva = comprasNormales.reduce((s, tx) => s + tx.ivaAmount, 0)
  const totalCompras = comprasNormales.reduce((s, tx) => s + tx.totalAmount, 0)

  const totalBrutoHonorarios = honorarios.reduce((s, tx) => s + tx.netoAmount, 0)
  const totalRetencion = honorarios.reduce((s, tx) => s + tx.retencionAmount, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Compras — {formatPeriod(currentPeriod)}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="mr-2 size-4" /> Importar
          </Button>
          <Button onClick={() => { setEditTx(null); setFormOpen(true) }}>
            <Plus className="mr-2 size-4" /> Nueva Compra
          </Button>
        </div>
      </div>

      <Tabs defaultValue="compras">
        <TabsList>
          <TabsTrigger value="compras">
            Facturas / Documentos
            {comprasNormales.length > 0 && (
              <Badge variant="secondary" className="ml-2">{comprasNormales.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="honorarios">
            Honorarios
            {honorarios.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700">{honorarios.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compras" className="space-y-3 mt-3">
          <DataTable
            columns={comprasColumns}
            data={comprasNormales}
            emptyMessage="No hay compras en este periodo"
          />
          {comprasNormales.length > 0 && (
            <div className="flex justify-end gap-6 rounded-md bg-muted p-3 text-sm">
              <div>Neto: <span className="font-bold">{formatCLP(totalNeto)}</span></div>
              <div>IVA: <span className="font-bold">{formatCLP(totalIva)}</span></div>
              <div>Total: <span className="font-bold">{formatCLP(totalCompras)}</span></div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="honorarios" className="space-y-3 mt-3">
          <div className="rounded-md bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 p-3 text-sm text-orange-800 dark:text-orange-300">
            Las boletas de honorarios no generan crédito fiscal IVA. La retención del 14.5% se
            declara en F29 (Cod. 152) y debe ser enterada al SII por la empresa.
          </div>
          <DataTable
            columns={honorariosColumns}
            data={honorarios}
            emptyMessage="No hay boletas de honorarios en este periodo"
          />
          {honorarios.length > 0 && (
            <div className="flex justify-end gap-6 rounded-md bg-muted p-3 text-sm">
              <div>Bruto total: <span className="font-bold">{formatCLP(totalBrutoHonorarios)}</span></div>
              <div className="text-orange-600 dark:text-orange-400">
                Retención SII: <span className="font-bold">{formatCLP(totalRetencion)}</span>
              </div>
              <div>Neto pagado prestadores: <span className="font-bold">{formatCLP(totalBrutoHonorarios - totalRetencion)}</span></div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <TransactionForm
        type="compra"
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditTx(null) }}
        editTransaction={editTx}
      />

      <ImportTransactions
        type="compra"
        open={importOpen}
        onOpenChange={setImportOpen}
      />

      <Dialog open={!!deleteTx} onOpenChange={() => setDeleteTx(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Eliminar documento {deleteTx?.documentNumber} de {deleteTx?.counterpartName}?
            Esta acción no se puede deshacer.
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
