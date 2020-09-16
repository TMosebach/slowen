import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Buchung } from 'src/app/model/buchung';
import { BuchhaltungService } from 'src/app/service/buchhaltung.service';
import { Konto } from 'src/app/model/konto';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-buchung-formular',
  templateUrl: './buchung-formular.component.html',
  styleUrls: ['./buchung-formular.component.scss']
})
export class BuchungFormularComponent implements OnInit {

  @Input() kontoId: string;
  @Output() buchen = new EventEmitter();
  @Output() abbrechen = new EventEmitter();

  buchung: Buchung;
  splittView = false;
  konten: Konto[];

  constructor(private buchhaltungService: BuchhaltungService) { }

  /**
   * Basisinitialisierung aller Buchungsformulare.
   *
   * Die bekannten Konten werden in alphabetischer Reihenfolge sortiert.
   */
  ngOnInit(): void {
    this.buchhaltungService.findAlleKonten()
    .pipe( map( (konten) => konten.sort( (a, b) => a.name.localeCompare(b.name))))
    .subscribe({
      next: konten => this.konten = konten
    });
  }

  onBuchen(buchung: Buchung): void {
    this.buchen.emit(buchung);
  }

  onAbbrechen(): void {
    this.abbrechen.emit();
  }

  /**
   * Komplexes Formular aktivieren
   */
  onSplitt(buchung: Buchung): void {
    this.buchung = buchung;
    this.splittView = true;
  }
}
