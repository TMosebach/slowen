import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BuchhaltungComponent } from './buchhaltung/buchhaltung.component';

const routes: Routes = [
  { path: 'reports', loadChildren: () => import('./reports/reports.module').then(m => m.ReportsModule) },
  { path: '', pathMatch: 'full', redirectTo: 'buchhaltung' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
