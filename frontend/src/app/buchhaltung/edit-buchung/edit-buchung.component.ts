import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Buchung } from 'src/app/model/buchung';
import { Konto } from 'src/app/model/konto';
import { BuchhaltungService } from 'src/app/service/buchhaltung.service';

@Component({
  selector: 'app-edit-buchung',
  templateUrl: './edit-buchung.component.html',
  styleUrls: ['./edit-buchung.component.scss']
})
export class EditBuchungComponent implements OnInit {

  konten: Konto[];
  kontoId: string;
  buchung: Buchung;

  constructor(
    private route: ActivatedRoute,
    private buchhaltungService: BuchhaltungService,
    private router: Router) { }

  ngOnInit(): void {
    this.route.params.subscribe({
      next: (params: { kontoId: string, buchungId: string }) => {
        this.buchhaltungService.findAlleKonten().subscribe({
          next: konten => this.konten = konten,
          error: err => console.error(err)
        });
        this.buchhaltungService.findBuchungById(params.buchungId).subscribe({
          next: buchung => this.buchung = buchung,
          error: err => console.error(err)
        });
        this.kontoId = params.kontoId;
      }
    });
  }

  onBuchen(buchung: Buchung): void {
    this.buchhaltungService.updateBuchung(buchung)
    .subscribe({
      next: () => this.router.navigate(['buchhaltung', 'umsatz', this.kontoId]),
      error: (msg) => console.log('Fehler', msg)
    });
  }

  onAbbrechen(): void {
    this.router.navigate(['buchhaltung', 'umsatz', this.kontoId]);
  }
}
