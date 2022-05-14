import { Component, Input, OnInit } from '@angular/core';
import { Buchung } from '../../model/buchung';
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

  page = 0;
  size = 20;
  buchungen: Buchung[] = [];

  constructor(private buchhaltungService: BuchhaltungService) { }

  ngOnInit(): void {
    this.buchhaltungService.getBuchungen4Konto(this.viewKonto.id)
      .subscribe( (page: any) => {
        console.log('gelesen: ', page);
        this.buchungen = page._embedded.apiBuchungList;
      });
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
