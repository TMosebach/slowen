import { Component, Input, OnInit } from '@angular/core';
import { Bestand } from '../../model/bestand';

@Component({
  selector: 'app-bestand-liste',
  templateUrl: './bestand-liste.component.html',
  styleUrls: ['./bestand-liste.component.scss']
})
export class BestandListeComponent implements OnInit {

  @Input() bestaende?: Bestand[];

  constructor() { }

  ngOnInit(): void {
  }

}
