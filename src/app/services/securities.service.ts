import { Injectable } from '@angular/core';
import { Security } from '../models/security.model';

@Injectable({ providedIn: 'root' })
export class SecuritiesService {
  private get api() {
    return (window as any).electronAPI.securities;
  }

  create(security: Omit<Security, 'id' | 'created_at' | 'updated_at'>): Promise<Security> {
    return this.api.create(security);
  }

  getAll(): Promise<Security[]> {
    return this.api.getAll();
  }

  getById(id: number): Promise<Security | null> {
    return this.api.getById(id);
  }

  update(id: number, updates: Partial<Security>): Promise<Security> {
    return this.api.update(id, updates);
  }
}
