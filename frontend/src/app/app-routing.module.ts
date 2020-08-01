import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StammdatenComponent } from './stammdaten/stammdaten.component';
import { BuchhaltungComponent } from './buchhaltung/buchhaltung.component';
import { KontolisteComponent } from './stammdaten/kontoliste/kontoliste.component';
import { KontodetailsComponent } from './stammdaten/kontodetails/kontodetails.component';

const routes: Routes = [
  {
    path: 'stammdaten',
    component: StammdatenComponent,
    children: [
      {
        path: '',
        children: [
          { path: 'konten/new', component: KontodetailsComponent },
          { path: 'konten', component: KontolisteComponent }
        ]
      }
    ]
  },
  { path: 'buchhaltung', component: BuchhaltungComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
