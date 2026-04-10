import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CompanySettings } from "@/types/company"
import { DEFAULT_COMPANY } from "@/types/company"

interface CompanyState {
  company: CompanySettings
  isConfigured: boolean
  updateCompany: (updates: Partial<CompanySettings>) => void
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      company: DEFAULT_COMPANY,
      isConfigured: false,
      updateCompany: (updates) =>
        set((state) => ({
          company: {
            ...state.company,
            ...updates,
            updatedAt: new Date().toISOString(),
          },
          isConfigured: true,
        })),
    }),
    { name: "contability-company" }
  )
)
