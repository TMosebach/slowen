import { Component, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BuchhaltungService } from '../../buchhaltung.service';
import { Konto } from '../../model/konto';

@Component({
  selector: 'app-konto-list',
  templateUrl: './konto-list.component.html',
  styleUrls: ['./konto-list.component.scss']
})
export class KontoListComponent implements OnInit {

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
