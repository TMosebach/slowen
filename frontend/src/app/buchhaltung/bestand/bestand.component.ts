import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BuchhaltungService } from 'src/app/service/buchhaltung.service';

import { Depot } from '../../model/depot';

@Component({
  selector: 'app-bestand',
  templateUrl: './bestand.component.html',
  styleUrls: ['./bestand.component.scss']
})
export class BestandComponent implements OnInit {

  depot: Depot;

  constructor(
    private route: ActivatedRoute,
    private buchhaltungService: BuchhaltungService) { }

  ngOnInit(): void {
    this.route.params.subscribe({
      next: (params: { kontoId: string}) => {
        const kontoId = params.kontoId;
        this.buchhaltungService.findDepotById(kontoId).subscribe({
          next: depot => this.depot = depot,
          error: (err) => console.log(err)
          });
      }
    });
  }
}
