import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BuchhaltungComponent } from './buchhaltung.component';
import { BuchenComponent } from './views/buchen/buchen.component';
import { KontodetailsComponent } from './views/kontodetails/kontodetails.component';
import { KontouebersichtComponent } from './views/kontouebersicht/kontouebersicht.component';

const routes: Routes = [
  { 
    path: 'buchhaltung',
    component: BuchhaltungComponent,
    children: [
      { path: 'buchen', component: BuchenComponent },
      { path: 'konto/:id', component: KontodetailsComponent },
      { path: '', component: KontouebersichtComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuchhaltungRoutingModule { }
