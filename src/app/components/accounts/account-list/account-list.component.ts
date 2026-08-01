import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccountService } from '../../../services/account.service';
import { Account, isSystemAccount } from '../../../models/account.model';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './account-list.component.html'
})
export class AccountListComponent implements OnInit {
  accounts: Account[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private accountService: AccountService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAccounts();
  }

  async loadAccounts() {
    this.loading = true;
    this.error = null;
    try {
      this.accounts = await this.accountService.getAll();
    } catch (err) {
      console.error('Failed to load accounts:', err);
      this.error = 'Konten konnten nicht geladen werden.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  isProtectedSystemAccount(account: Account): boolean {
    return isSystemAccount(account);
  }

  async deleteAccount(id: number) {
    if (confirm('Konto wirklich löschen?')) {
      try {
        await this.accountService.delete(id);
        await this.loadAccounts();
      } catch (err) {
        console.error('Failed to delete account:', err);
        alert('Konto konnte nicht gelöscht werden.');
      }
    }
  }
}
