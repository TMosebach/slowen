import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AssetRef } from '../../model/asset-ref';
import { Buchung } from '../../model/buchung';
import { BuchungArt } from '../../model/buchung-art';
import { Konto } from '../../model/konto';
import { KontoRef } from '../../model/konto-ref';
import { Umsatz } from '../../model/umsatz';
import { BuchhaltungService } from '../../service/buchhaltung.service';

@Component({
  selector: 'app-ertrag-formular',
  templateUrl: './ertrag-formular.component.html',
  styleUrls: ['./ertrag-formular.component.scss']
})
export class ErtragFormularComponent implements OnInit {

  @Output() ertrag = new EventEmitter<Buchung>();

  ertragForm: FormGroup;

  assetauswahl$: Observable<AssetRef[]>;
  depotauswahl$: Observable<Konto[]>;
  kontoauswahl$: Observable<Konto[]>;

  constructor(
      private fb: FormBuilder,
      private activatedRoute: ActivatedRoute,
      private buchhaltungService: BuchhaltungService
  ) {
    const id = this.activatedRoute.snapshot.params['id'];
    this.ertragForm = this.fb.group({
      datum: [this.heute()],
      depot: [id, Validators.required],
      asset: ['', Validators.required],
      verrechnungskonto: ['', Validators.required],
      valuta: [this.heute()],
      ertrag : [''],
      kapitalertragssteuer: [''],
      solidaritaetszuschlag: ['']
    });
    this.assetauswahl$ = this.buchhaltungService.getAssets();
    // TODO Sobald der Kontotyp bekannt ist, filtern:
    this.depotauswahl$ = this.buchhaltungService.getKonten();
    this.kontoauswahl$ = this.depotauswahl$;
  }

  ngOnInit(): void {
  }

  speichern() {
    const buchung = this.createBuchung(this.ertragForm.value);
    console.log(buchung);
    this.ertrag.emit(buchung);
  }

  createBuchung( formValue:any  ) {

    const ertrag = +formValue.ertrag;
    const kapitalertragssteuer = +formValue.kapitalertragssteuer;
    const solidaritaetszuschlag = +formValue.solidaritaetszuschlag;

    const buchung: Buchung = {
      art: BuchungArt.Ertrag,
      datum: this.heute(),
      beschreibung: 'Ertrag ' + formValue.asset.name,
      umsaetze: [
        this.createUmsatz( { id: formValue.depot }, formValue.valuta, 0, formValue.asset ),
        this.createUmsatz( { name: 'Wertpapierertrag' }, formValue.valuta, -ertrag ),
        this.createUmsatz( { id: formValue.verrechnungskonto } , formValue.valuta, ertrag - kapitalertragssteuer - solidaritaetszuschlag)
      ]
    };

    if (kapitalertragssteuer > 0){
      buchung.umsaetze?.push( this.createUmsatz( { name: 'Kapitalertragssteuer' }, formValue.valuta, kapitalertragssteuer ) );
    }
    if (solidaritaetszuschlag > 0){
      buchung.umsaetze?.push( this.createUmsatz( { name: 'Solidaritätszuschlag' }, formValue.valuta, solidaritaetszuschlag ) );
    }

    return buchung;
  }

  createUmsatz( konto: KontoRef, valuta: string, betrag: number, asset?: AssetRef) {
    const umsatz: Umsatz = {
      konto,
      valuta,
      betrag: {
        betrag,
        waehrung: 'EUR'
      }
    };
    if (asset) {
      umsatz.asset = asset;
    }
    return umsatz;
  }

  private heute(): string {
    return new Date().toISOString().substring(0, 10)
  }
}
