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
  selector: 'app-kauf-formular',
  templateUrl: './kauf-formular.component.html',
  styleUrls: ['./kauf-formular.component.scss']
})
export class KaufFormularComponent implements OnInit {

  @Output() kauf = new EventEmitter<Buchung>();

  kaufForm: FormGroup;

  assetauswahl$: Observable<AssetRef[]>;
  depotauswahl$: Observable<Konto[]>;
  kontoauswahl$: Observable<Konto[]>;

  constructor(
      private fb: FormBuilder,
      private activatedRoute: ActivatedRoute,
      private buchhaltungService: BuchhaltungService
  ) {
    const id = this.activatedRoute.snapshot.params['id'];
    this.kaufForm = this.fb.group({
      datum: [this.heute()],
      depot: [id, Validators.required],
      asset: ['', Validators.required],
      verrechnungskonto: ['', Validators.required],
      valuta: [this.heute()],
      menge: [''],
      betrag: [''],
      gebuehren: ['']
    });
    this.assetauswahl$ = this.buchhaltungService.getAssets();
    // TODO Sobald der Kontotyp bekannt ist, filtern:
    this.depotauswahl$ = this.buchhaltungService.getKonten();
    this.kontoauswahl$ = this.depotauswahl$;
  }

  ngOnInit(): void {
  }

  speichern() {
    const buchung = this.createBuchung(this.kaufForm.value);
    this.kauf.emit(buchung);
  }

  createBuchung( formValue:any  ) {

    const betrag = +formValue.betrag;
    const gebuehr = +formValue.gebuehren;
    const menge = +formValue.menge;

    const buchung: Buchung = {
      art: BuchungArt.Kauf,
      datum: this.heute(),
      beschreibung: 'Kauf ' + menge + ' ' + formValue.asset.name,
      umsaetze: [
        this.createUmsatz( { id: formValue.depot }, formValue.valuta, betrag-gebuehr, { asset: formValue.asset, menge: menge }),
        this.createUmsatz( { name: 'Handelsgebühr' }, formValue.valuta, gebuehr),
        this.createUmsatz( { id: formValue.verrechnungskonto } , formValue.valuta, -betrag)
      ]
    };
    console.log(buchung);
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
      umsatz.asset = bestand.asset;
    }
    return umsatz;
  }

  private heute(): string {
    return new Date().toISOString().substring(0, 10)
  }
}
