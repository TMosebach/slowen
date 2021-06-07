import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { BuchhaltungService } from 'src/app/services/buchhaltung.service';
import { Buchung } from '../model/buchung';
import { Umsatz } from '../model/umsatz';
import { Kontobuchung } from './kontobuchung';

@Component({
  selector: 'app-konto-buchungen',
  templateUrl: './konto-buchungen.component.html',
  styleUrls: ['./konto-buchungen.component.scss']
})
export class KontoBuchungenComponent implements OnInit {

  kontobuchungen: Kontobuchung[];

  constructor(
    private route: ActivatedRoute,
    private buchhaltungService: BuchhaltungService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const kontoId = params.get('id');
      if (kontoId) {
        this.buchhaltungService.findKontobuchungen(kontoId).subscribe( page => {
          this.kontobuchungen = buchungen2kontobuchungen(page.content, kontoId);
        });
      }
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
