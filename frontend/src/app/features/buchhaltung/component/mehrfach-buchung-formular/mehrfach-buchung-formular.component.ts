import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Buchung } from '../../model/buchung';
import { Konto } from '../../model/konto';
import { BuchhaltungService } from '../../service/buchhaltung.service';

@Component({
  selector: 'app-mehrfach-buchung-formular',
  templateUrl: './mehrfach-buchung-formular.component.html',
  styleUrls: ['./mehrfach-buchung-formular.component.scss']
})
export class MehrfachBuchungFormularComponent implements OnInit {
  
  buchenForm: FormGroup;
  konten$: Observable<Konto[]>;
  @Output() buchen = new EventEmitter<Buchung>();

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private service: BuchhaltungService) {

      this.konten$ = this.service.getKonten();
      const id = this.activatedRoute.snapshot.params['id'];
      this.buchenForm = this.fb.group({
        datum: [ this.heute() ],
        empfaenger: [''],
        beschreibung: [''],
        umsaetze: this.fb.array([])
      });
      this.addUmsatz(id);
  }

  ngOnInit(): void { }

  get umsaetze(): FormArray {
    return this.buchenForm!.get('umsaetze') as FormArray;
  }

  addUmsatz(id?: string): void {
    const kontoValue = id?id:'';
    this.umsaetze.push(
      this.fb.group({
        konto: [ kontoValue, Validators.required],
        valuta: [this.heute(), Validators.required],
        betrag: ['', Validators.required]
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
        konto: {
          id: u.konto,
        },
        valuta: u.valuta,
        betrag: {
          betrag: Number.parseFloat(u.betrag),
          waehrung: 'EUR'
        }
      });
    });
    this.buchen.emit(buchung);
  }

  /**
   * Zurücksetzen des Formulars
   */
  public clearFormular(): void {
    this.buchenForm!.get('beschreibung')?.setValue('');
    this.buchenForm!.get('empfaenger')?.setValue('');

    this.umsaetze.clear();
    this.addUmsatz();
  }
}
