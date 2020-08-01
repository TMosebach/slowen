import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { KontoService } from '../../service/konto.service';
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
    private kontoService: KontoService,
    private router: Router) { }

  ngOnInit(): void {
    this.konten = this.kontoService.findAll();
  }

  onNew(): void {
    console.log('new Konto');
    this.router.navigate(['stammdaten', 'konten', 'new']);
  }

}
