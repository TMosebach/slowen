import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { BuchhaltungRoutingModule } from './buchhaltung-routing.module';
import { BuchhaltungComponent } from './buchhaltung/buchhaltung.component';
import { KontoListeComponent } from './konto-liste/konto-liste.component';
import { BuchenComponent } from './buchen/buchen.component';
import { KontoBuchungenComponent } from './konto-buchungen/konto-buchungen.component';
import { HandelComponent } from './handel/handel.component';

@NgModule({
  declarations: [
    BuchhaltungComponent,
    KontoListeComponent,
    BuchenComponent,
    KontoBuchungenComponent,
    HandelComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    BuchhaltungRoutingModule,
    ReactiveFormsModule
  ],
  exports: [
  ]
})
export class BuchhaltungModule { }
