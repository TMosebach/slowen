import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BuchhaltungService } from '../../services/buchhaltung.service';
import { transformToBuchung } from './to-buchung-conversion';

@Component({
  selector: 'app-handel-formular',
  templateUrl: './handel-formular.component.html',
  styleUrls: ['./handel-formular.component.scss']
})
export class HandelFormularComponent implements OnInit {

  /**
   * Eines der Werte: Kauf, Verkauf, Einnahme, Einlieferung oder Auslieferung
   */
  vorgang = 'Kauf';
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
    this.assetNames = [
      'Deutsche Telekom AG',
      'Deutsche Börse AG',
      'Commerzbank AG'
    ];

    this.service.getKonten().subscribe({
      next: konten => {
        this.kontoNamen = konten.map( k => k.name );
        this.depotNamen = this.kontoNamen;
      },
      error: err => console.error('Fehler: ', err)
    });

    this.buchenForm = this.fb.group({
      art: [ 'Kauf', Validators.required ],
      datum: [ this.heute() ],
      asset: ['', Validators.required],
      depot: ['', Validators.required],
      menge: ['', Validators.required],
      einheit: ['St.', Validators.required],
      preis: ['', Validators.required],
      waehrung: ['EUR', Validators.required],
      verrechnungskonto: ['', Validators.required],
      valuta: [ this.heute() ],
      provision: [''],
      maklercourtage: [''],
      boersenplatzentgeld: [''],
      spesen: [''],
      sonstigeKosten: [''],
      kapitalertragssteuer: [''],
      solidaritaetszuschlag: ['']
    });
  }

  setVorgang(vorgang: string): void {
    this.vorgang = vorgang;
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
