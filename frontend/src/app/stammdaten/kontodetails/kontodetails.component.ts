import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { KontoArt } from 'src/app/model/konto-art.enum';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { BuchhaltungService } from 'src/app/service/buchhaltung.service';
import { Konto } from 'src/app/model/konto';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-kontodetails',
  templateUrl: './kontodetails.component.html',
  styleUrls: ['./kontodetails.component.scss']
})
export class KontodetailsComponent implements OnInit {
  keys = Object.keys;
  kontoarten = KontoArt;
  konten: Konto[];

  kontoForm = this.fb.group({
    type: ['Konto', [Validators.required]],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    art: [KontoArt.Aufwand, [Validators.required]],
    verrechnungskonto: ['']
  });

  constructor(
    private fb: FormBuilder,
    private buchhaltungService: BuchhaltungService,
    private router: Router) { }

  ngOnInit(): void {
    this.buchhaltungService.findAlleKonten()
    .pipe( map( (konten) => konten.sort( (a, b) => a.name.localeCompare(b.name))))
    .subscribe({
      next: konten => this.konten = konten
    });
  }

  onAbbrechen(): void {
    this.router.navigate(['stammdaten', 'konten']);
  }

  onSpeichern(): void {
    this.buchhaltungService.createKonto(this.kontoForm.value)
    .subscribe({
      next: () => this.router.navigate(['stammdaten', 'konten']),
      error: (msg) => console.log('Fehler', msg)
    });
  }
}
