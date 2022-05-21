import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuchhaltungRoutingModule } from './buchhaltung-routing.module';
import { BuchhaltungComponent } from './buchhaltung.component';
import { HttpClientModule } from '@angular/common/http';
import { ShareModule } from '../share/share.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KontouebersichtComponent } from './views/kontouebersicht/kontouebersicht.component';
import { KontodetailsComponent } from './views/kontodetails/kontodetails.component';
import { BuchungListeComponent } from './components/buchung-liste/buchung-liste.component';
import { BuchenComponent } from './views/buchen/buchen.component';
import { BuchenFormularComponent } from './components/buchen-formular/buchen-formular.component';
import { HandelFormularComponent } from './components/handel-formular/handel-formular.component';
import { ErtragFormularComponent } from './components/ertrag-formular/ertrag-formular.component';

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
