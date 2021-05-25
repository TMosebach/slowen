import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { BuchhaltungRoutingModule } from './buchhaltung-routing.module';
import { KontoListComponent } from './common/konto-list/konto-list.component';

@NgModule({
  declarations: [
    KontoListComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    BuchhaltungRoutingModule
  ],
  exports: [
    KontoListComponent
  ]
})
export class BuchhaltungModule { }
