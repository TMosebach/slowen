# Final Review Fix Report

## Findings addressed

### 1) CRITICAL: negative-net sales could be created and later break sale detail loading
- **Fix:** Added strict sale validation in `electron/database/bookings.ts` and `src/app/components/bookings/booking-form/booking-form.component.ts`:
  - required fields present
  - `quantity > 0`, `price_per_unit > 0`
  - deduction fields non-negative
  - depot and settlement accounts differ
  - `nettozufluss > 0` (prevents invalid negative-net sale creation)
  - frontend blocks oversell early via live FIFO holdings check
- **Fix:** Removed fragile sale detail reconstruction from `booking_positions` sign heuristics (which failed on negative-net); sale details are now loaded from dedicated persisted sale input data.
- **Tests:**
  - `electron/database/bookings.spec.ts`: `rejects sale when deductions exceed gross proceeds`
  - `src/app/components/bookings/booking-form/booking-form.component.spec.ts`: `rejects sale submit when net inflow is non-positive`

### 2) IMPORTANT: depot summary average and purchase value wrong after sales
- **Fix:** Reworked depot aggregation in `src/app/components/accounts/depot-detail/depot-detail.component.ts` to apply FIFO lot consumption to purchase lots before computing:
  - `total_quantity`
  - `average_price_per_unit`
  - `total_purchase_value`
- **Result:** summary reflects remaining lot mix, not gross purchase totals.
- **Tests:**
  - `src/app/components/accounts/depot-detail/depot-detail.component.spec.ts`: existing quantity reduction assertion extended for value/average correctness
  - added `uses FIFO lots for average price and purchase value after sales`

### 3) IMPORTANT: sales were persisted into `depot_positions` though ledger must stay purchase-only
- **Fix:** Introduced `sale_details` table in `electron/database/connection.ts` for sale input persistence (`security_id`, `depot_account_id`, `settlement_account_id`, `quantity`, `price_per_unit`, deductions).
- **Fix:** Updated `electron/database/bookings.ts` create/update/delete flows:
  - `depot_positions` inserts now happen only for `Kauf`
  - `Verkauf` details persist in `sale_details`
  - sale loading now uses `sale_details`
  - FIFO history for sale pricing combines purchase lots (`depot_positions`) + prior sales (`sale_details`)
- **Fix:** Added backward-compatible migration path (`migrateLegacySaleDetails`) to populate missing `sale_details` from legacy sale rows in `depot_positions` and existing booking positions.
- **Tests:**
  - `electron/database/bookings.spec.ts`: verifies sale writes no `depot_positions` row and does write `sale_details`
  - `electron/database/connection.spec.ts`: verifies `sale_details` schema exists

### 4) MINOR: live PnL display missing in sale form
- **Fix:** Added live sale metrics in `src/app/components/bookings/booking-form/booking-form.component.html`:
  - `FIFO-Einstand (live)`
  - `Kursgewinn/-verlust (live)`
  - red inline warning for insufficient holdings
- **Fix:** Implemented frontend FIFO preview in `src/app/components/bookings/booking-form/booking-form.component.ts` (`getSaleEstimatedCostBasis`, `getSalePnl`, `hasEnoughHoldingsForSale`).
- **Tests:**
  - `src/app/components/bookings/booking-form/booking-form.component.spec.ts`: live PnL/cost-basis and insufficient-holdings coverage

## Verification (command output summary)

1. `npm test -- --watch=false --include electron/database/bookings.spec.ts --include electron/database/connection.spec.ts --include src/app/components/accounts/depot-detail/depot-detail.component.spec.ts --include src/app/components/bookings/booking-form/booking-form.component.spec.ts`
   - PASS (2 files, 28 tests)

2. `npm run test:electron`
   - PASS (7 files, 43 tests)

3. `npm test -- --watch=false`
   - PASS (12 files, 73 tests)

## Notes
- `ng test` still emits existing Sass `@import` deprecation warnings from `src/styles.scss`; unrelated to this fix pass.

### 5) IMPORTANT: server-side sale account-role validation missing
- **Fix:** Extended sale validation in `electron/database/bookings.ts` so Verkauf enforces account semantics server-side:
  - `saleDetails.depot_account_id` must resolve to an existing `accounts` row with `type = Bestand` and `subtype = Depot`
  - `saleDetails.settlement_account_id` must resolve to an existing `accounts` row with `type = Bestand` and `subtype != Depot`
- **Fix:** Kept rejection messages explicit and German:
  - `Das Depot-Konto muss ein bestehendes Konto vom Typ Bestand mit Untertyp Depot sein.`
  - `Das Verrechnungskonto muss ein bestehendes Konto vom Typ Bestand mit einem Untertyp ungleich Depot sein.`
- **Tests:** Added coverage in `electron/database/bookings.spec.ts`:
  - `rejects sale when depot account is not a Depot account`
  - `rejects sale when settlement account is not a Bestand non-Depot account`

## Additional verification (final-review account-role fix)

1. `ELECTRON_RUN_AS_NODE=1 npx electron node_modules/vitest/vitest.mjs run electron/database/bookings.spec.ts`
   - PASS (1 file, 17 tests)

2. `npm run test:electron`
   - PASS (7 files, 45 tests)
