import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BuchhaltungService } from '../../service/buchhaltung.service';
import { Konto } from '../../model/konto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-kontoliste',
  templateUrl: './kontoliste.component.html',
  styleUrls: ['./kontoliste.component.scss']
})
export class KontolisteComponent implements OnInit {

  konten: Observable<Konto[]>;

  constructor(
    private buchhaltungService: BuchhaltungService,
    private router: Router) { }

  ngOnInit(): void {
    this.konten = this.buchhaltungService.findAlleKonten();
  }

  onNew(): void {
    this.router.navigate(['stammdaten', 'konten', 'new']);
  }
}
