import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Buchung } from '../../domain/buchung';
import { Konto } from '../../domain/konto';
import { KontoRef } from '../../domain/konto-ref';
import { Umsatz } from '../../domain/umsatz';
import { KontodetailsComponent } from '../kontodetails.component';

@Component({
  selector: 'app-buchung-liste',
  templateUrl: './buchung-liste.component.html',
  styleUrls: ['./buchung-liste.component.scss']
})
export class BuchungListeComponent implements OnInit {

  @Input() buchungen$: Observable<Buchung[]> | undefined;
  @Input() viewKonto: Konto | undefined;

  constructor() { }

  ngOnInit(): void {
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
}
