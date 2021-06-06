import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { BuchhaltungService } from 'src/app/services/buchhaltung.service';
import { Buchung } from '../model/buchung';
import { Konto } from '../model/konto';

const betragSummeNullValidator: ValidatorFn = control => {
  let sum = 0.0;
  const buchungen = control.get('buchungen') as FormArray;

  buchungen.controls.forEach( ( buchung ) => {

    const auszahlungControl = buchung.get('ausgabe') as FormControl;
    const einzahlungControl = buchung.get('einnahme') as FormControl;
    if (auszahlungControl.value && auszahlungControl.value.length > 0) {
      sum -= Number.parseFloat(auszahlungControl.value);
    }
    if (einzahlungControl.value && einzahlungControl.value.length > 0) {
      sum += Number.parseFloat(einzahlungControl.value);
    }
  });
  return sum !== 0 ? { msg: 'Betragssumme ist unausgeglichen.' } : null;
};

const betragAngegebenValidator: ValidatorFn = control => {
  const buchungen = control.get('buchungen') as FormArray;

  let hasBetrag = false;
  buchungen.controls.forEach( ( buchung ) => {

    const auszahlungControl = buchung.get('ausgabe') as FormControl;
    const einzahlungControl = buchung.get('einnahme') as FormControl;
    if (auszahlungControl.value && auszahlungControl.value.length > 0) {
      hasBetrag = true;
    }
    if (einzahlungControl.value && einzahlungControl.value.length > 0) {
      hasBetrag = true;
    }
  });
  if (hasBetrag) {
    return null;
  }
  return { msg: 'Beträge fehlen.' };
};

const einOderAuszahlenValidator: ValidatorFn = control => {
  const auszahlungControl = control.get('ausgabe') as FormControl;
  const einzahlungControl = control.get('einnahme') as FormControl;
  const auszahlung = auszahlungControl.value;
  const einzahlung = einzahlungControl.value;

  if (einzahlung && einzahlung.length > 0
      && auszahlung && auszahlung.length > 0) {
        return {
          msg: 'Entweder nur Auszahlung oder Einzahlung möglich.'
        };
  }
  return null;
};

@Component({
  selector: 'app-buchen',
  templateUrl: './buchen.component.html',
  styleUrls: ['./buchen.component.scss']
})
export class BuchenComponent implements OnInit {

  buchungForm: FormGroup;
  konten: Konto[];

  constructor(
    private fb: FormBuilder,
    private buchhaltungService: BuchhaltungService,
    private router: Router) { }

  ngOnInit(): void {

    this.buchhaltungService.findKontorahmen().subscribe({
      next: konten => this.konten = konten,
      error: err => console.error(err)
    });

    this.buchungForm = this.fb.group({
      verwendung: [''],
      empfaenger: [''],
      buchungen: this.fb.array([])
    }, {
      validators: [
        betragSummeNullValidator,
        betragAngegebenValidator
      ]
    });
    this.addBuchung();
  }

  get buchungen(): FormArray {
    return this.buchungForm.get('buchungen') as FormArray;
  }

  removeBuchung(i: number): void {
    this.buchungen.removeAt(i);
  }

  addBuchung(): void {
    this.buchungen.push(
      this.fb.group({
        konto: [ '', Validators.required],
        valuta: [this.heute(), Validators.required],
        ausgabe: [],
        einnahme: []
    }, {
      validators: einOderAuszahlenValidator
    }));
  }

  private heute(): string {
    return new Date().toISOString().slice(0, 10);
  }

  onBuchen(): void {
    const value = this.buchungForm.value;
    const buchung: Buchung = {
      empfaenger: value.empfaenger,
      verwendung: value.verwendung,
      umsaetze: []
    };

    this.buchungen.controls.forEach( control => {

      const einzahlung = control.get('einnahme')?.value;
      const auszahlung = control.get('ausgabe')?.value;

      const betrag = (auszahlung ? -Number.parseFloat(auszahlung) : Number.parseFloat(einzahlung));
      const kontoId = control.get('konto')?.value.id;
      const valutaStr = '2021-06-04';

      buchung.umsaetze.push({
        betrag,
        konto: {
          id: kontoId
        },
        valuta: new Date(valutaStr).toISOString()
      });
    });

    this.buchhaltungService.buche(buchung).subscribe({
      next: a => {
        this.clearFormular();
        this.router.navigate(['buchhaltung', 'buchen']);
      },
      error: err => console.error(err)
    });
  }

  private clearFormular(): void {
    this.buchungForm.get('verwendung')?.setValue('');
    this.buchungForm.get('empfaenger')?.setValue('');

    this.buchungen.clear();
    this.addBuchung();
  }

  getFehler(errors: { msg: string }): string[] {
    const fehler: string[] = [];
    fehler.push(errors.msg);
    return fehler;
  }
}
