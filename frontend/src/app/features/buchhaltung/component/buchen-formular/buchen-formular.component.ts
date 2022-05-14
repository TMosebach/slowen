import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { filter, map, Observable } from 'rxjs';
import { Buchung } from '../../model/buchung';
import { BuchungArt } from '../../model/buchung-art';
import { Konto } from '../../model/konto';
import { BuchhaltungService } from '../../service/buchhaltung.service';

@Component({
  selector: 'app-buchen-formular',
  templateUrl: './buchen-formular.component.html',
  styleUrls: ['./buchen-formular.component.scss']
})
export class BuchenFormularComponent implements OnInit {

  @Output() mehrfachBuchung = new EventEmitter<void>();
  @Output() buchen = new EventEmitter<Buchung>();
  buchenForm: FormGroup;
  kontoauswahl$!: Observable<Konto[]>;
  gegenkontoauswahl$!: Observable<Konto[]>;

  constructor(
      private fb: FormBuilder,
      private activatedRoute: ActivatedRoute,
      private buchhaltungService: BuchhaltungService) {

    const id = this.activatedRoute.snapshot.params['id'];
    this.buchenForm = this.fb.group({
      konto: [id, Validators.required],
      beschreibung: [''],
      empfaenger: [''],
      gegenkonto: ['', Validators.required],
      valuta: [this.heute()],
      betrag: ['']
    });
    const konten$ = this.buchhaltungService.getKonten();

    if (id) {
      this.kontoauswahl$ = konten$.pipe( map( konten => konten.filter( konto => konto.id === id) ));
      this.gegenkontoauswahl$ = konten$.pipe( map( konten => konten.filter( konto => konto.id !== id) ));
    } else {
      this.kontoauswahl$ = konten$;
      this.gegenkontoauswahl$ = konten$;
    }
  }

  ngOnInit(): void {
  }

  private heute(): string {
    return new Date().toISOString().substring(0, 10)
  }

  speichern() {
    const formValue = this.buchenForm.value;
    const betrag = Number.parseFloat(formValue.betrag);
    const buchung: Buchung = {
      art: BuchungArt.Buchung,
      datum: this.heute(),
      beschreibung: formValue.beschreibung,
      empfaenger: formValue.empfaenger,
      umsaetze: [
        {
          konto: {
            id: formValue.konto
          },
          valuta: formValue.valuta,
          betrag: {
            betrag,
            waehrung: 'EUR'
          }
        },
        {
          konto: {
            id: formValue.gegenkonto
          },
          valuta: formValue.valuta,
          betrag: {
            betrag: -betrag,
            waehrung: 'EUR'
          }
        }
      ]
    };
    this.buchen.emit(buchung);
  }

  toMehrfachBuchung() {
    this.mehrfachBuchung.emit();
  }
}
