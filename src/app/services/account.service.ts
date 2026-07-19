import { Injectable } from '@angular/core';
import { Account } from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private get api() {
    return window.electronAPI.accounts;
  }

  getAll(): Promise<Account[]> {
    return this.api.getAll();
  }

  getById(id: number): Promise<Account | null> {
    return this.api.getById(id);
  }

  create(account: Account): Promise<Account> {
    return this.api.create(account);
  }

  update(id: number, account: Account): Promise<Account> {
    return this.api.update(id, account);
  }

  delete(id: number): Promise<void> {
    return this.api.delete(id);
  }
}
