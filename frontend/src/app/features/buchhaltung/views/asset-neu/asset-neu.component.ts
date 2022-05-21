import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AssetRef } from '../../model/asset-ref';
import { BuchhaltungService } from '../../service/buchhaltung.service';

@Component({
  selector: 'app-asset-neu',
  templateUrl: './asset-neu.component.html',
  styleUrls: ['./asset-neu.component.scss']
})
export class AssetNeuComponent implements OnInit {

  constructor(
    private service: BuchhaltungService,
    private router: Router) { }

  ngOnInit(): void {
  }

  speichern(asset: AssetRef) {
    this.service.createAsset(asset).subscribe({
      next: () => this.router.navigateByUrl('verwaltung/assets'),
      error: (err) => console.error(err)
    });
  }
}
