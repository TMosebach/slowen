import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BuchenComponent } from './buchen/buchen.component';
import { BuchhaltungComponent } from './buchhaltung.component';
import { KontodetailsComponent } from './kontodetails/kontodetails.component';
import { KontouebersichtComponent } from './kontouebersicht/kontouebersicht.component';

const routes: Routes = [
  { 
    path: 'buchhaltung',
    component: BuchhaltungComponent,
    children: [
      { path: 'buchen', component: BuchenComponent },
      { path: 'konto/:name', component: KontodetailsComponent },
      { path: '', component: KontouebersichtComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuchhaltungRoutingModule { }
