import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BuchhaltungRoutingModule } from './buchhaltung-routing.module';
import { BuchhaltungComponent } from './buchhaltung.component';
import { KontoUebersichtComponent } from './konto-uebersicht/konto-uebersicht.component';
import { ComponentsModule } from '../components/components.module';
import { BuchenComponent } from './buchen/buchen.component';
import { KontoUmsatzComponent } from './konto-umsatz/konto-umsatz.component';
import { AssethandelComponent } from './assethandel/assethandel.component';
import { AsseteinnahmenComponent } from './asseteinnahmen/asseteinnahmen.component';

@NgModule({
  declarations: [
    BuchhaltungComponent,
    KontoUebersichtComponent,
    BuchenComponent,
    KontoUmsatzComponent,
    AssethandelComponent,
    AsseteinnahmenComponent
  ],
  imports: [
    CommonModule,
    BuchhaltungRoutingModule,
    ComponentsModule
  ]
})
export class BuchhaltungModule { }
