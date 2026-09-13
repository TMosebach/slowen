# AGENTS.md

Instructions and context for OpenCode sessions in **Slowen** (Electron + Angular desktop finance management app).

## Architecture & Tech Stack

- **Frontend (`src/`):** Angular 21 (standalone components, TypeScript, Tailwind CSS v4, SCSS). Communicates with Electron via `window.electronAPI` declared in `src/app/electron-api.d.ts`.
- **Backend / Main (`electron/`):** Electron main process, IPC handlers (`electron/ipc/`), and SQLite persistence (`electron/database/` using `better-sqlite3`).
- **Data flow:** Component -> Service (`src/app/services/`) -> `window.electronAPI` -> Preload (`electron/preload/preload.ts`) -> IPC handlers (`electron/ipc/`) -> Database modules (`electron/database/`).
- **Database:** SQLite in WAL mode with foreign keys enabled. Saved to `./slowen.db` in dev mode and `app.getPath('userData')/slowen.db` when packaged.

## Essential Commands

### Build & Typecheck
- `npm run build` — Build Angular frontend (`ng build`)
- `npm run build:electron` — Compile Electron TypeScript (`tsc -p electron/tsconfig.json` -> `dist-electron/`)
- `npm run rebuild` — Rebuild native `better-sqlite3` bindings for Electron (`electron-rebuild -f -w better-sqlite3`)
- `npm run lint` — Run Angular linter

### Testing
- `npm test` — Run Angular unit tests (Vitest via Angular CLI)
- `npm run test:electron` — Run Electron/DB unit tests using Electron's Node runtime
- **Single Angular test:** `npx ng test --include src/app/components/dashboard/dashboard.component.spec.ts`
- **Single Electron/DB test:** `ELECTRON_RUN_AS_NODE=1 electron node_modules/vitest/vitest.mjs run electron/database/accounts.spec.ts`

### Development
- `npm start` — Rebuilds sqlite, compiles electron, starts Angular dev server, and launches Electron app.

### New Features & Architecture Guidelines
- **Architecture Documentation:** Always read and follow `docs/Architektur.md` for architectural design, layer responsibilities, conventions, and data formats.
- **Use Cases:** Always create or update use-cases in `docs/use-cases/`.
- **Date & Number Formatting:**
  - Internal layers (SQLite database, domain models in TypeScript, IPC) strictly use ISO 8601 strings (`YYYY-MM-DD`).
  - External UI presentation in tables, lists, and detail cards must always format dates in German format (`DD.MM.YYYY`, e.g. via Angular DatePipe `| date:'dd.MM.yyyy'`) and currency amounts in German format (`1.234,56 €`).
  - Ingress / CSV import immediately normalizes any external date/number representations into ISO / standard numeric types.

## Critical Gotchas & Domain Rules

- **Native module ABI:** `better-sqlite3` is compiled against Electron's Node ABI. Running Node directly on database code will fail; always run database tests/scripts through `ELECTRON_RUN_AS_NODE=1 electron ...`.
- **System Accounts:** System accounts (`Wertpapierprovision`, `Stückzinsen`, `Kursgewinn`, `Kursverlust`, `Kapitalertragsteuer`, `Solidaritätszuschlag`) are seeded on init and protected against deletion or renaming in `electron/database/accounts.ts`.
- **Domain terminology (German):**
  - Booking types (`vorgang`): `'Buchung'`, `'Kauf'`, `'Verkauf'`
  - Account types (`type`): `'Bestand'` (assets/liabilities), `'GuV'` (P&L)
  - Securities types: `'Aktie'`, `'Anleihe'`, `'Fonds'`, `'ETF'`, `'Zertifikat'`
- **Sales & FIFO:** Sales (`Verkauf`) compute cost basis using FIFO lot matching implemented in `electron/database/sale-fifo.ts`.
- **IPC / Preload Sync:** When adding or changing IPC methods, update all four places:
  1. `electron/ipc/*.ipc.ts` (IPC handler)
  2. `electron/preload/preload.ts` (exposed API bridge)
  3. `src/app/electron-api.d.ts` (TypeScript types)
  4. `src/app/services/*.service.ts` (Angular service wrapper)
