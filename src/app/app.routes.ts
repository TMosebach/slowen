import { Routes } from '@angular/router';
import { AccountListComponent } from './components/accounts/account-list/account-list.component';
import { AccountFormComponent } from './components/accounts/account-form/account-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/accounts', pathMatch: 'full' },
  { path: 'accounts', component: AccountListComponent },
  { path: 'accounts/new', component: AccountFormComponent },
  { path: 'accounts/:id/edit', component: AccountFormComponent }
];
