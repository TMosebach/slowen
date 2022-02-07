import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { BuchhaltungService } from '../buchhaltung.service';
import { Konto } from '../domain/konto';

@Component({
  selector: 'app-kontouebersicht',
  templateUrl: './kontouebersicht.component.html',
  styleUrls: ['./kontouebersicht.component.scss']
})
export class KontouebersichtComponent implements OnInit {

  konten$: Observable<Konto[]> | undefined;

  constructor(private service: BuchhaltungService) { }

  ngOnInit(): void {
    this.konten$ = this.service.getKonten();
  }

}
