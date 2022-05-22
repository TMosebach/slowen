import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BuchhaltungComponent } from './buchhaltung/buchhaltung.component';
import { BuchenComponent } from './views/buchen/buchen.component';
import { ErtragComponent } from './views/ertrag/ertrag.component';
import { KaufComponent } from './views/kauf/kauf.component';
import { KontoDetailsComponent } from './views/konto-details/konto-details.component';
import { KontoListeComponent } from './views/konto-liste/konto-liste.component';
import { KontoNeuComponent } from './views/konto-neu/konto-neu.component';

const routes: Routes = [
  {
    path: 'buchhaltung',
    component: BuchhaltungComponent,
    children: [
      {
        path: '',
        component: KontoListeComponent
      },
      {
        path: 'buchen/:id',
        component: BuchenComponent
      },
      {
        path: 'buchen',
        component: BuchenComponent
      },
      {
        path: 'kauf/:id',
        component: KaufComponent
      },
      {
        path: 'kauf',
        component: KaufComponent
      },
      {
        path: 'ertrag/:id',
        component: ErtragComponent
      },
      {
        path: 'ertrag',
        component: ErtragComponent
      },
      {
        path: 'konten/neu',
        component: KontoNeuComponent
      },
      {
        path: 'konten/:id',
        component: KontoDetailsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuchhaltungRoutingModule { }
