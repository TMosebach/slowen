import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Asset } from '../model/asset';

const ASSET_ENDPOINT = 'http://localhost:8080/api/asset';

@Injectable({
  providedIn: 'root'
})
export class AssetService {

  constructor(private http: HttpClient) { }

  findAlleAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(ASSET_ENDPOINT);
  }

  createAsset(asset: Asset): Observable<any> {
    return this.http.post(ASSET_ENDPOINT, asset)
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
    return throwError('Fataler Fehler.');
  }
}
