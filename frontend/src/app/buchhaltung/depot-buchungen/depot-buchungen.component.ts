import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageMetadata } from 'src/app/model/pageMetaData';
import { BuchhaltungService } from 'src/app/services/buchhaltung.service';
import { Kontobuchung } from '../konto-buchungen/kontobuchung';
import { Buchung } from '../model/buchung';
import { Konto } from '../model/konto';
import { Umsatz } from '../model/umsatz';
import { DepotBuchung } from './depot-buchung';

const ITEMS_PER_PAGE = 15;

@Component({
  selector: 'app-depot-buchungen',
  templateUrl: './depot-buchungen.component.html',
  styleUrls: ['./depot-buchungen.component.scss']
})
export class DepotBuchungenComponent implements OnInit {
  konto: Konto;
  depotbuchungen: DepotBuchung[];
  page: PageMetadata;
  kontoId: string;

  constructor(
    private route: ActivatedRoute,
    private buchhaltungService: BuchhaltungService) { }

  ngOnInit(): void {
    this.page = {
      number: 0,
      size: ITEMS_PER_PAGE,
      totalElements: 0,
      totalPages: 0
    };

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (! id) {
        throw { msg: 'Das kann eigentlich nicht sein.'};
      }

      this.buchhaltungService.findKontoById(id)
      .subscribe( konto => {
        this.konto = konto;
      });

      this.kontoId = id;
      if (this.kontoId) {
        this.loadBuchungPage();
      }
    });
  }

  onFirst(): void {
    this.page.number = 0;
    this.loadBuchungPage();
  }

  isFirst(): boolean {
    return this.page.number === 0;
  }

  onPrev(): void {
    this.page.number = this.page.number - 1;
    this.loadBuchungPage();
  }

  onNext(): void {
    this.page.number = this.page.number + 1;
    this.loadBuchungPage();
  }

  isLast(): boolean {
    return this.page.number + 1 === this.page.totalPages;
  }

  onLast(): void {
    this.page.number = this.page.totalPages - 1;
  }

  private loadBuchungPage(): void {
    this.buchhaltungService.findKontobuchungen(this.kontoId, this.page.number, this.page.size).subscribe( page => {
      this.depotbuchungen = buchungen2depotbuchungen(page.content, this.kontoId);
      this.page = page.page;
    });
  }
}

function buchungen2depotbuchungen(buchungen: Buchung[], sourceKontoId: string): DepotBuchung[] {
  const depotbuchungen: DepotBuchung[] = [];
  buchungen.forEach( b =>
    depotbuchungen.unshift( buchung2depotbuchungen(b, sourceKontoId) )
  );
  return depotbuchungen;
}

function buchung2depotbuchungen(buchung: Buchung, sourceKontoId: string): DepotBuchung {
  const depotBuchung: DepotBuchung = {
    verwendung: buchung.verwendung ? buchung.verwendung : '',
    valuta: new Date(),
    betrag: 0
  };
  buchung.umsaetze.forEach( u => addUmsatzToDepotBuchung(u, depotBuchung, sourceKontoId));
  return depotBuchung;
}

function addUmsatzToDepotBuchung(u: Umsatz, depotBuchung: DepotBuchung, depotId: string): void {
  const refKonto = u.konto;
  if (refKonto.id === depotId) {
    depotBuchung.valuta = new Date(u.valuta);
    depotBuchung.menge = u.menge;
  } else if (refKonto.name === 'Ordergebühr') {
    depotBuchung.gebuehren = u.betrag;
  } else {
    // Verechnungskonto
    depotBuchung.betrag = u.betrag;
  }
}
