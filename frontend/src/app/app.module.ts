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

@NgModule({
  declarations: [
    AppComponent,
    StammdatenComponent,
    BuchhaltungComponent,
    KontolisteComponent,
    KontodetailsComponent,
    BestandskontenComponent,
    BuchenComponent,
    KontoUmsatzComponent
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
