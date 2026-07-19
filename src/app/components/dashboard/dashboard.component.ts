import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { BookingService } from '../../services/booking.service';
import { Account } from '../../models/account.model';
import { Booking, BookingPosition } from '../../models/booking.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  accounts: Account[] = [];
  bookings: Booking[] = [];
  balances = new Map<number, number>();
  loading = true;
  error: string | null = null;

  constructor(
    private accountService: AccountService,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loading = true;
    this.error = null;
    try {
      const [accounts, bookings] = await Promise.all([
        this.accountService.getAll(),
        this.bookingService.getAll()
      ]);

      this.accounts = accounts.filter(a => a.type === 'Bestand');
      this.bookings = bookings || [];
      this.computeBalances();
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      this.error = 'Dashboard-Daten konnten nicht geladen werden.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private computeBalances() {
    this.balances.clear();
    for (const booking of this.bookings) {
      for (const pos of booking.positions || ([] as BookingPosition[])) {
        const accId = pos.account_id;
        if (!accId) continue;
        const prev = this.balances.get(accId) ?? 0;
        this.balances.set(accId, prev + (pos.amount || 0));
      }
    }
  }

  getBalanceFor(account: Account): number {
    if (!account.id) return 0;
    return this.balances.get(account.id) ?? 0;
  }

  get total(): number {
    let sum = 0;
    for (const acc of this.accounts) {
      sum += this.getBalanceFor(acc);
    }
    return sum;
  }
}
