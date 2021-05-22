import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AsseteinnahmenComponent } from './asseteinnahmen/asseteinnahmen.component';
import { AssethandelComponent } from './assethandel/assethandel.component';
import { BuchenComponent } from './buchen/buchen.component';
import { BuchhaltungComponent } from './buchhaltung.component';
import { KontoUebersichtComponent } from './konto-uebersicht/konto-uebersicht.component';
import { KontoUmsatzComponent } from './konto-umsatz/konto-umsatz.component';

const routes: Routes = [
  {
    path: 'buchhaltung',
    component: BuchhaltungComponent,
    children: [
      {
        path: 'konten/:id',
        component: KontoUmsatzComponent
      },
      {
        path: 'konten',
        component: KontoUebersichtComponent
      },
      {
        path: 'buchen',
        component: BuchenComponent
      },
      {
        path: 'assethandel',
        component: AssethandelComponent
      },
      {
        path: 'asseteinnahmen',
        component: AsseteinnahmenComponent
      },
      {
        path: '',
        redirectTo: 'konten',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuchhaltungRoutingModule { }
