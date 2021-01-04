import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-kauf-formular',
  templateUrl: './kauf-formular.component.html',
  styleUrls: ['./kauf-formular.component.scss']
})
export class KaufFormularComponent implements OnInit {

  kaufForm = this.fb.group({
    asset: [''],
    menge: [''],
    preis: ['']
  });

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }

}
