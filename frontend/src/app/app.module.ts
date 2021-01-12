import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StammdatenComponent } from './stammdaten/stammdaten.component';
import { BuchhaltungComponent } from './buchhaltung/buchhaltung.component';
import { KontolisteComponent } from './stammdaten/kontoliste/kontoliste.component';
import { KontodetailsComponent } from './stammdaten/kontodetails/kontodetails.component';
import { BestandskontenComponent } from './buchhaltung/bestandskonten/bestandskonten.component';
import { BuchenComponent } from './buchhaltung/buchen/buchen.component';
import { KontoUmsatzComponent } from './buchhaltung/konto-umsatz/konto-umsatz.component';
// tslint:disable-next-line: max-line-length
import { KomplexBuchungFormularComponent } from './buchhaltung/buchung-formular/komplex-buchung-formular/komplex-buchung-formular.component';
import { SimpleBuchungFormularComponent } from './buchhaltung/buchung-formular/simple-buchung-formular/simple-buchung-formular.component';
import { BuchungFormularComponent } from './buchhaltung/buchung-formular/buchung-formular.component';
import { UmsatzTabelleComponent } from './buchhaltung/kontoUmsatz/umsatz-tabelle/umsatz-tabelle.component';
import { EditBuchungComponent } from './buchhaltung/edit-buchung/edit-buchung.component';
import { BestandComponent } from './buchhaltung/bestand/bestand.component';
import { KaufFormularComponent } from './buchhaltung/bestand/kauf-formular/kauf-formular.component';
import { AssetListeComponent } from './stammdaten/asset-liste/asset-liste.component';
import { AssetDetailsComponent } from './stammdaten/asset-details/asset-details.component';

@NgModule({
  declarations: [
    AppComponent,
    StammdatenComponent,
    BuchhaltungComponent,
    KontolisteComponent,
    KontodetailsComponent,
    BestandskontenComponent,
    BuchenComponent,
    KontoUmsatzComponent,
    KomplexBuchungFormularComponent,
    SimpleBuchungFormularComponent,
    BuchungFormularComponent,
    UmsatzTabelleComponent,
    EditBuchungComponent,
    BestandComponent,
    KaufFormularComponent,
    AssetListeComponent,
    AssetDetailsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
