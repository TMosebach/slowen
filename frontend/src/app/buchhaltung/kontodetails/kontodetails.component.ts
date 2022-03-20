import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { flatMap, map, mergeMap, Observable, of, switchMap, tap } from 'rxjs';
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
    this.konto$ = this.route.paramMap.pipe(
      map( (params: ParamMap) => params.get('id')! ),
      mergeMap( id => this.service.getKonto(id) ),
      tap( konto => this.buchungen$ = this.service.getBuchungen4Konto(konto.id) ),
      tap( konto => this.name$ = of(konto.name))
    );
  }
}
