import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, mergeMap } from 'rxjs';
import { Konto } from '../../model/konto';
import { BuchhaltungService } from '../../service/buchhaltung.service';

@Component({
  selector: 'app-konto-details',
  templateUrl: './konto-details.component.html',
  styleUrls: ['./konto-details.component.scss']
})
export class KontoDetailsComponent implements OnInit {

  konto?: Konto;

  constructor(
    private route: ActivatedRoute,
    private buchhaltungService: BuchhaltungService) {
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map( params => params.get('id')),
      mergeMap( id => this.buchhaltungService.getKonto(id!) )
    ).subscribe( konto => {
      console.log(konto);
      this.konto = konto;
    });
  }

}
