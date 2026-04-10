import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { PeriodKey, CLP } from "@/types/common"
import { getCurrentPeriod } from "@/lib/period"

interface UiState {
  currentPeriod: PeriodKey
  sidebarOpen: boolean
  // Remanente IVA por período (se arrastra automáticamente del mes anterior)
  remanenteByPeriod: Record<PeriodKey, CLP>
  setCurrentPeriod: (period: PeriodKey) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setRemanente: (period: PeriodKey, amount: CLP) => void
  getRemanente: (period: PeriodKey) => CLP
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      currentPeriod: getCurrentPeriod(),
      sidebarOpen: true,
      remanenteByPeriod: {},

      setCurrentPeriod: (period) => set({ currentPeriod: period }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      setRemanente: (period, amount) =>
        set((state) => ({
          remanenteByPeriod: { ...state.remanenteByPeriod, [period]: amount },
        })),

      getRemanente: (period) => get().remanenteByPeriod[period] ?? 0,
    }),
    { name: "contability-ui" }
  )
)
