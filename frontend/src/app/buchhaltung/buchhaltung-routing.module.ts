import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BuchenComponent } from './buchen/buchen.component';
import { BuchhaltungComponent } from './buchhaltung/buchhaltung.component';
import { HandelComponent } from './handel/handel.component';
import { KontoBuchungenComponent } from './konto-buchungen/konto-buchungen.component';
import { KontoListeComponent } from './konto-liste/konto-liste.component';

const routes: Routes = [
  {
    path: 'buchhaltung',
    component: BuchhaltungComponent,
    children: [
      {
        path: 'konten/:id',
        component: KontoBuchungenComponent
      },
      {
        path: 'konten',
        component: KontoListeComponent
      },
      {
        path: 'buchen',
        component: BuchenComponent
      },
      {
        path: 'handel',
        component: HandelComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuchhaltungRoutingModule { }
