# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Chilean accounting app that calculates VAT (IVA), tracks income/expenses, and generates SII tax forms (F29, F22). Early stage — App.tsx is still the Vite scaffold; core features are not yet built.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — type-check with `tsc -b` then `vite build`
- `npm run lint` — ESLint (flat config, TS + React hooks + React Refresh)
- `npm run preview` — serve production build locally
- No test runner is configured yet

## Tech Stack

- React 19 + TypeScript 6 (strict: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`)
- Vite 8 bundler
- TailwindCSS v4 (via `@tailwindcss/vite` plugin, not PostCSS)
- shadcn/ui components (radix-ui primitives, `cn()` in `src/lib/utils.ts`)
- Zustand for state (no stores created yet)
- React Router DOM v7 (not wired up yet)
- React Hook Form + Zod for form validation
- date-fns for date formatting
- `sonner` for toast notifications

## Architecture

### Path alias
`@/*` maps to `./src/*` (configured in both `tsconfig.app.json` and `vite.config.ts`).

### Key files
- `src/types/common.ts` — shared types (`UUID`, `CLP`, `RUT`, `PeriodKey`, `ISODateString`), `SiiDocumentType` enum (33–61), `SII_DOCUMENT_LABELS`, `TaxRegime` enum, constants `IVA_RATE` (0.19), `RETENCION_HONORARIOS_RATE` (0.145)
- `src/types/company.ts` — `CompanySettings` interface, `DEFAULT_COMPANY`
- `src/lib/utils.ts` — `cn()` (clsx + tailwind-merge)
- `src/index.css` — shadcn/ui theme tokens (light/dark via oklch), print media `no-print` class

### Intended structure (not all directories exist yet)
```
src/
  components/    # shadcn/ui and custom components
  store/         # Zustand stores (slices pattern)
  types/         # TypeScript types and domain constants
  lib/           # Utilities
```

## Domain Rules (Chile SII)

- IVA (VAT) = 19% (`IVA_RATE` constant)
- Retenci&oacute;n honorarios = 14.5% (`RETENCION_HONORARIOS_RATE` constant)
- SII document types are defined in `SiiDocumentType` enum (factura=33, boleta=39, nota cr&eacute;dito=61, etc.)
- Tax regimes: Pro Pyme General (`14D_N3`), Pro Pyme Transparente (`14D_N8`)
- F29 code mapping: 538=total ventas afectas, 111=compras con cr&eacute;dito fiscal, 91=d&eacute;bito minus cr&eacute;dito
- Never assume SII codes — use the defined mappings in `common.ts`
- All financial calculations must be deterministic and traceable

## Approach

- Think before acting. Read existing files before writing code.
- Prefer editing over rewriting whole files.
- Keep solutions simple and direct.
- Separate UI from business logic.
- Use Zustand selectors to avoid unnecessary re-renders.
- Validate all financial calculations — correctness over assumptions.
