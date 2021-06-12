import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { PageMetadata } from 'src/app/model/pageMetaData';
import { BuchhaltungService } from 'src/app/services/buchhaltung.service';
import { Buchung } from '../model/buchung';
import { Konto } from '../model/konto';
import { Umsatz } from '../model/umsatz';
import { Kontobuchung } from './kontobuchung';

const ITEMS_PER_PAGE = 15;

@Component({
  selector: 'app-konto-buchungen',
  templateUrl: './konto-buchungen.component.html',
  styleUrls: ['./konto-buchungen.component.scss']
})
export class KontoBuchungenComponent implements OnInit {

  konto: Konto;
  kontobuchungen: Kontobuchung[];
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
      this.kontobuchungen = buchungen2kontobuchungen(page.content, this.kontoId);
      this.page = page.page;
    });
  }
}



/**
 * Buchung-Array in eine Kontobuchung-Array für die Anzeige umbauen.
 *
 * Die Reihenfolge der Kontobuchungen ist modifiziert:
 * - Einmal invertiert im Vergleich zur Reihenfolge der Buchungen.
 *   => die jüngsten Umsätze stehen unten
 * - Innerhalb einer Buchung steht das Ursprungskonto aus der Auswahl
 *   ganz oben
 *
 * @param buchungen Ausgehendes Buchungs-Array
 * @param sourceKontoId Id der Ursprungskontos, um es zu identifizieren
 * @returns Array mit erzeugten Kontobuchungen
 */
function buchungen2kontobuchungen(buchungen: Buchung[], sourceKontoId: string): Kontobuchung[] {
  const kontobuchungen: Kontobuchung[] = [];
  buchungen.forEach( b =>
    buchung2kontobuchungen(b, sourceKontoId)
      .forEach( kb => kontobuchungen.unshift(kb) )
  );
  return kontobuchungen;
}

function buchung2kontobuchungen(buchung: Buchung, sourceKontoId: string): Kontobuchung[] {
  if (buchung.umsaetze.length > 2) {
    return komplexBuchung2kontobuchungen(buchung, sourceKontoId);
  } else {
    return simpleBuchung2kontobuchungen(buchung, sourceKontoId);
  }
}

function komplexBuchung2kontobuchungen(buchung: Buchung, sourceKontoId: string): Kontobuchung[] {

  const kontobuchungen: Kontobuchung[] = [];
  buchung.umsaetze.forEach( u => {
    const kontobuchung: Kontobuchung = {
      konto: u?.konto.name,
      valuta: new Date(u.valuta),
      ausgabe: u.betrag < 0 ? -u.betrag : undefined,
      einnahme: u.betrag > 0 ? u.betrag : undefined
    };


    if (u.konto.id === sourceKontoId) {
      // Umsatz zum selektierten Konto an erster Stelle mit Buchungsangaben
      kontobuchung.verwendung = buchung.verwendung;
      kontobuchung.empfaenger = buchung.empfaenger;

      kontobuchungen.unshift( kontobuchung );
    } else {
      kontobuchungen.push( kontobuchung );
    }
  });
  return kontobuchungen;
}

function simpleBuchung2kontobuchungen(buchung: Buchung, sourceKontoId: string): Kontobuchung[] {
  let sourceUmsatz;
  let destinationUmsatz;
  if (buchung.umsaetze[0].konto.id === sourceKontoId) {
    sourceUmsatz = buchung.umsaetze[0];
    destinationUmsatz = buchung.umsaetze[1];
  } else {
    sourceUmsatz = buchung.umsaetze[1];
    destinationUmsatz = buchung.umsaetze[0];
  }
  const konto =
    destinationUmsatz.konto.name
      ? destinationUmsatz.konto.name
      : '';
  return [{
    verwendung: buchung.verwendung,
    empfaenger: buchung.empfaenger,
    konto,
    valuta: new Date(sourceUmsatz.valuta),
    ausgabe: sourceUmsatz.betrag < 0 ? -sourceUmsatz.betrag : undefined,
    einnahme: sourceUmsatz.betrag > 0 ? sourceUmsatz.betrag : undefined
  }];
}
