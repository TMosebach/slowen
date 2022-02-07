import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { map, Observable, switchMap, tap } from 'rxjs';
import { BuchhaltungService } from '../buchhaltung.service';
import { Buchung } from '../domain/buchung';
import { Konto } from '../domain/konto';

@Component({
  selector: 'app-kontodetails',
  templateUrl: './kontodetails.component.html',
  styleUrls: ['./kontodetails.component.scss']
})
export class KontodetailsComponent implements OnInit {

  konto$: Observable<Konto> | undefined;
  name$: Observable<string> | undefined;
  buchungen$: Observable<Buchung[]> | undefined;

  constructor(
    private route: ActivatedRoute,
    private service: BuchhaltungService) { }

  ngOnInit(): void {
    this.name$ = this.route.paramMap.pipe(
      map( (params: ParamMap) => params.get('name')! ),
      tap( kontoName => this.konto$ = this.service.getKonto(kontoName) ),
      tap( kontoName => this.buchungen$ = this.service.getBuchungen4Konto(kontoName) )
    );
  }
}
