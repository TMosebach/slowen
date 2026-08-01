# Final Review Fix Report

## Findings addressed

### 1. `PRAGMA foreign_keys` never enabled (Critical)
- **Fix:** `initDatabaseSchema()` in `electron/database/connection.ts` now runs `database.pragma('foreign_keys = ON')` before schema DDL.
- **Test:** `electron/database/connection.spec.ts` asserts `pragma('foreign_keys')` is `1` after init on a fresh `:memory:` DB.

### 2. System accounts user-editable/deletable (High)
- **Fix:** `accounts.update`/`accounts.delete` in `electron/database/accounts.ts` reject operations on protected system accounts (`Wertpapierprovision`, `Stückzinsen`, type `GuV`, subtype `Aufwand`) with a German error message.
- **UI:** `account-list` component now shows "Systemkonto" instead of "Bearbeiten"/"Löschen" for protected accounts, via shared `isSystemAccount()` helper in `src/app/models/account.model.ts`.
- **Tests:** `electron/database/accounts.spec.ts` (update/delete rejected, normal accounts unaffected); `account-list.component.spec.ts` (actions hidden for protected accounts).

### 3. System account lookup not enforced by shape (High)
- **Fix:** `requireSystemAccount()` in `electron/database/bookings.ts` now requires exactly one row with the given name AND `type = 'GuV'`, `subtype = 'Aufwand'`; `0` or `>1` matches fail loudly with `Systemkonto-Invariante verletzt: <name>` (no silent arbitrary pick).
- **Tests:** `electron/database/bookings.spec.ts` — duplicate `Wertpapierprovision` fails; `Stückzinsen` with wrong type/subtype fails.

### 4. Fractional quantity input blocked (Low)
- **Fix:** `booking-form.component.html` quantity input gets `step="any"` so fractional Fondsanteile are valid in the browser.
- **Test:** `booking-form.component.spec.ts` asserts `step` attribute is `any`.

### 5. Cascade behavior covered
- **Test:** `electron/database/bookings.spec.ts` — deleting a `Kauf` booking removes its `booking_positions` and `depot_positions` rows.

## Repository hygiene
- Removed stale committed compiled artifacts in `src/app/models/` (`*.js`, `*.js.map`, `*.d.ts`, `*.d.ts.map` for `account.model`, `booking.model`) that shadowed TS sources under vitest resolution (vite resolves `.js` before `.ts`). `booking.model.js` still contained the pre-feature `VORGANG_OPTIONS = ['Buchung']`, causing the model spec to fail under vitest while passing under `ng test`.

## Verification
- Electron vitest: 7 files, 21 tests passed.
- Angular suite (`ng test --watch=false`): 12 files, 56 tests passed.
- `npm run build:electron` and `npm run build`: clean.
