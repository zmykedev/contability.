import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { transactionSchema, type TransactionFormData } from "@/lib/schemas"
import { SiiDocumentType, SII_DOCUMENT_LABELS } from "@/types/common"
import type { TransactionType, Transaction } from "@/types/transaction"
import { calculateIva, calculateRetencion } from "@/lib/tax"
import { formatCLP } from "@/lib/money"
import { formatRut } from "@/lib/rut"
import { useTransactionStore } from "@/store/transaction-store"
import { toast } from "sonner"
import { useEffect } from "react"

const VENTA_DOC_TYPES = [
  SiiDocumentType.FACTURA_ELECTRONICA,
  SiiDocumentType.FACTURA_EXENTA_ELECTRONICA,
  SiiDocumentType.BOLETA_ELECTRONICA,
  SiiDocumentType.BOLETA_EXENTA_ELECTRONICA,
  SiiDocumentType.NOTA_CREDITO_ELECTRONICA,
  SiiDocumentType.NOTA_DEBITO_ELECTRONICA,
]

const COMPRA_DOC_TYPES = [
  SiiDocumentType.FACTURA_ELECTRONICA,
  SiiDocumentType.FACTURA_EXENTA_ELECTRONICA,
  SiiDocumentType.FACTURA_COMPRA_ELECTRONICA,
  SiiDocumentType.NOTA_CREDITO_ELECTRONICA,
  SiiDocumentType.NOTA_DEBITO_ELECTRONICA,
]

const HONORARIOS_DOC_TYPES = [
  SiiDocumentType.BOLETA_ELECTRONICA,
]

const EXENTA_DOC_TYPES = [
  SiiDocumentType.FACTURA_EXENTA_ELECTRONICA,
  SiiDocumentType.BOLETA_EXENTA_ELECTRONICA,
]

const NOTA_CREDITO_DOC_TYPES = [
  SiiDocumentType.NOTA_CREDITO_ELECTRONICA,
]

interface TransactionFormProps {
  type: TransactionType
  open: boolean
  onOpenChange: (open: boolean) => void
  editTransaction?: Transaction | null
}

export function TransactionForm({
  type,
  open,
  onOpenChange,
  editTransaction,
}: TransactionFormProps) {
  const addTransaction = useTransactionStore((s) => s.addTransaction)
  const updateTransaction = useTransactionStore((s) => s.updateTransaction)
  const docTypes = type === "venta" ? VENTA_DOC_TYPES : COMPRA_DOC_TYPES

  const form = useForm<TransactionFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(transactionSchema as any) as Resolver<TransactionFormData>,
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      documentType: docTypes[0] as unknown as SiiDocumentType,
      documentNumber: 0,
      counterpartRut: "",
      counterpartName: "",
      description: "",
      netoAmount: 0,
      isExenta: false,
      isHonorario: false,
      isNegative: false,
    },
  })

  useEffect(() => {
    if (editTransaction) {
      form.reset({
        date: editTransaction.date,
        documentType: editTransaction.documentType,
        documentNumber: editTransaction.documentNumber,
        counterpartRut: editTransaction.counterpartRut,
        counterpartName: editTransaction.counterpartName,
        description: editTransaction.description,
        netoAmount: editTransaction.netoAmount,
        isExenta: editTransaction.isExenta,
        isHonorario: editTransaction.isHonorario,
        isNegative: editTransaction.isNegative,
      })
    } else {
      form.reset({
        date: new Date().toISOString().slice(0, 10),
        documentType: docTypes[0] as unknown as SiiDocumentType,
        documentNumber: 0,
        counterpartRut: "",
        counterpartName: "",
        description: "",
        netoAmount: 0,
        isExenta: false,
        isHonorario: false,
        isNegative: false,
      })
    }
  }, [editTransaction, form, docTypes])

  const watchNeto = form.watch("netoAmount")
  const watchExenta = form.watch("isExenta")
  const watchHonorario = form.watch("isHonorario")
  const watchDocType = form.watch("documentType")

  const bruto = Number(watchNeto) || 0
  const isNotaCredito = NOTA_CREDITO_DOC_TYPES.includes(Number(watchDocType) as SiiDocumentType)

  let ivaAmount = 0
  let retencionAmount = 0
  let totalAmount = bruto

  if (watchHonorario) {
    retencionAmount = calculateRetencion(bruto)
    totalAmount = bruto
  } else if (!watchExenta) {
    ivaAmount = calculateIva(bruto)
    totalAmount = bruto + ivaAmount
  }

  // Auto-set flags based on doc type
  useEffect(() => {
    const dt = Number(watchDocType) as SiiDocumentType
    if (EXENTA_DOC_TYPES.includes(dt)) {
      form.setValue("isExenta", true)
    }
    if (NOTA_CREDITO_DOC_TYPES.includes(dt)) {
      form.setValue("isNegative", true)
    } else {
      form.setValue("isNegative", false)
    }
    if (type === "compra" && HONORARIOS_DOC_TYPES.includes(dt)) {
      // suggerir pero no forzar
    }
  }, [watchDocType, form, type])

  function onSubmit(data: TransactionFormData) {
    const txData = {
      type,
      date: data.date,
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      counterpartRut: formatRut(data.counterpartRut),
      counterpartName: data.counterpartName,
      description: data.description,
      netoAmount: data.netoAmount,
      isExenta: data.isExenta,
      isHonorario: data.isHonorario,
      isNegative: data.isNegative,
    }

    if (editTransaction) {
      updateTransaction(editTransaction.id, txData)
      toast.success("Documento actualizado")
    } else {
      addTransaction(txData)
      toast.success("Documento agregado")
    }

    onOpenChange(false)
    form.reset()
  }

  const title = editTransaction
    ? `Editar ${type === "venta" ? "Venta" : "Compra"}`
    : `Nueva ${type === "venta" ? "Venta" : "Compra"}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="documentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>N° Folio</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tipo Documento */}
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo Documento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {docTypes.map((dt) => (
                        <SelectItem key={dt} value={String(dt)}>
                          {SII_DOCUMENT_LABELS[dt]}
                          {NOTA_CREDITO_DOC_TYPES.includes(dt) && (
                            <span className="ml-2 text-xs text-muted-foreground">(descuento)</span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Honorarios (solo compras) */}
            {type === "compra" && (
              <FormField
                control={form.control}
                name="isHonorario"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 rounded-md border p-3">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.checked)
                          if (e.target.checked) {
                            form.setValue("isExenta", true)
                            form.setValue("isNegative", false)
                          }
                        }}
                        className="size-4 rounded border"
                      />
                    </FormControl>
                    <div>
                      <FormLabel className="!mt-0 font-medium">Boleta de Honorarios Electrónica</FormLabel>
                      <p className="text-xs text-muted-foreground">Aplica retención 14.5% al SII</p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="counterpartRut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{type === "venta" ? "RUT Cliente" : "RUT Prestador"}</FormLabel>
                    <FormControl>
                      <Input placeholder="12.345.678-5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="counterpartName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razón Social</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="netoAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {watchHonorario ? "Monto Bruto Honorarios" : "Monto Neto"}
                  </FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!watchHonorario && (
              <FormField
                control={form.control}
                name="isExenta"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="size-4 rounded border"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Operación exenta de IVA</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Resumen de cálculo */}
            <div className="rounded-md bg-muted p-3 space-y-1 text-sm">
              {isNotaCredito && (
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-medium">
                  <Badge variant="outline" className="text-xs border-orange-400 text-orange-600">
                    Nota de Crédito
                  </Badge>
                  Este documento reduce el total del libro
                </div>
              )}
              {watchHonorario ? (
                <>
                  <div className="flex justify-between">
                    <span>Monto Bruto</span>
                    <span className="font-medium">{formatCLP(bruto)}</span>
                  </div>
                  <div className="flex justify-between text-orange-600 dark:text-orange-400">
                    <span>Retención SII (14.5%)</span>
                    <span className="font-medium">{formatCLP(retencionAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Neto a pagar prestador</span>
                    <span className="font-medium">{formatCLP(bruto - retencionAmount)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>IVA (19%)</span>
                    <span className="font-medium">{formatCLP(ivaAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatCLP(totalAmount)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editTransaction ? "Guardar" : "Agregar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
