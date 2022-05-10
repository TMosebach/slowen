import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-buchen',
  templateUrl: './buchen.component.html',
  styleUrls: ['./buchen.component.scss']
})
export class BuchenComponent implements OnInit {

  formular = 'buchung';

  constructor() { }

  ngOnInit(): void {}

  setFormular(value: string) {
    this.formular = value;
  }
}
