import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssetDetailsComponent } from './asset-details/asset-details.component';
import { AssetVerwaltungComponent } from './asset-verwaltung/asset-verwaltung.component';
import { KontoDetailsComponent } from './konto-details/konto-details.component';
import { KontoVerwaltungComponent } from './konto-verwaltung/konto-verwaltung.component';
import { VerwaltungComponent } from './verwaltung.component';

const routes: Routes = [
  {
    path: 'verwaltung',
    component: VerwaltungComponent,
    children: [
      {
        path: 'konto/:id',
        component: KontoDetailsComponent
      },
      {
        path: 'konto',
        component: KontoVerwaltungComponent
      }
      ,
      {
        path: 'asset/:id',
        component: AssetDetailsComponent
      },
      {
        path: 'asset',
        component: AssetVerwaltungComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VerwaltungRoutingModule { }
