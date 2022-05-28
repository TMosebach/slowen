import { Component, Input, OnInit } from '@angular/core';
import { Buchung } from '../../model/buchung';
import { BuchhungPage } from '../../model/buchung-page';
import { Konto } from '../../model/konto';
import { KontoRef } from '../../model/konto-ref';
import { Umsatz } from '../../model/umsatz';
import { BuchhaltungService } from '../../service/buchhaltung.service';

@Component({
  selector: 'app-umsatz-liste',
  templateUrl: './umsatz-liste.component.html',
  styleUrls: ['./umsatz-liste.component.scss']
})
export class UmsatzListeComponent implements OnInit {

  @Input() viewKonto!: Konto;

  buchungPage!: BuchhungPage;

  constructor(private buchhaltungService: BuchhaltungService) { }

  ngOnInit(): void {
    this.loadData(0);
  }

  private loadData(page: number) {
    this.buchhaltungService.getBuchungen4Konto(this.viewKonto.id, page)
      .subscribe( (page: BuchhungPage) => {
        this.buchungPage = page;
      });
  }

  buchungen(): Buchung[] {
    const buchungen = [ ...this.buchungPage._embedded.apiBuchungList];
    const reverse = buchungen.reverse();
    if (buchungen) {
      return reverse;
    }
    return [];
  }
  simpleBuchung(buchung: Buchung): boolean {
    return buchung.umsaetze?.length! <= 2;
  }

  refUmsatz(buchung: Buchung): Umsatz {
    return buchung.umsaetze?.find( umsatz => this.isViewKonto(umsatz.konto))!;
  }

  gegenUmsatz(buchung: Buchung): Umsatz {
    return buchung.umsaetze?.find( umsatz => ! this.isViewKonto(umsatz.konto))!;
  }

  isViewKonto(konto: KontoRef) {
    return konto.name === this.viewKonto!.name;
  }

  anzahlSeiten() {
    return this.buchungPage.page.totalPages - 1;
  }

  aktuelleSeite() {
    return this.buchungPage.page.number;
  }
  toFirst() {
    this.loadData(this.buchungPage.page.totalPages - 1);
  }

  toPrev() {
    this.loadData(Math.min(this.buchungPage.page.number + 1, this.buchungPage.page.totalPages - 1) );
  }

  toNext() {
    this.loadData(Math.max(this.buchungPage.page.number - 1, 0));
  }

  toLast() {
    this.loadData(0);
  }
}
