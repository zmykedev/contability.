import { Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { AppLayout } from "@/components/layout/app-layout"
import { DashboardPage } from "@/pages/dashboard"
import { VentasPage } from "@/pages/ventas"
import { ComprasPage } from "@/pages/compras"
import { LibroPage } from "@/pages/libro"
import { F29Page } from "@/pages/f29"
import { F22Page } from "@/pages/f22"
import { ConfiguracionPage } from "@/pages/configuracion"

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="ventas" element={<VentasPage />} />
          <Route path="compras" element={<ComprasPage />} />
          <Route path="libro" element={<LibroPage />} />
          <Route path="f29" element={<F29Page />} />
          <Route path="f22" element={<F22Page />} />
          <Route path="configuracion" element={<ConfiguracionPage />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}
