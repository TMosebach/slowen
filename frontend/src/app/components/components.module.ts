import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KontoListeComponent } from './konto-liste/konto-liste.component';
import { KontoListeFilterComponent } from './konto-liste-filter/konto-liste-filter.component';
import { AssetListeComponent } from './asset-liste/asset-liste.component';
import { BuchenFormularComponent } from './buchen-formular/buchen-formular.component';
import { KontoDetailsFormularComponent } from './konto-details-formular/konto-details-formular.component';

@NgModule({
  declarations: [
    KontoListeComponent,
    KontoListeFilterComponent,
    AssetListeComponent,
    BuchenFormularComponent,
    KontoDetailsFormularComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    KontoListeComponent,
    KontoListeFilterComponent,
    AssetListeComponent,
    BuchenFormularComponent,
    KontoDetailsFormularComponent
  ]
})
export class ComponentsModule { }
