import { Component, OnInit } from '@angular/core';
import { BuchhaltungService } from 'src/app/service/buchhaltung.service';
import { Page } from 'src/app/model/page';
import { Buchung } from 'src/app/model/buchung';
import { ActivatedRoute, Router } from '@angular/router';
import { KontoUmsatz } from 'src/app/model/konto-umsatz';

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
            console.log('Page', query.page);
            if (query.page) {
              this.page = query.page;
            }
            this.buchhaltungService.findBuchungenByKonto(this.kontoId, this.page).subscribe({
              next: seite => this.buchungsSeite = seite,
              error: (err) => console.log(err)
             });
          }
        });
      }
    });
  }

  load(page: number): void {
    console.log('load', page);
    this.router.navigate(
      ['buchhaltung', 'umsatz', this.kontoId],
      {
        queryParams: { page }
      });
  }
}
