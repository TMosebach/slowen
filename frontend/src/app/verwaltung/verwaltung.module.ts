import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VerwaltungRoutingModule } from './verwaltung-routing.module';
import { KontoVerwaltungComponent } from './konto-verwaltung/konto-verwaltung.component';
import { VerwaltungComponent } from './verwaltung.component';
import { AssetVerwaltungComponent } from './asset-verwaltung/asset-verwaltung.component';
import { ComponentsModule} from '../components/components.module';
import { KontoDetailsComponent } from './konto-details/konto-details.component';
import { AssetDetailsComponent } from './asset-details/asset-details.component';

@NgModule({
  declarations: [
    KontoVerwaltungComponent,
    VerwaltungComponent,
    AssetVerwaltungComponent,
    KontoDetailsComponent,
    AssetDetailsComponent
  ],
  imports: [
    CommonModule,
    VerwaltungRoutingModule,
    ComponentsModule
  ]
})
export class VerwaltungModule { }
