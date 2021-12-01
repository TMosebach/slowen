import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BuchhaltungService } from 'src/app/services/buchhaltung.service';
import { Konto } from '../model/konto';

@Component({
  selector: 'app-konto-liste',
  templateUrl: './konto-liste.component.html',
  styleUrls: ['./konto-liste.component.scss']
})
export class KontoListeComponent implements OnInit {

  konten: Observable<Konto[]> | undefined;

  constructor(
    private buchhaltungService: BuchhaltungService,
    private router: Router) { }

  ngOnInit(): void {
    this.konten = this.buchhaltungService.findKontorahmen();
  }
}
