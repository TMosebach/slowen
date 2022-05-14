import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Konto } from '../../model/konto';
import { BuchhaltungService } from '../../service/buchhaltung.service';

@Component({
  selector: 'app-konto-liste',
  templateUrl: './konto-liste.component.html',
  styleUrls: ['./konto-liste.component.scss']
})
export class KontoListeComponent implements OnInit {

  konten$: Observable<Konto[]> | undefined;

  constructor(private buchhaltungsService: BuchhaltungService) { }

  ngOnInit(): void {
    this.konten$ = this.buchhaltungsService.getKonten();
  }

}
