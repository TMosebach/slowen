import { Component, OnInit } from '@angular/core';
import { BuchhaltungService } from 'src/app/service/buchhaltung.service';
import { Page } from 'src/app/model/page';
import { Buchung } from 'src/app/model/buchung';
import { ActivatedRoute, Router } from '@angular/router';
import { KontoUmsatz } from 'src/app/model/konto-umsatz';

@Component({
  selector: 'app-konto-umsatz',
  templateUrl: './konto-umsatz.component.html',
  styleUrls: ['./konto-umsatz.component.scss']
})
export class KontoUmsatzComponent implements OnInit {

  buchungsSeite: Page<Buchung>;
  kontoId: string;
  page: string;

  constructor(
    private route: ActivatedRoute,
    private buchhaltungService: BuchhaltungService,
    private router: Router) { }

  ngOnInit(): void {
    this.route.params.subscribe({
      next: (params: { kontoId: string}) => {
        this.kontoId = params.kontoId;
        this.route.queryParams.subscribe({
          next: (query: { page: string }) => {
            console.log('Page', query.page);
            if (query.page) {
              this.page = query.page;
            }
            this.buchhaltungService.findBuchungenByKonto(this.kontoId, this.page).subscribe({
              next: seite => this.buchungsSeite = seite,
              error: (err) => console.log(err)
             });
          }
        });
      }
    });
  }

  pages(): number[] {
    const pages = [];
    if (this.buchungsSeite && this.buchungsSeite.totalPages) {
      let index = Math.min(9, this.buchungsSeite.totalPages - 1);
      while (index > 0) {
        pages.push(index);
        index--;
      }
    }
    return pages;
  }

  load(page: number): void {
    console.log('load', page);
    this.router.navigate(
      ['buchhaltung', 'umsatz', this.kontoId],
      {
        queryParams: { page }
      });
  }

  buchungen(): Buchung[] {
    if (this.buchungsSeite && this.buchungsSeite.content) {
      return this.buchungsSeite.content.reverse();
    } else {
      return [];
    }
  }

  reorderedUmsatz(umsaetze: KontoUmsatz[]): KontoUmsatz[] {
    if (umsaetze.length > 2) {
      const uebrige: KontoUmsatz[] = [];
      let aktuellesKonto: KontoUmsatz;
      umsaetze.forEach( u => {
        if (u.konto.id === this.kontoId) {
          aktuellesKonto = u;
        } else {
          uebrige.push(u);
        }
      });
      return [aktuellesKonto, ...uebrige];
    }
    const us = [ this.mapSimpleUmsatz(umsaetze) ];
    return us;
  }

  private mapSimpleUmsatz(umsaetze: KontoUmsatz[]): KontoUmsatz {
    let aktuellesKonto: KontoUmsatz;
    let gegenkonto: KontoUmsatz;
    if (umsaetze[0].konto.id === this.kontoId) {
      aktuellesKonto = umsaetze[0];
      gegenkonto = umsaetze[1];
    } else {
      gegenkonto = umsaetze[0];
      aktuellesKonto = umsaetze[1];
    }

    return {
      valuta: aktuellesKonto.valuta,
      konto: gegenkonto.konto ,
      betrag: aktuellesKonto.betrag
    };
  }
}