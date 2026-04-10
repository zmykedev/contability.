import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { companySchema, type CompanyFormData } from "@/lib/schemas"
import { TaxRegime } from "@/types/common"
import { useCompanyStore } from "@/store/company-store"
import { toast } from "sonner"

export function ConfiguracionPage() {
  const company = useCompanyStore((s) => s.company)
  const updateCompany = useCompanyStore((s) => s.updateCompany)

  const form = useForm<CompanyFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(companySchema as any) as Resolver<CompanyFormData>,
    defaultValues: {
      rut: company.rut,
      razonSocial: company.razonSocial,
      giro: company.giro,
      direccion: company.direccion,
      comuna: company.comuna,
      ciudad: company.ciudad,
      telefono: company.telefono,
      email: company.email,
      representanteLegal: company.representanteLegal,
      rutRepresentante: company.rutRepresentante,
      taxRegime: company.taxRegime,
      ppmRate: company.ppmRate,
      actividadEconomica: company.actividadEconomica,
      inicioActividades: company.inicioActividades,
    },
  })

  function onSubmit(data: CompanyFormData) {
    updateCompany(data)
    toast.success("Configuracion guardada")
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold">Configuracion de Empresa</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datos de la Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RUT Empresa</FormLabel>
                      <FormControl>
                        <Input placeholder="76.123.456-7" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="razonSocial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razon Social</FormLabel>
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
                name="giro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giro</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="direccion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Direccion</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="comuna"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comuna</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ciudad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefono</FormLabel>
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actividadEconomica"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actividad Economica</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inicioActividades"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inicio de Actividades</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Representante Legal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="representanteLegal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rutRepresentante"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RUT Representante</FormLabel>
                      <FormControl>
                        <Input placeholder="12.345.678-5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuracion Tributaria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="taxRegime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Regimen Tributario</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={TaxRegime.PRO_PYME_GENERAL}>
                          Pro Pyme General (14D N.3)
                        </SelectItem>
                        <SelectItem value={TaxRegime.PRO_PYME_TRANSPARENTE}>
                          Pro Pyme Transparente (14D N.8)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ppmRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tasa PPM (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.0001"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" className="w-full">
            Guardar Configuracion
          </Button>
        </form>
      </Form>
    </div>
  )
}
