import { Routes } from '@angular/router';
import { AccountListComponent } from './components/accounts/account-list/account-list.component';
import { AccountFormComponent } from './components/accounts/account-form/account-form.component';
import { AccountDetailComponent } from './components/accounts/account-detail/account-detail.component';
import { BookingListComponent } from './components/bookings/booking-list/booking-list.component';
import { BookingFormComponent } from './components/bookings/booking-form/booking-form.component';
import { DepotDetailComponent } from './components/accounts/depot-detail/depot-detail.component';
import { SecuritiesListComponent } from './components/securities/securities-list/securities-list.component';
import { SecuritiesFormComponent } from './components/securities/securities-form/securities-form.component';
import { PricesInputComponent } from './components/securities/prices-input/prices-input.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ImportComponent } from './components/import/import.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'bookings', component: BookingListComponent },
  { path: 'bookings/new', component: BookingFormComponent },
  { path: 'bookings/new/purchase', component: BookingFormComponent, data: { vorgang: 'Kauf' } },
  { path: 'bookings/new/sale', component: BookingFormComponent, data: { vorgang: 'Verkauf' } },
  { path: 'bookings/:id/edit', component: BookingFormComponent },
  { path: 'accounts', component: AccountListComponent },
  { path: 'accounts/new', component: AccountFormComponent },
  { path: 'accounts/:id', component: AccountDetailComponent },
  { path: 'accounts/:id/depot', component: DepotDetailComponent },
  { path: 'accounts/:id/edit', component: AccountFormComponent },
  { path: 'securities', component: SecuritiesListComponent },
  { path: 'securities/form', component: SecuritiesFormComponent },
  { path: 'securities/form/:id', component: SecuritiesFormComponent },
  { path: 'securities/prices', component: PricesInputComponent },
  { path: 'import', component: ImportComponent }
];
