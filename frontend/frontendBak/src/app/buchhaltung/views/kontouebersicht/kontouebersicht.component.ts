import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Konto } from '../../domain/konto';
import { BuchhaltungService } from '../../services/buchhaltung.service';

@Component({
  selector: 'app-kontouebersicht',
  templateUrl: './kontouebersicht.component.html',
  styleUrls: ['./kontouebersicht.component.scss']
})
export class KontouebersichtComponent implements OnInit {

  konten$: Observable<Konto[]> | undefined;

  constructor(private buchhaltungsService: BuchhaltungService) { }

  ngOnInit(): void {
    this.konten$ = this.buchhaltungsService.getKonten();
  }

}
