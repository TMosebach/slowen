import { Component, OnInit } from '@angular/core';
import { BuchhaltungService } from 'src/app/service/buchhaltung.service';
import { Page } from 'src/app/model/page';
import { Buchung } from 'src/app/model/buchung';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-konto-umsatz',
  templateUrl: './konto-umsatz.component.html',
  styleUrls: ['./konto-umsatz.component.scss']
})
export class KontoUmsatzComponent implements OnInit {

  buchungsSeite: Page<Buchung>;
  kontoId: string;
  page: string;

  constructor(
    private route: ActivatedRoute,
    private buchhaltungService: BuchhaltungService,
    private router: Router) { }

  ngOnInit(): void {
    this.route.params.subscribe({
      next: (params: { kontoId: string}) => {
        this.kontoId = params.kontoId;
        this.route.queryParams.subscribe({
          next: (query: { page: string }) => {
            if (query.page) {
              this.page = query.page;
            }
            this.buchhaltungService.findBuchungenByKonto(this.kontoId, this.page).subscribe({
              next: seite => this.buchungsSeite = seite,
              error: (err) => console.error(err)
             });
          }
        });
      }
    });
  }

  load(page: string): void {
    this.page = page;
    this.router.navigate(
      ['buchhaltung', 'umsatz', this.kontoId],
      {
        queryParams: { page }
      });
  }

  onBuchen(buchung: Buchung): void {
    this.buchhaltungService.createBuchung(buchung)
    .subscribe({
      next: () => window.location.reload(),
      error: (msg) => console.error('Fehler', msg)
    });
  }

  onAbbrechen(): void {
    this.router.navigate(['buchhaltung']);
  }
}
