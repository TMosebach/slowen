import { HtmlParser } from '@angular/compiler';
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
  selector: 'app-verkauf-formular',
  templateUrl: './verkauf-formular.component.html',
  styleUrls: ['./verkauf-formular.component.scss']
})
export class VerkaufFormularComponent implements OnInit {
  @Output() verkauf = new EventEmitter<Buchung>();

  verkaufForm: FormGroup;
  assets!: AssetRef[];

  depotauswahl$: Observable<Konto[]>;
  kontoauswahl$: Observable<Konto[]>;

  constructor(
      private fb: FormBuilder,
      private activatedRoute: ActivatedRoute,
      private buchhaltungService: BuchhaltungService
  ) {
    const kontoId = this.activatedRoute.snapshot.params['kontoId'];
    const assetId = this.activatedRoute.snapshot.params['assetId'];
    this.buchhaltungService.getAssets().subscribe( assets => this.assets = assets );

    // TODO Sobald der Kontotyp bekannt ist, filtern:
    this.depotauswahl$ = this.buchhaltungService.getKonten();
    this.kontoauswahl$ = this.depotauswahl$;
    this.verkaufForm = this.fb.group({
      datum: [this.heute()],
      depot: [kontoId, Validators.required],
      asset: [assetId, Validators.required],
      verrechnungskonto: ['', Validators.required],
      valuta: [this.heute()],
      menge: [''],
      betrag: [''],
      gebuehren: [''],
      kapitalertragssteuer: [''],
      solidaritaetszuschlag: ['']
    });

  }

  ngOnInit(): void {
  }

  speichern() {
    const buchung = this.createBuchung(this.verkaufForm.value);
    this.verkauf.emit(buchung);
  }

  createBuchung( formValue:any  ) {

    const betrag = +formValue.betrag;
    const gebuehr = +formValue.gebuehren;
    const menge = +formValue.menge;
    const kapitalertragssteuer = +formValue.kapitalertragssteuer;
    const solidaritaetszuschlag = +formValue.solidaritaetszuschlag;
    const assetAuswahl = this.assets.filter( asset => asset.id === formValue.asset )

    const wert = betrag-gebuehr-kapitalertragssteuer-solidaritaetszuschlag

    const buchung: Buchung = {
      art: BuchungArt.Verkauf,
      datum: this.heute(),
      beschreibung: 'Verkauf ' + menge + ' ' + assetAuswahl[0].name,
      umsaetze: [
        this.createUmsatz( { id: formValue.depot }, formValue.valuta, -betrag, { asset: formValue.asset, menge: -menge }),
        this.createUmsatz( { name: 'Handelsgebühr' }, formValue.valuta, gebuehr),
        this.createUmsatz( { id: formValue.verrechnungskonto } , formValue.valuta, wert)
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

  createUmsatz( konto: KontoRef, valuta: string, betrag: number, bestand?: any) {
    const umsatz: Umsatz = {
      konto,
      valuta,
      betrag: {
        betrag,
        waehrung: 'EUR'
      }
    };
    if(bestand) {
      umsatz.menge = {
        menge: bestand.menge,
				einheit: 'St.'
      },
      umsatz.asset = {
        id: bestand.asset
      }
    }
    return umsatz;
  }

  private heute(): string {
    return new Date().toISOString().substring(0, 10)
  }
}
