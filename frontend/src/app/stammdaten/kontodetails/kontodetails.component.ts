import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { KontoArt } from 'src/app/model/konto-art.enum';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { KontoService } from 'src/app/service/konto.service';

@Component({
  selector: 'app-kontodetails',
  templateUrl: './kontodetails.component.html',
  styleUrls: ['./kontodetails.component.scss']
})
export class KontodetailsComponent implements OnInit {
  keys = Object.keys;
  kontoarten = KontoArt;

  kontoForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    art: [KontoArt.Aufwand, [Validators.required]]
  });

  constructor(
    private fb: FormBuilder,
    private kontoService: KontoService,
    private router: Router) { }

  ngOnInit(): void {
  }

  onAbbrechen(): void {
    console.log('Abbrechen');
    this.router.navigate(['stammdaten', 'konten']);
  }

  onSpeichern(): void {
    console.log('Speichern');
    this.kontoService.createKonto(this.kontoForm.value)
    .subscribe({
      next: (konto) => this.router.navigate(['stammdaten', 'konten']),
      error: (msg) => console.log('Fehler', msg)
    });
  }
}
