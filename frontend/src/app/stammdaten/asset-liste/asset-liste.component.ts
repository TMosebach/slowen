import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AssetService } from 'src/app/service/asset.service';
import { Asset } from '../../model/asset';
@Component({
  selector: 'app-asset-liste',
  templateUrl: './asset-liste.component.html',
  styleUrls: ['./asset-liste.component.scss']
})
export class AssetListeComponent implements OnInit {

  assets: Observable<Asset[]>;

  constructor(
    private assetService: AssetService,
    private router: Router) { }

  ngOnInit(): void {
    this.assets = this.assetService.findAlleAssets();
  }

  onNew(): void {
    this.router.navigate(['stammdaten', 'asset', 'new']);
  }
}
