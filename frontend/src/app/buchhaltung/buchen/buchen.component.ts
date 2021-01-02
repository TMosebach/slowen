import { Component, OnInit } from '@angular/core';
import { BuchhaltungService } from 'src/app/service/buchhaltung.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Buchung } from 'src/app/model/buchung';

@Component({
  selector: 'app-buchen',
  templateUrl: './buchen.component.html',
  styleUrls: ['./buchen.component.scss']
})
export class BuchenComponent implements OnInit {

  kontoId: string;

  constructor(
    private route: ActivatedRoute,
    private buchhaltungService: BuchhaltungService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe( (params: { kontoId: string}) => {
        this.kontoId = params.kontoId;
    });
  }

  onBuchen(buchung: Buchung): void {
    this.buchhaltungService.createBuchung(buchung)
    .subscribe({
      next: () => this.router.navigate(['buchhaltung']),
      error: (msg) => console.error('Fehler', msg)
    });
  }

  onAbbrechen(): void {
    this.router.navigate(['buchhaltung']);
  }
}
