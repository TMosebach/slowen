import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ObserveOnSubscriber } from 'rxjs/internal/operators/observeOn';
import { catchError } from 'rxjs/operators';
import { BuchhaltungService } from 'src/app/buchhaltung/buchhaltung.service';
import { Konto } from 'src/app/buchhaltung/model/konto';
@Component({
  selector: 'app-konto-details',
  templateUrl: './konto-details.component.html',
  styleUrls: ['./konto-details.component.scss']
})
export class KontoDetailsComponent implements OnInit {

  modus = 'Neu';
  errorMessage = '';

  kontoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private buchhaltungService: BuchhaltungService,
    private router: Router) { }

  ngOnInit(): void {
    this.kontoForm = this.fb.group({
      type: [ 'Konto', Validators.required ],
      art: [ 'Aufwand', Validators.required ],
      name: ['', [Validators.required, Validators.minLength(3)] ]
    });

    // Depots sind immer Aktiv-Konten
    this.getFormControl('type').valueChanges.subscribe( value => {
      if ('Depot' === value) {
        this.getFormControl('art').setValue('Aktiv');
      }
    });
  }

  private getFormControl(name: string): AbstractControl {
    return this.kontoForm.controls[name];
  }

  onZurueck(): void {
    this.router.navigate(['verwaltung', 'kontorahmen']);
  }

  onSave(): void {

    const eingabe = this.kontoForm.value;
    const konto: Konto = {
      type: eingabe.type,
      art: eingabe.art,
      name: eingabe.name
    };

    let createObservable: Observable<Konto>;
    if ('Konto' === eingabe.type) {
      createObservable = this.buchhaltungService.createKonto(konto);
    } else {
      createObservable = this.buchhaltungService.createDepot(konto);
    }

    createObservable
    .subscribe({
      next: k => {
        console.log('Erstellt: ', k);
        this.router.navigate(['verwaltung', 'kontorahmen']);
      },
      error: err => {
        console.log('Fehler: ', err);
        if (err.status === 412) {
          this.errorMessage = 'Kontoname ist schon vergeben.';
        } else {
          this.errorMessage = err.message;
        }
      }
    });
  }
}
