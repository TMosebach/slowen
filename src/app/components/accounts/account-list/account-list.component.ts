import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccountService } from '../../../services/account.service';
import { Account } from '../../../models/account.model';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './account-list.component.html'
})
export class AccountListComponent implements OnInit {
  accounts: Account[] = [];
  loading = true;

  constructor(private accountService: AccountService) {}

  async ngOnInit() {
    await this.loadAccounts();
  }

  async loadAccounts() {
    this.loading = true;
    this.accounts = await this.accountService.getAll();
    this.loading = false;
  }

  async deleteAccount(id: number) {
    if (confirm('Konto wirklich löschen?')) {
      await this.accountService.delete(id);
      await this.loadAccounts();
    }
  }
}