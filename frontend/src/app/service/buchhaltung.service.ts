import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Konto } from '../model/konto';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Buchung } from '../model/buchung';
import { Page } from '../model/page';

const KONTO_ENDPOINT = 'http://localhost:8080/api/konto';
const BUCHUNG_ENDPOINT = 'http://localhost:8080/api/buchung';

@Injectable({
  providedIn: 'root'
})
export class BuchhaltungService {

  constructor(private http: HttpClient) { }

  findAlleKonten(): Observable<Konto[]> {
    return this.http.get<Konto[]>(KONTO_ENDPOINT);
  }

  findBuchungenByKonto(id: string): Observable<Page<Buchung>> {
    return this.http.get<Page<Buchung>>(KONTO_ENDPOINT + `/${id}/buchungen`);
  }

  createKonto(konto: Konto): Observable<any> {
    return this.http.post(KONTO_ENDPOINT, konto)
    .pipe(
      catchError(this.handleError)
    );
  }

  createBuchung(buchung: Buchung): Observable<any> {
    return this.http.post(BUCHUNG_ENDPOINT, buchung)
    .pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.error instanceof ErrorEvent) {
      console.error('Fehler beim Aufruf:', error.error.message);
    } else {
      console.error(
        `Returncode ${error.status}, ` +
        `Body: ${error.error}`);
    }
    return throwError(
      'Fataler Fehler.');
  }
}
