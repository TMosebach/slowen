import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssetListeComponent } from '../buchhaltung/views/asset-liste/asset-liste.component';
import { KontoNeuComponent } from '../buchhaltung/views/konto-neu/konto-neu.component';
import { VerwaltungComponent } from './verwaltung.component';

const routes: Routes = [
  {
    path: 'verwaltung',
    component: VerwaltungComponent,
    children: [
      {
        path: 'konten',
        component: KontoNeuComponent
      },
      {
        path: 'assets',
        component: AssetListeComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VerwaltungRoutingModule { }
