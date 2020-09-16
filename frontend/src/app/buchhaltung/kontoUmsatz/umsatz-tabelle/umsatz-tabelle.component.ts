import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Buchung } from 'src/app/model/buchung';
import { KontoUmsatz } from 'src/app/model/konto-umsatz';
import { Page } from 'src/app/model/page';

@Component({
  selector: 'app-umsatz-tabelle',
  templateUrl: './umsatz-tabelle.component.html',
  styleUrls: ['./umsatz-tabelle.component.scss']
})
export class UmsatzTabelleComponent implements OnInit {

  @Input() buchungsSeite: Page<Buchung>;
  @Input() kontoId: string;
  @Output() loadNewPage = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
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
    this.loadNewPage.emit(page);
  }
}
