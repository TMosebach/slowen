import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BuchhaltungService } from '../../buchhaltung.service';
import { Konto } from '../../domain/konto';

@Component({
  selector: 'app-buchen-formular',
  templateUrl: './buchen-formular.component.html',
  styleUrls: ['./buchen-formular.component.scss']
})
export class BuchenFormularComponent implements OnInit {

  buchenForm: FormGroup | undefined;
  konten: Konto[] | undefined;
  kontoNamen: string[] | undefined;
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
    this.service.getKonten().subscribe({
      next: konten => this.kontoNamen = konten.map( k => k.name ),
      error: err => console.error('Fehler: ', err)
    });

    this.buchenForm = this.fb.group({
      datum: [ this.heute() ],
      empfaenger: [''],
      beschreibung: [''],
      umsaetze: this.fb.array([])
    });

    this.addUmsatz();
  }

  get umsaetze(): FormArray {
    return this.buchenForm!.get('umsaetze') as FormArray;
  }

  addUmsatz(): void {
    this.umsaetze.push(
      this.fb.group({
        konto: [ '', Validators.required],
        valuta: [this.heute(), Validators.required],
        betrag: ['', Validators.required],
        waehrung: ['EUR', Validators.required]
    }));
  }

  asFromGroup(umsatz: AbstractControl): FormGroup {
    return umsatz as FormGroup;
  }

  removeUmsatz(i: number): void {
    this.umsaetze.removeAt(i);
  }

  private heute(): string {
    return new Date().toISOString().slice(0, 10);
  }

  doBuche(): void {
    
    const buchung = this.buchenForm?.value;
    const umsaetze = buchung.umsaetze;
    buchung.art = 'Buchung';
    buchung.umsaetze = [];
    umsaetze.forEach( (u: any) => {
      buchung.umsaetze.push({
        konto: u.konto,
        valuta: u.valuta,
        betrag: {
          betrag: u.betrag,
          waehrung: u.waehrung
        }
      });
    });
  }

  private clearFormular(): void {
    this.buchenForm!.get('beschreibung')?.setValue('');
    this.buchenForm!.get('empfaenger')?.setValue('');

    this.umsaetze.clear();
    this.addUmsatz();
  }
}
