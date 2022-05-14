import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Konto } from '../../model/konto';

@Component({
  selector: 'app-konto-formular',
  templateUrl: './konto-formular.component.html',
  styleUrls: ['./konto-formular.component.scss']
})
export class KontoFormularComponent implements OnInit {

  @Output() konto = new EventEmitter<Konto>();

  kontoForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.kontoForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)] ]
    });
  }

  ngOnInit(): void {
  }

  speichern() {
    this.konto.emit(this.kontoForm.value);
  }
}
