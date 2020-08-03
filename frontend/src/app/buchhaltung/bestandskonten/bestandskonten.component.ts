import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BuchhaltungService } from 'src/app/service/buchhaltung.service';
import { Observable } from 'rxjs';
import { Konto } from 'src/app/model/konto';

@Component({
  selector: 'app-bestandskonten',
  templateUrl: './bestandskonten.component.html',
  styleUrls: ['./bestandskonten.component.scss']
})
export class BestandskontenComponent implements OnInit {

  konten: Observable<Konto[]>;

  constructor(
    private buchhaltungService: BuchhaltungService,
    private router: Router) { }

  ngOnInit(): void {
    this.konten = this.buchhaltungService.findAll();
  }

  onBuchen(konto: Konto): void {
    this.router.navigate(['buchhaltung', 'buchen', konto.id]);
  }
}
