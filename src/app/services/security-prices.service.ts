import { Injectable } from '@angular/core';
import { SecurityPrice } from '../models/security-price.model';

@Injectable({ providedIn: 'root' })
export class SecurityPricesService {
  private get api() {
    return (window as any).electronAPI.securityPrices;
  }

  create(security_id: number, date: string, price: number): Promise<SecurityPrice> {
    return this.api.create(security_id, date, price);
  }

  getBySecurityAndDate(security_id: number, date: string): Promise<SecurityPrice | null> {
    return this.api.getBySecurityAndDate(security_id, date);
  }

  getByDate(date: string): Promise<SecurityPrice[]> {
    return this.api.getByDate(date);
  }

  update(security_id: number, date: string, price: number): Promise<SecurityPrice> {
    return this.api.update(security_id, date, price);
  }

  getLatest(security_id: number): Promise<SecurityPrice | null> {
    return this.api.getLatest(security_id);
  }
}
