import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { map, mergeMap, Observable, of, tap } from 'rxjs';
import { Buchung } from '../../domain/buchung';
import { Konto } from '../../domain/konto';
import { BuchhaltungService } from '../../services/buchhaltung.service';

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
    private buchhaltungService: BuchhaltungService) { }

  ngOnInit(): void {
    this.konto$ = this.route.paramMap.pipe(
      map( (params: ParamMap) => params.get('id')! ),
      mergeMap( id => this.buchhaltungService.getKonto(id) ),
      tap( konto => this.buchungen$ = this.buchhaltungService.getBuchungen4Konto(konto.id) ),
      tap( konto => this.name$ = of(konto.name))
    );
  }
}
