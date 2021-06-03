import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { VerwaltungRoutingModule } from './verwaltung-routing.module';
import { VerwaltungComponent } from './verwaltung/verwaltung.component';
import { KontorahmenComponent } from './kontorahmen/kontorahmen.component';
import { BuchhaltungModule } from '../buchhaltung/buchhaltung.module';
import { KontoDetailsComponent } from '../verwaltung/konto-details/konto-details.component';
import { AssetListComponent } from './asset-list/asset-list.component';
import { AssetDetailsComponent } from './asset-details/asset-details.component';
import { KontoListeComponent } from './konto-liste/konto-liste.component';


@NgModule({
  declarations: [
    VerwaltungComponent,
    KontorahmenComponent,
    KontoDetailsComponent,
    AssetListComponent,
    AssetDetailsComponent,
    KontoListeComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    VerwaltungRoutingModule,
    BuchhaltungModule
  ]
})
export class VerwaltungModule { }
