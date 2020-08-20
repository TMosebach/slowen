import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, FormGroup } from '@angular/forms';
import { Konto } from 'src/app/model/konto';
import { BuchhaltungService } from 'src/app/service/buchhaltung.service';
import { Buchung } from 'src/app/model/buchung';

function withBetragValidator(group: FormGroup): any {
  if (group) {
    const habenbetrag = group.get(`habenbetrag`).value;
    const sollbetrag = group.get(`sollbetrag`).value;
    if (!habenbetrag && !sollbetrag) {
      return { betragFehlt : true };
    } else if (habenbetrag && sollbetrag) {
      return { mehrAlsEinBetrag : true };
    }
  }
  return null;
}

@Component({
  selector: 'app-simple-buchung-formular',
  templateUrl: './simple-buchung-formular.component.html',
  styleUrls: ['./simple-buchung-formular.component.scss']
})
export class SimpleBuchungFormularComponent implements OnInit {

  buchenForm = this.fb.group({
    empfaenger: ['', [Validators.maxLength(40)]],
    verwendung: ['', [Validators.maxLength(40)]],
    konto: [0, [Validators.required, Validators.minLength(1)]],
    gegenkonto: ['', [Validators.required]],
    habenbetrag: [''],
    sollbetrag: ['']
  }, { validators: withBetragValidator });

  @Input() konten: Konto[];

  @Input() kontoId: string;
  @Output() buchen = new EventEmitter();
  @Output() abbrechen = new EventEmitter();
  @Output() splitten = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private buchhaltungService: BuchhaltungService) { }

  ngOnInit(): void {
    this.buchhaltungService.findAlleKonten().subscribe({
      next: konten => {
        // Neutrales Element hinzufügen
        this.konten = konten;
        const result = this.konten.filter( konto => konto.id === this.kontoId);
        this.getControl('konto').setValue(result[0].name);
      }
    });
  }
  private getControl(name: string): AbstractControl {
    return this.buchenForm.controls[name];
  }

  onSplitten(): void {
    const buchung: Buchung = this.createBuchung();
    this.splitten.emit(buchung);
  }

  onAbbrechen(): void {
    this.abbrechen.emit();
  }

  onBuchen(): void {
    const buchung: Buchung = this.createBuchung();
    this.buchen.emit(buchung);
  }

  private createBuchung(): Buchung {
    const now = new Date();
    return {
      empfaenger: this.getControl('empfaenger').value,
      verwendung: this.getControl('verwendung').value,
      umsaetze: [
        {
          konto: {
            name: this.getControl('konto').value
          },
          valuta: now,
          betrag: this.getKontoBetrag()
        },
        {
          konto: {
            name: this.getControl('gegenkonto').value
          },
          valuta: now,
          betrag: -this.getKontoBetrag()
        }
      ]
    };
  }

  private getKontoBetrag(): number {
    const habenbetrag = this.getControl(`habenbetrag`).value;
    const sollbetrag = this.getControl(`sollbetrag`).value;
    if (sollbetrag) {
      return  Number.parseFloat(sollbetrag);
    } else {
      return -habenbetrag;
    }
  }
}
