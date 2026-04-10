import { useState, useRef } from "react"
import { Upload, AlertCircle, CheckCircle2, FileText, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useTransactionStore } from "@/store/transaction-store"
import { parseFile, type ImportResult } from "@/lib/import"
import { SII_DOCUMENT_LABELS } from "@/types/common"
import { formatCLP } from "@/lib/money"
import type { TransactionType } from "@/types/transaction"
import { toast } from "sonner"

interface ImportTransactionsProps {
  type: TransactionType
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = "upload" | "preview" | "done"

export function ImportTransactions({ type, open, onOpenChange }: ImportTransactionsProps) {
  const bulkImport = useTransactionStore((s) => s.bulkImport)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>("upload")
  const [result, setResult] = useState<ImportResult | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState("")

  function reset() {
    setStep("upload")
    setResult(null)
    setSelected(new Set())
    setFileName("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function handleClose() {
    reset()
    onOpenChange(false)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setIsLoading(true)
    try {
      const res = await parseFile(file, type)
      setResult(res)
      // Pre-seleccionar todas las filas válidas
      setSelected(new Set(res.valid.map((_, i) => i)))
      setStep("preview")
    } catch {
      toast.error("Error al procesar el archivo")
    } finally {
      setIsLoading(false)
    }
  }

  function toggleRow(i: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  function selectAll() {
    if (result) setSelected(new Set(result.valid.map((_, i) => i)))
  }

  function deselectAll() {
    setSelected(new Set())
  }

  function handleImport() {
    if (!result) return
    const rows = result.valid.filter((_, i) => selected.has(i))
    const txInputs = rows.map((row) => ({
      type,
      date: row.date,
      documentType: row.documentType,
      documentNumber: row.documentNumber,
      counterpartRut: row.counterpartRut,
      counterpartName: row.counterpartName,
      description: row.description,
      netoAmount: row.netoAmount,
      isExenta: row.isExenta,
      isHonorario: row.isHonorario,
      isNegative: row.isNegative,
    }))
    bulkImport(txInputs)
    toast.success(`${txInputs.length} documento(s) importado(s) correctamente`)
    setStep("done")
  }

  const label = type === "venta" ? "Ventas" : "Compras"

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="size-5" />
            Importar {label} desde archivo
          </DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="flex flex-col items-center justify-center gap-4 py-10">
            <div
              className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/30 p-10 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="size-12 text-muted-foreground/50" />
              <div className="text-center">
                <p className="font-medium">Haz clic para seleccionar archivo</p>
                <p className="text-sm text-muted-foreground mt-1">
                  CSV, TXT (separado por ; o ,) o Excel (.xlsx)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="w-full rounded-md bg-muted/50 p-4 text-sm space-y-2">
              <p className="font-medium text-muted-foreground">Formatos soportados:</p>
              <p className="text-muted-foreground">
                <strong>Exportación SII</strong> — archivo descargado directamente del portal del SII
                (libro de ventas o compras). Columnas: Fecha, Tipo DTE, N° DTE, RUT, Razón Social,
                Monto Exento, Monto Neto, IVA, Total.
              </p>
              <p className="text-muted-foreground">
                <strong>Formato genérico CSV</strong> — columnas: fecha, tipo (código DTE), folio,
                rut, razon_social, neto, iva, total.
              </p>
            </div>

            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Procesando archivo...
              </div>
            )}
          </div>
        )}

        {step === "preview" && result && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="size-3 text-green-600" />
                  {result.valid.length} válidos
                </Badge>
                {result.errors.length > 0 && (
                  <Badge variant="outline" className="gap-1 text-destructive border-destructive/50">
                    <AlertCircle className="size-3" />
                    {result.errors.length} con error
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">{fileName}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll}>Todos</Button>
                <Button variant="ghost" size="sm" onClick={deselectAll}>Ninguno</Button>
              </div>
            </div>

            <ScrollArea className="flex-1 min-h-0 max-h-72 rounded-md border">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-muted">
                  <tr>
                    <th className="p-2 text-left w-8"></th>
                    <th className="p-2 text-left">Fecha</th>
                    <th className="p-2 text-left">Documento</th>
                    <th className="p-2 text-left">Folio</th>
                    <th className="p-2 text-left">RUT</th>
                    <th className="p-2 text-left">Razón Social</th>
                    <th className="p-2 text-right">Neto</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {result.valid.map((row, i) => (
                    <tr
                      key={i}
                      className={`border-t cursor-pointer hover:bg-muted/50 ${selected.has(i) ? "" : "opacity-40"}`}
                      onClick={() => toggleRow(i)}
                    >
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={selected.has(i)}
                          onChange={() => toggleRow(i)}
                          onClick={(e) => e.stopPropagation()}
                          className="size-3 rounded border"
                        />
                      </td>
                      <td className="p-2 font-mono">{row.date}</td>
                      <td className="p-2">
                        <span className="truncate max-w-[100px] block">
                          {SII_DOCUMENT_LABELS[row.documentType] ?? row.documentType}
                          {row.isNegative && (
                            <Badge variant="outline" className="ml-1 text-[10px] py-0 text-orange-600 border-orange-400">NC</Badge>
                          )}
                        </span>
                      </td>
                      <td className="p-2 font-mono">{row.documentNumber}</td>
                      <td className="p-2 font-mono">{row.counterpartRut}</td>
                      <td className="p-2">
                        <span className="truncate max-w-[120px] block">{row.counterpartName}</span>
                      </td>
                      <td className="p-2 text-right font-mono">{formatCLP(row.netoAmount)}</td>
                      <td className="p-2 text-right font-mono font-medium">{formatCLP(row.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>

            {result.errors.length > 0 && (
              <>
                <Separator />
                <div className="text-xs text-destructive space-y-1 max-h-20 overflow-auto">
                  <p className="font-medium flex items-center gap-1">
                    <AlertCircle className="size-3" /> Filas con error (no se importarán):
                  </p>
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-muted-foreground pl-4">
                      Fila {err.row}: {err.message}
                    </p>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center justify-center gap-4 py-10">
            <CheckCircle2 className="size-16 text-green-600" />
            <p className="text-lg font-semibold">¡Importación completada!</p>
            <p className="text-sm text-muted-foreground">
              Los documentos ya están disponibles en el libro de {label.toLowerCase()}.
            </p>
          </div>
        )}

        <DialogFooter className="mt-2">
          {step === "upload" && (
            <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          )}
          {step === "preview" && (
            <>
              <Button variant="outline" onClick={reset} className="gap-1">
                <X className="size-4" /> Cambiar archivo
              </Button>
              <Button
                onClick={handleImport}
                disabled={selected.size === 0}
              >
                Importar {selected.size} documento{selected.size !== 1 ? "s" : ""}
              </Button>
            </>
          )}
          {step === "done" && (
            <Button onClick={handleClose}>Cerrar</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
