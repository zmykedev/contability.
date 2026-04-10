import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Transaction, TransactionType } from "@/types/transaction"
import type { PeriodKey, UUID } from "@/types/common"
import { dateToPeriod } from "@/lib/period"
import { calculateIva, calculateRetencion } from "@/lib/tax"

type TransactionInput = Omit<Transaction, "id" | "period" | "ivaAmount" | "totalAmount" | "retencionAmount" | "createdAt" | "updatedAt">

interface TransactionState {
  transactions: Transaction[]
  addTransaction: (tx: TransactionInput) => void
  updateTransaction: (id: UUID, tx: TransactionInput) => void
  deleteTransaction: (id: UUID) => void
  bulkImport: (txs: TransactionInput[]) => void
}

function computeDerived(tx: TransactionInput) {
  if (tx.isHonorario) {
    // Honorarios: sin IVA, con retención 14.5%
    const retencionAmount = calculateRetencion(tx.netoAmount)
    return {
      period: dateToPeriod(tx.date),
      ivaAmount: 0,
      totalAmount: tx.netoAmount,
      retencionAmount,
    }
  }
  const ivaAmount = tx.isExenta ? 0 : calculateIva(tx.netoAmount)
  return {
    period: dateToPeriod(tx.date),
    ivaAmount,
    totalAmount: tx.netoAmount + ivaAmount,
    retencionAmount: 0,
  }
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set) => ({
      transactions: [],

      addTransaction: (tx) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            {
              ...tx,
              ...computeDerived(tx),
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateTransaction: (id, tx) =>
        set((state) => ({
          transactions: state.transactions.map((existing) =>
            existing.id === id
              ? {
                  ...existing,
                  ...tx,
                  ...computeDerived(tx),
                  updatedAt: new Date().toISOString(),
                }
              : existing
          ),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
        })),

      bulkImport: (txs) =>
        set((state) => {
          const now = new Date().toISOString()
          const newTxs = txs.map((tx) => ({
            ...tx,
            ...computeDerived(tx),
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
          }))
          return { transactions: [...state.transactions, ...newTxs] }
        }),
    }),
    { name: "contability-transactions" }
  )
)

export const selectTransactionsByPeriod = (period: PeriodKey) =>
  (state: TransactionState) => state.transactions.filter((tx) => tx.period === period)

export const selectByPeriodAndType = (period: PeriodKey, type: TransactionType) =>
  (state: TransactionState) => state.transactions.filter((tx) => tx.period === period && tx.type === type)
