import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-konto-liste',
  templateUrl: './konto-liste.component.html',
  styleUrls: ['./konto-liste.component.scss']
})
export class KontoListeComponent implements OnInit {

  @Input() kontoDetailUrl = '';

  constructor() { }

  ngOnInit(): void {
  }

}
