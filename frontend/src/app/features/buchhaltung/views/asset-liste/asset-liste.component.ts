import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AssetRef } from '../../model/asset-ref';
import { BuchhaltungService } from '../../service/buchhaltung.service';

@Component({
  selector: 'app-asset-liste',
  templateUrl: './asset-liste.component.html',
  styleUrls: ['./asset-liste.component.scss']
})
export class AssetListeComponent implements OnInit {

  assets$: Observable<AssetRef[]>;
  constructor(private buchhaltungsService: BuchhaltungService) {
    this.assets$ = this.buchhaltungsService.getAssets();
  }

  ngOnInit(): void {
  }

}
