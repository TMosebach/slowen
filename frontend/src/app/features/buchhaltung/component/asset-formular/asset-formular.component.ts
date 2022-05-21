import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssetRef } from '../../model/asset-ref';

@Component({
  selector: 'app-asset-formular',
  templateUrl: './asset-formular.component.html',
  styleUrls: ['./asset-formular.component.scss']
})
export class AssetFormularComponent implements OnInit {

  @Output() asset = new EventEmitter<AssetRef>();

  assetForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.assetForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)] ]
    });
  }

  ngOnInit(): void {
  }

  speichern() {
    this.asset.emit(this.assetForm.value);
  }
}
