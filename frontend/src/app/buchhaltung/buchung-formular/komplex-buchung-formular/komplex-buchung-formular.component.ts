import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators, FormArray, FormGroup, AbstractControl } from '@angular/forms';
import { Konto } from 'src/app/model/konto';
import { Buchung } from 'src/app/model/buchung';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { KontoUmsatz } from 'src/app/model/konto-umsatz';
import { stringify } from '@angular/compiler/src/util';
import { defaultThrottleConfig } from 'rxjs/internal/operators/throttle';

function isString(x: string | object): x is string {
  return typeof x === 'string';
}

@Component({
  selector: 'app-komplex-buchung-formular',
  templateUrl: './komplex-buchung-formular.component.html',
  styleUrls: ['./komplex-buchung-formular.component.scss']
})
export class KomplexBuchungFormularComponent implements OnInit {

  @Input() konten: Konto[];
  @Output() buchen = new EventEmitter();
  @Output() abbrechen = new EventEmitter();
  buchungId: string;

  buchenForm = this.fb.group({
    empfaenger: ['', [Validators.maxLength(40)]],
    verwendung: ['', [Validators.maxLength(40)]],
    umsaetze: this.fb.array([])
  });

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }

  @Input()
  set buchung(buchung: Buchung) {
    if (buchung) {
      this.buchungId = buchung.id;
      this.getControl('empfaenger').setValue(buchung.empfaenger);
      this.getControl('verwendung').setValue(buchung.verwendung);

      buchung.umsaetze.forEach(umsatz => this.umsaetze.push(this.createUmsatzGroup(umsatz)));
    }
  }

  private createUmsatzGroup(umsatz: KontoUmsatz): FormGroup {
    const betrag = umsatz.betrag;
    const valuta = umsatz.valuta;
    return this.fb.group( {
        konto: [ umsatz.konto.name, Validators.required],
        valuta: [ isString(valuta) ? valuta : valuta.toISOString().slice(0, 10), Validators.required],
        auszahlung: [betrag && betrag < 0 ? -betrag : ''],
        einzahlung: [betrag && betrag >= 0 ? betrag : '']
      });
  }

  private getControl(name: string): AbstractControl {
    return this.buchenForm.controls[name];
  }

  get umsaetze(): FormArray {
    return this.buchenForm.get('umsaetze') as FormArray;
  }

  createUmsatz( kontoName?: string): FormGroup {
    return this.fb.group( {
      konto: [ kontoName ? kontoName : '', Validators.required],
      valuta: [new Date().toISOString().slice(0, 10), Validators.required],
      auszahlung: [''],
      einzahlung: ['']
    });
  }

  addUmsatz(): void {
    this.umsaetze.push(this.createUmsatz());
  }

  removeUmsatz(i: number): void {
    this.umsaetze.removeAt(i);
  }

  onAbbrechen(): void {
    this.abbrechen.emit();
  }

  onBuchen(): void {
    const buchung: Buchung = this.createBuchung();
    buchung.id = this.buchungId;
    this.buchen.emit(buchung);
  }

  private createBuchung(): Buchung {
    const buchung = {
      empfaenger: this.getControl('empfaenger').value,
      verwendung: this.getControl('verwendung').value,
      umsaetze: []
    };

    const formArray = this.buchenForm.controls[`umsaetze`] as FormArray;
    formArray.controls.forEach( (formGroup: FormGroup) => {
      buchung.umsaetze.push(
        {
          konto: {
            name: formGroup.controls[`konto`].value
          },
          valuta: formGroup.controls[`valuta`].value,
          betrag: this.getKontoBetrag(formGroup)
        }
      );
    });

    return buchung;
  }

  private getKontoBetrag(formGroup: FormGroup): number {
    const habenbetrag = formGroup.controls[`auszahlung`].value;
    const sollbetrag = formGroup.controls[`einzahlung`].value;
    if (sollbetrag) {
      return  Number.parseFloat(sollbetrag);
    } else {
      return -habenbetrag;
    }
  }
}
