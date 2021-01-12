import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AssetService } from 'src/app/service/asset.service';

@Component({
  selector: 'app-asset-details',
  templateUrl: './asset-details.component.html',
  styleUrls: ['./asset-details.component.scss']
})
export class AssetDetailsComponent implements OnInit {

  assetForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    isin: ['', [Validators.required]],
    wkn: ['', [Validators.required]]
  });

  constructor(
    private fb: FormBuilder,
    private assetService: AssetService,
    private router: Router) { }

    ngOnInit(): void {
    }

    onAbbrechen(): void {
      this.router.navigate(['stammdaten', 'asset']);
    }

    onSpeichern(): void {
      this.assetService.createAsset(this.assetForm.value)
      .subscribe({
        next: () => this.router.navigate(['stammdaten', 'asset']),
        error: (msg) => console.log('Fehler', msg)
      });
    }
}
