import { Component, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BuchhaltungService } from '../../services/buchhaltung.service';
import { Konto } from '../../buchhaltung/model/konto';

@Component({
  selector: 'app-konto-liste',
  templateUrl: './konto-liste.component.html',
  styleUrls: ['./konto-liste.component.scss']
})
export class KontoListeComponent implements OnInit {

  editKonto = new EventEmitter();
  kontorahmen: Observable<Konto[]> | undefined;

  constructor(
    private buchhaltungService: BuchhaltungService,
    private router: Router) { }

  ngOnInit(): void {
    this.kontorahmen = this.buchhaltungService.findKontorahmen();
  }

  onEdit(id: string | undefined): void {
    this.router.navigate(['verwaltung', 'kontorahmen', id]);
  }
}
