import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StammdatenComponent } from './stammdaten/stammdaten.component';
import { BuchhaltungComponent } from './buchhaltung/buchhaltung.component';
import { KontolisteComponent } from './stammdaten/kontoliste/kontoliste.component';
import { KontodetailsComponent } from './stammdaten/kontodetails/kontodetails.component';
import { BestandskontenComponent } from './buchhaltung/bestandskonten/bestandskonten.component';
import { BuchenComponent } from './buchhaltung/buchen/buchen.component';
import { KontoUmsatzComponent } from './buchhaltung/konto-umsatz/konto-umsatz.component';
import { EditBuchungComponent } from './buchhaltung/edit-buchung/edit-buchung.component';
import { BestandComponent } from './buchhaltung/bestand/bestand.component';

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
  {
    path: 'buchhaltung',
    component: BuchhaltungComponent,
    children: [
      { path: 'buchen/:kontoId/:buchungId', component: EditBuchungComponent },
      { path: 'buchen/:kontoId', component: BuchenComponent },
      { path: 'umsatz/:kontoId', component: KontoUmsatzComponent },
      { path: 'bestand/:kontoId', component: BestandComponent },
      { path: '', component: BestandskontenComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
