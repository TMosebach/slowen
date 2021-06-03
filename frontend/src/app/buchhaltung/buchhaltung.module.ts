import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { BuchhaltungRoutingModule } from './buchhaltung-routing.module';
import { BuchhaltungComponent } from './buchhaltung/buchhaltung.component';
import { KontoListeComponent } from './konto-liste/konto-liste.component';
import { BuchenComponent } from './buchen/buchen.component';
import { KontoBuchungenComponent } from './konto-buchungen/konto-buchungen.component';

@NgModule({
  declarations: [
  
    BuchhaltungComponent,
       KontoListeComponent,
       BuchenComponent,
       KontoBuchungenComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    BuchhaltungRoutingModule
  ],
  exports: [
  ]
})
export class BuchhaltungModule { }
