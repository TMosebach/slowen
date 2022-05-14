import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VerwaltungRoutingModule } from './verwaltung-routing.module';
import { VerwaltungComponent } from './verwaltung.component';
import { BuchhaltungModule } from '../buchhaltung/buchhaltung.module';


@NgModule({
  declarations: [
    VerwaltungComponent
  ],
  imports: [
    CommonModule,
    VerwaltungRoutingModule,
    BuchhaltungModule
  ]
})
export class VerwaltungModule { }
