status: DONE

files changed:
- src/app/app.routes.ts
- src/app/components/bookings/booking-form/booking-form.component.spec.ts
- src/app/components/bookings/booking-form/booking-form.component.ts
- src/app/components/bookings/booking-list/booking-list.component.html
- src/app/components/bookings/booking-list/booking-list.component.spec.ts
- src/app/components/bookings/booking-list/booking-list.component.ts
- .superpowers/sdd/task-8-report.md

test commands run and results:
- `npm test -- --watch=false --include src/app/components/bookings/booking-list/booking-list.component.spec.ts` -> FAIL (`TS2339: Property 'createPurchase' does not exist on type 'BookingListComponent'.`)
- `npm test -- --watch=false --include src/app/components/bookings/booking-list/booking-list.component.spec.ts` -> PASS (`1 passed`, `5 passed`)
- `npm test -- --watch=false --include src/app/components/bookings/booking-form/booking-form.component.spec.ts` -> FAIL (`expected 'Buchung' to be 'Kauf'`)
- `npm test -- --watch=false --include src/app/components/bookings/booking-list/booking-list.component.spec.ts` -> PASS (`1 passed`, `5 passed`)
- `npm test -- --watch=false --include src/app/components/bookings/booking-form/booking-form.component.spec.ts` -> PASS (`1 passed`, `11 passed`)

concerns or follow-ups:
- Test runs still emit the pre-existing Sass `@import` deprecation warning from `src/styles.scss`.
