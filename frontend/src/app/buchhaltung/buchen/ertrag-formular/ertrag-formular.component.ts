import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BuchhaltungService } from '../../buchhaltung.service';
import { Buchung } from '../../domain/buchung';
import { Umsatz } from '../../domain/umsatz';
import { ErtragFormular } from './ertrag-formular';

@Component({
  selector: 'app-ertrag-formular',
  templateUrl: './ertrag-formular.component.html',
  styleUrls: ['./ertrag-formular.component.scss']
})
export class ErtragFormularComponent implements OnInit {

  buchenForm: FormGroup | undefined;
  assetNames: string[] | undefined;
  kontoNamen: string[] | undefined;
  depotNamen: string[] | undefined;
  waehrungen = [
    'EUR',
    'GBP',
    'TRY',
    'USD',
    'JPY'
  ];

  constructor(
    private fb: FormBuilder,
    private service: BuchhaltungService) { }

  ngOnInit(): void {
    this.buchenForm = this.fb.group({
      datum: [ this.heute() ],
      depot: ['', Validators.required],
      asset: ['', Validators.required],
      ertragsart: ['Dividende', Validators.required],
      ertrag: ['', Validators.required],
      waehrung: ['EUR', Validators.required],
      verrechnungskonto: ['', Validators.required],
      valuta: [ this.heute() ],
      kapitalertragssteuer: [''],
      solidaritaetszuschlag: ['']
    });
  }

  private heute(): string {
    return new Date().toISOString().slice(0, 10);
  }

  doBuche() {
    let buchung = transformToBuchung(this.buchenForm?.value);
    this.service.buche(buchung).subscribe( 
      () => this.clearFormular()
    );
  }

  private clearFormular(): void {
    this.buchenForm!.reset();
  }
}

function transformToBuchung(formular: ErtragFormular): Buchung {
  const ertrag = Number.parseFloat(formular.ertrag);
  const kapitalertragssteuer = formular.kapitalertragssteuer?Number.parseFloat(formular.kapitalertragssteuer):0;
  const solidaritaetszuschlag = formular.solidaritaetszuschlag?Number.parseFloat(formular.solidaritaetszuschlag):0;
  const summe = ertrag-kapitalertragssteuer-solidaritaetszuschlag;

  const buchung: Buchung  = {
    art: 'Ertrag',
    datum: formular.datum,
    beschreibung: `${formular.ertragsart} ${formular.asset}`,
    umsaetze: [
      {
        konto: {
          name: formular.depot
        },
        valuta: formular.valuta,
        betrag: {
          betrag: 0.0, 
          waehrung: formular.waehrung
        },
        asset: {
          name: formular.asset
        },
        menge: {
          menge: 0.0, 
          einheit: 'St.'
        }
      }
    ]
  };
  buchung.umsaetze?.push( createUmsatz(formular.ertragsart, -ertrag, formular) );
  buchung.umsaetze?.push( createUmsatz(formular.verrechnungskonto, summe, formular) );

  if (kapitalertragssteuer) {
    buchung.umsaetze?.push( createUmsatz('Kapitalertragssteuer', kapitalertragssteuer, formular) );
  }

  if (solidaritaetszuschlag) {
    buchung.umsaetze?.push( createUmsatz('Solidaritätszuschlag', solidaritaetszuschlag, formular) );
  }
  return buchung;
}

function createUmsatz(kontoName: string, betrag: number, formular: ErtragFormular): Umsatz {
  return {
    konto: {
      name: kontoName
    },
    valuta: formular.valuta,
    betrag: {
      betrag,
      waehrung: formular.waehrung
    }
  }
}
