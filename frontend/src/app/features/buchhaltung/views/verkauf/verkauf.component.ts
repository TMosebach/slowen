import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Buchung } from '../../model/buchung';
import { BuchhaltungService } from '../../service/buchhaltung.service';

@Component({
  selector: 'app-verkauf',
  templateUrl: './verkauf.component.html',
  styleUrls: ['./verkauf.component.scss']
})
export class VerkaufComponent implements OnInit {

  constructor(
    private service: BuchhaltungService,
    private router: Router) { }

  ngOnInit(): void {
  }

  buchen(buchung: Buchung) {
    this.service.buche(buchung).subscribe({
      next: () => this.router.navigateByUrl('buchhaltung'),
      error: (err) => console.error(err)
    });
  }
}
