import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BuchhaltungService } from 'src/app/buchhaltung/buchhaltung.service';
import { Asset } from 'src/app/buchhaltung/model/asset';

@Component({
  selector: 'app-asset-list',
  templateUrl: './asset-list.component.html',
  styleUrls: ['./asset-list.component.scss']
})
export class AssetListComponent implements OnInit {

  assets: Observable<Asset[]>;

  constructor(
    private router: Router,
    private buchhaltungsService: BuchhaltungService) { }

  ngOnInit(): void {
    this.assets = this.buchhaltungsService.findAllAssets();
  }

  onEdit(assetId: string | undefined): void {
    this.router.navigate(['verwaltung', 'assets', assetId]);
  }

  onNeu(): void {
    this.router.navigate(['verwaltung', 'assets', 'neu']);
  }
}
