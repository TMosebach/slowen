import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BuchhaltungService } from 'src/app/service/buchhaltung.service';
import { Observable } from 'rxjs';
import { Konto } from 'src/app/model/konto';
import { map } from 'rxjs/operators';
import { KontoTyp } from 'src/app/model/konto-typ.enum';

@Component({
  selector: 'app-bestandskonten',
  templateUrl: './bestandskonten.component.html',
  styleUrls: ['./bestandskonten.component.scss']
})
export class BestandskontenComponent implements OnInit {

  konten: Observable<Konto[]>;

  constructor(
    private buchhaltungService: BuchhaltungService,
    private router: Router) { }

    /**
     * Initialisieren der View.
     *
     * Dazu sind die Konten zu laden. Ihre Anzeige erfolgt in alphabetischer
     * aufsteigener Reihenfolge bezüglich des Kontonamens.
     */
  ngOnInit(): void {
    this.konten = this.buchhaltungService.findAlleKonten().pipe(
      map( (konten) => konten.sort( (a, b) => a.name.localeCompare(b.name)))
    );
  }

  onBuchen(konto: Konto): void {
    this.router.navigate(['buchhaltung', 'buchen', konto.id]);
  }

  isKonto(konto: Konto): boolean {
    return konto.type === KontoTyp.Konto;
  }

  isDepot(konto: Konto): boolean {
    return konto.type === KontoTyp.Depot;
  }
}
