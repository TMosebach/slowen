import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Konto } from '../../model/konto';
import { BuchhaltungService } from '../../service/buchhaltung.service';

@Component({
  selector: 'app-konto-neu',
  templateUrl: './konto-neu.component.html',
  styleUrls: ['./konto-neu.component.scss']
})
export class KontoNeuComponent implements OnInit {

  constructor(
    private service: BuchhaltungService,
    private router: Router) { }

  ngOnInit(): void {
  }

  speichern(konto: Konto) {
    this.service.createKonto(konto).subscribe({
      next: () => this.router.navigateByUrl('buchhaltung'),
      error: (err) => console.error(err)
    });
  }
}
