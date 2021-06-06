import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { BuchhaltungService } from 'src/app/services/buchhaltung.service';
import { Buchung } from '../model/buchung';
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
          this.kontobuchungen = this.buchungen2kontobuchungen(page.content);
        });
      }
    });
  }

  private buchungen2kontobuchungen(buchungen: Buchung[]): Kontobuchung[] {
    const kontobuchungen: Kontobuchung[] = [];
    buchungen.forEach( b =>
      this.buchung2kontobuchungen(b)
        .forEach( kb => kontobuchungen.push(kb) )
    );
    return kontobuchungen;
  }

  private buchung2kontobuchungen(buchung: Buchung): Kontobuchung[] {
    if (buchung.umsaetze.length > 2) {
      return komplexBuchung2kontobuchungen(buchung);
    } else {
      return simpleBuchung2kontobuchungen(buchung);
    }
  }
}
function komplexBuchung2kontobuchungen(buchung: Buchung): Kontobuchung[] {
  return [{
    verwendung: buchung.verwendung,
    empfaenger: buchung.empfaenger,
    konto: '',
    valuta: ''
  }];
}

function simpleBuchung2kontobuchungen(buchung: Buchung): Kontobuchung[] {
  return [{
    verwendung: buchung.verwendung,
    empfaenger: buchung.empfaenger,
    konto: '',
    valuta: ''
  }];
}

