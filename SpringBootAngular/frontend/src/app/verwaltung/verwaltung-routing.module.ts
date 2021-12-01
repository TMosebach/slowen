import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssetDetailsComponent } from './asset-details/asset-details.component';
import { AssetListComponent } from './asset-list/asset-list.component';
import { KontoDetailsComponent } from './konto-details/konto-details.component';
import { KontorahmenComponent } from './kontorahmen/kontorahmen.component';
import { VerwaltungComponent } from './verwaltung/verwaltung.component';

const routes: Routes = [
  {
    path: 'verwaltung',
    component: VerwaltungComponent,
    children: [
      {
        path: 'kontorahmen',
        component: KontorahmenComponent
      },
      {
        path: 'kontorahmen/new',
        component: KontoDetailsComponent
      },
      {
        path: 'kontorahmen/:id',
        component: KontoDetailsComponent
      },
      {
        path: 'assets',
        component: AssetListComponent
      },
      {
        path: 'assets/new',
        component: AssetDetailsComponent
      },
      {
        path: 'assets/:id',
        component: AssetDetailsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VerwaltungRoutingModule { }
