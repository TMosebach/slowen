import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Buchung } from './domain/buchung';
import { Konto } from './domain/konto';

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

  getBuchungen4Konto(id: string): Observable<Buchung[]> {
    return this.http.get<Buchung[]>(`${API_ENDPOINT}/buchungen/${id}`);
  }

  buche(buchung: Buchung): Observable<Buchung> {
    return this.http.post<Buchung>(`${API_ENDPOINT}/buchungen`, buchung);
  }
}
