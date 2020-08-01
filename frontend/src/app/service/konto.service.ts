import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Konto } from '../model/konto';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

const KONTO_ENDPOINT = 'http://localhost:8080/api/konto';

@Injectable({
  providedIn: 'root'
})
export class KontoService {

  constructor(private http: HttpClient) { }

  findAll(): Observable<Konto[]> {
    return this.http.get<Konto[]>(KONTO_ENDPOINT);
  }

  createKonto(konto: Konto): Observable<any> {
    return this.http.post(KONTO_ENDPOINT, konto)
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
