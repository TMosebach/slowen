import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { BuchhaltungService } from 'src/app/service/buchhaltung.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Konto } from 'src/app/model/konto';
import { KontoUmsatz } from 'src/app/model/konto-umsatz';
import { Buchung } from 'src/app/model/buchung';
import { KontoArt } from 'src/app/model/konto-art.enum';

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
  selector: 'app-buchen',
  templateUrl: './buchen.component.html',
  styleUrls: ['./buchen.component.scss']
})
export class BuchenComponent implements OnInit {

  buchenForm = this.fb.group({
    empfaenger: ['', [Validators.maxLength(40)]],
    verwendung: ['', [Validators.maxLength(40)]],
    konto: [0, [Validators.required, Validators.minLength(1)]],
    gegenkonto: ['', [Validators.required]],
    habenbetrag: [''],
    sollbetrag: ['']
  }, { validators: withBetragValidator });

  konten: Konto[];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private buchhaltungService: BuchhaltungService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.buchhaltungService.findAlleKonten().subscribe({
      next: konten => {
        // Neutrales Element hinzufügen
        this.konten = konten;
        this.route.params.subscribe( (params: { kontoId: string}) => {
            const result = this.konten.filter( konto => konto.id === params.kontoId);
            this.getControl('konto').setValue(result[0].name);
        });
      }
    });
  }

  private getControl(name: string): AbstractControl {
    return this.buchenForm.controls[name];
  }

  onBuchen(): void {
    const buchung: Buchung = this.createBuchung();

    this.buchhaltungService.createBuchung(buchung)
    .subscribe({
      next: () => this.router.navigate(['buchhaltung']),
      error: (msg) => console.log('Fehler', msg)
    });
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

  onAbbrechen(): void {
    this.router.navigate(['buchhaltung']);
  }
}
