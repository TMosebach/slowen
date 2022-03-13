import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuchhaltungRoutingModule } from './buchhaltung-routing.module';
import { BuchhaltungComponent } from './buchhaltung.component';
import { KontouebersichtComponent } from './kontouebersicht/kontouebersicht.component';
import { KontodetailsComponent } from './kontodetails/kontodetails.component';
import { HttpClientModule } from '@angular/common/http';
import { ShareModule } from '../share/share.module';
import { BuchungListeComponent } from './kontodetails/buchung-liste/buchung-liste.component';
import { BuchenComponent } from './buchen/buchen.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BuchenFormularComponent } from './buchen/buchen-formular/buchen-formular.component';
import { HandelFormularComponent } from './buchen/handel-formular/handel-formular.component';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErtragFormularComponent } from './buchen/ertrag-formular/ertrag-formular.component';

@NgModule({
  declarations: [
    BuchhaltungComponent,
    KontouebersichtComponent,
    KontodetailsComponent,
    BuchungListeComponent,
    BuchenComponent,
    BuchenFormularComponent,
    HandelFormularComponent,
    ErtragFormularComponent
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    ShareModule,
    BuchhaltungRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    TypeaheadModule.forRoot()
  ],
  exports: [
    BuchhaltungComponent
  ]
})
export class BuchhaltungModule { }
