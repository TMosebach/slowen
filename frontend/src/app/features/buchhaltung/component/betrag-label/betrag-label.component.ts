import { Component, Input, OnInit } from '@angular/core';
import { Betrag } from '../../model/betrag';

@Component({
  selector: 'app-betrag-label',
  templateUrl: './betrag-label.component.html',
  styleUrls: ['./betrag-label.component.scss']
})
export class BetragLabelComponent implements OnInit {

  @Input() betrag: Betrag | undefined;

  constructor() { }

  ngOnInit(): void {
  }

}
