status: DONE

files changed:
- src/app/components/bookings/booking-form/booking-form.component.ts
- src/app/components/bookings/booking-form/booking-form.component.html
- src/app/components/bookings/booking-form/booking-form.component.spec.ts
- .superpowers/sdd/task-7-report.md

test commands run:
- `npm test -- --watch=false --include src/app/components/bookings/booking-form/booking-form.component.spec.ts`
  - first run: FAIL as expected before implementation because `BookingFormComponent` was missing `depotAccounts`, `settlementAccounts`, `loadSecurities`, and `securities`
  - second run: PASS, 1 test file passed, 10 tests passed

concerns and follow-ups:
- Test output still includes the pre-existing Sass `@import` deprecation warning from `src/styles.scss`
