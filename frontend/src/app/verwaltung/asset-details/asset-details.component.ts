import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BuchhaltungService } from 'src/app/services/buchhaltung.service';
import { Asset } from 'src/app/buchhaltung/model/asset';

@Component({
  selector: 'app-asset-details',
  templateUrl: './asset-details.component.html',
  styleUrls: ['./asset-details.component.scss']
})
export class AssetDetailsComponent implements OnInit {

  modus = 'Neu';
  errorMessage = '';

  assetForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private buchhaltungService: BuchhaltungService,
    private router: Router) { }

  ngOnInit(): void {
    this.assetForm = this.fb.group({
      name: ['', Validators.required ],
      wpk: [''],
      isin: ['']
    });
  }

  onZurueck(): void {
    this.router.navigate(['verwaltung', 'assets']);
  }

  onSave(): void {

    const eingabe = this.assetForm.value;
    const asset: Asset = {
      name: eingabe.name,
      wpk: eingabe.wpk,
      isin: eingabe.isin
    };

    this.buchhaltungService
      .createAsset(asset)
      .subscribe({
        next: a => this.router.navigate(['verwaltung', 'assets']),
        error: err => {
          this.errorMessage = err.message;
        }
    });
  }
}
