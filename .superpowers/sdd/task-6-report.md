status: DONE

files changed:
- src/app/components/bookings/booking-form/booking-form.component.ts
- src/app/components/bookings/booking-form/booking-form.component.html
- src/app/components/bookings/booking-form/booking-form.component.spec.ts
- src/app/services/booking.service.spec.ts
- .superpowers/sdd/task-6-report.md

test commands run:
- `npm test -- --watch=false --include src/app/components/bookings/booking-form/booking-form.component.spec.ts --include src/app/services/booking.service.spec.ts`
  - first run: FAIL as expected in red phase because `isPurchase`, `getPurchaseValue`, and `getPurchaseTotal` were missing on `BookingFormComponent`
  - second run: test assertions passed but Vitest reported an unhandled router error for `/bookings`
  - final run: PASS, 2 test files passed, 15 tests passed

concerns / follow-ups:
- Test output still includes the existing Angular Sass deprecation warning from `src/styles.scss` using `@import "tailwindcss"`; this task did not change styles.
