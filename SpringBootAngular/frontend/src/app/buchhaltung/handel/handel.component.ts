import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BuchhaltungService } from 'src/app/services/buchhaltung.service';
import { Asset } from '../model/asset';
import { Buchung } from '../model/buchung';
import { Konto } from '../model/konto';
import { Umsatz } from '../model/umsatz';

@Component({
  selector: 'app-handel',
  templateUrl: './handel.component.html',
  styleUrls: ['./handel.component.scss']
})
export class HandelComponent implements OnInit {

  kaufForm: FormGroup;
  assets$: Observable<Asset[]>;

  konten: Konto[];
  depots: Konto[];
  ordergebuehr: Konto;

  kaufpreis = 0.0;
  ausmachenderBetrag = 0.0;

  constructor(
    private fb: FormBuilder,
    private buchhaltungService: BuchhaltungService,
    private router: Router) { }

  ngOnInit(): void {
    this.kaufForm = this.fb.group({
      vorgang: ['Kauf'],
      verrechnungskonto: [''],
      depot: ['', Validators.required],
      asset: ['', Validators.required],
      valuta: [new Date().toISOString().slice(0, 10)],
      menge: ['', Validators.required],
      preis: ['', Validators.required],
      ordergebuehr: [],
    });
    this.kaufForm.valueChanges.subscribe( value =>  this.onValueChange(value) );

    this.buchhaltungService.findKontorahmen().subscribe({
      next: kontorahmen => {
        this.konten = kontorahmen.filter( konto => konto.type !== 'Depot');
        this.depots = kontorahmen.filter( konto => konto.type === 'Depot');
        this.ordergebuehr = kontorahmen.filter( konto => konto.name === 'Ordergebühr')[0];
      }
    });
    this.assets$ = this.buchhaltungService.findAllAssets();
  }

  private onValueChange(value: {
    vorgang: string,
    menge: string,
    preis: string,
    ordergebuehr: string  }): void {

      const vorgang = this.kaufForm.value[`vorgang`];
      const menge = value.menge ? Number.parseFloat(value.menge) : 0.0;
      const preis = value.preis ? Number.parseFloat(value.preis) : 0.0;
      const ordergebuehr = value.ordergebuehr ? Number.parseFloat(value.ordergebuehr) : 0.0;

      this.kaufpreis = menge * preis;
      this.ausmachenderBetrag = this.kaufpreis + (vorgang === 'Kauf' ? 1 : -1) * ordergebuehr;
    }

  doOrder(): void {
    const buchung = this.toBuchung();
    const vorgang = this.kaufForm.value[`vorgang`];

    let order: Observable<Buchung>;
    if (vorgang === 'Kauf') {
      order = this.buchhaltungService.kaufen(buchung);
    } else {
      order = this.buchhaltungService.verkaufen(buchung);
    }

    order.subscribe({
      next: () => this.router.navigate(['buchhaltung', 'konten']),
      error: err => console.error(err)
    });
  }

  toBuchung(): Buchung {
    const form = this.kaufForm.value;

    const vorgang = form[`vorgang`];
    const asset: Asset = form[`asset`];
    const valutaStr = form[`valuta`];
    const valuta = new Date(valutaStr).toISOString();

    const buchung = {
      verwendung: vorgang + ' - ' + asset.name,
      umsaetze: [
        this.createDepotUmsatz(asset, valuta)
      ]
    };

    const verrechnungskonto = form[`verrechnungskonto`];
    if (verrechnungskonto) {
      const betrag = (vorgang === 'Kauf' ? -1 : 1) * this.ausmachenderBetrag;
      buchung.umsaetze.push( this.createKontoumsatz(verrechnungskonto, valuta, betrag));
    }
    const gebuehr = form[`ordergebuehr`];
    if (gebuehr) {
      buchung.umsaetze.push( this.createKontoumsatz(this.ordergebuehr, valuta, gebuehr));
    }
    return buchung;
  }

  private createKontoumsatz(konto: Konto, valuta: string, betrag: number): Umsatz {
    return {
      betrag,
      konto: {
        id: konto.id
      },
      valuta
    };
  }

  private createDepotUmsatz(asset: Asset, valuta: string): Umsatz {
    const vorgang = this.kaufForm.get('vorgang')?.value;
    const depot: Konto = this.kaufForm.get('depot')?.value;
    const menge = this.kaufForm.get('menge')?.value;

    return {
      asset: {
        id: asset.id
      },
      betrag: vorgang === 'Kauf' ? this.kaufpreis : -this.kaufpreis,
      konto: {
        id: depot.id
      },
      menge: vorgang === 'Kauf' ? menge : -menge,
      valuta
    };
  }
}
