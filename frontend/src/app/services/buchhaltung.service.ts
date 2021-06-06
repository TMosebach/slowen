import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Asset } from '../buchhaltung/model/asset';
import { Buchung } from '../buchhaltung/model/buchung';
import { Konto } from '../buchhaltung/model/konto';
import { PagedModel } from '../model/pagedModel';

@Injectable({
  providedIn: 'root'
})
export class BuchhaltungService {

  server = 'http://localhost:8080/api/';

  constructor(private http: HttpClient) { }

  findKontorahmen(): Observable<Konto[]> {
    return this.http.get<{ content: Konto[]}>(`${this.server}buchhaltung/konten`)
    .pipe(map( response => response.content ));
  }

  createKonto(konto: Konto): Observable<Konto> {
    return this.http.post<Konto>(`${this.server}buchhaltung/konten`, konto);
  }

  createDepot(depot: Konto): Observable<Konto> {
    return this.http.post<Konto>(`${this.server}buchhaltung/depots`, depot);
  }

  findAllAssets(): Observable<Asset[]> {
    return this.http.get<{ content: Asset[]}>(`${this.server}assets`)
    .pipe(map( response => response.content ));
  }

  createAsset(asset: Asset): Observable<Asset> {
    return this.http.post<Asset>(`${this.server}assets`, asset);
  }

  buche(buchung: Buchung): Observable<Buchung> {
    return this.http.post<Buchung>(`${this.server}buchhaltung/buchungen`, buchung);
  }

  findKontobuchungen(kontoId: string): Observable<PagedModel<Buchung>> {
    return this.http.get<PagedModel<Buchung>>(`${this.server}buchhaltung/konten/${kontoId}/umsatz`);
  }
}
