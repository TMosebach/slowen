import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ObservedValuesFromArray } from 'rxjs';
import { AssetRef } from '../model/asset-ref';
import { Buchung } from '../model/buchung';
import { BuchhungPage } from '../model/buchung-page';
import { Konto } from '../model/konto';



const API_ENDPOINT = 'http://localhost:8080/api/buchhaltung';

@Injectable({
  providedIn: 'root'
})
export class BuchhaltungService {

  constructor(private http: HttpClient) { }

  getKonten(): Observable<Konto[]> {
    return this.http.get<Konto[]>(`${API_ENDPOINT}/konten`);
  }

  getKonto(id: string): Observable<Konto> {
    return this.http.get<Konto>(`${API_ENDPOINT}/konten/${id}`);
  }

  getBuchungen4Konto(id: string, page: number): Observable<BuchhungPage> {
    return this.http.get<BuchhungPage>(`${API_ENDPOINT}/buchungen/${id}?page=${page}&size=10`);
  }

  createKonto(konto: Konto): Observable<Konto> {
    return this.http.post<Konto>(`${API_ENDPOINT}/konten`, konto);
  }

  buche(buchung: Buchung): Observable<Buchung> {
    return this.http.post<Buchung>(`${API_ENDPOINT}/buchungen`, buchung);
  }

  getAssets(): Observable<AssetRef[]> {
    return this.http.get<AssetRef[]>(`${API_ENDPOINT}/assets`);
  }

  createAsset(asset: AssetRef): Observable<AssetRef> {
    return this.http.post<AssetRef>(`${API_ENDPOINT}/assets`, asset);
  }
}
