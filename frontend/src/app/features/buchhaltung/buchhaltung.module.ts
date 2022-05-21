import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { BuchhaltungRoutingModule } from './buchhaltung-routing.module';
import { BuchhaltungComponent } from './buchhaltung/buchhaltung.component';
import { KontoListeComponent } from './views/konto-liste/konto-liste.component';
import { BetragLabelComponent } from './component/betrag-label/betrag-label.component';
import { BuchenComponent } from './views/buchen/buchen.component';
import { BuchenFormularComponent } from './component/buchen-formular/buchen-formular.component';
import { KontoNeuComponent } from './views/konto-neu/konto-neu.component';
import { KontoFormularComponent } from './component/konto-formular/konto-formular.component';
import { KontoDetailsComponent } from './views/konto-details/konto-details.component';
import { UmsatzListeComponent } from './component/umsatz-liste/umsatz-liste.component';
import { AssetListeComponent } from './views/asset-liste/asset-liste.component';
import { MehrfachBuchungFormularComponent } from './component/mehrfach-buchung-formular/mehrfach-buchung-formular.component';
import { KaufComponent } from './views/kauf/kauf.component';
import { KaufFormularComponent } from './component/kauf-formular/kauf-formular.component';
import { AssetNeuComponent } from './views/asset-neu/asset-neu.component';
import { AssetFormularComponent } from './component/asset-formular/asset-formular.component';
import { BestandListeComponent } from './component/bestand-liste/bestand-liste.component';


@NgModule({
  declarations: [
    BuchhaltungComponent,
    KontoListeComponent,
    BetragLabelComponent,
    BuchenComponent,
    BuchenFormularComponent,
    KontoNeuComponent,
    KontoFormularComponent,
    KontoDetailsComponent,
    UmsatzListeComponent,
    AssetListeComponent,
    MehrfachBuchungFormularComponent,
    KaufComponent,
    KaufFormularComponent,
    AssetNeuComponent,
    AssetFormularComponent,
    BestandListeComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BuchhaltungRoutingModule
  ],
  exports: [
    KontoNeuComponent,
    AssetListeComponent,
    AssetNeuComponent
  ]
})
export class BuchhaltungModule { }
