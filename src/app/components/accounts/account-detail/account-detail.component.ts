import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AccountService } from '../../../services/account.service';
import { BookingService } from '../../../services/booking.service';
import { Account } from '../../../models/account.model';
import { Booking } from '../../../models/booking.model';

export interface AccountBookingPositionView {
  accountName: string;
  valuta: string;
  amount: number;
  isCurrentAccount: boolean;
}

export interface AccountBookingView {
  id?: number;
  vorgang: string;
  date: string;
  description?: string;
  sender_receiver?: string;
  positionsCount: number;
  counterAccountName?: string;
  valuta?: string;
  amount?: number;
  positions: AccountBookingPositionView[];
}

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './account-detail.component.html'
})
export class AccountDetailComponent implements OnInit {
  account: Account | null = null;
  saldo = 0;
  bookings: AccountBookingView[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    this.error = null;
    const accountId = Number(this.route.snapshot.paramMap.get('id'));

    if (!accountId) {
      this.error = 'Ungültige Konto-ID';
      this.loading = false;
      return;
    }

    try {
      const [account, allAccounts, allBookings] = await Promise.all([
        this.accountService.getById(accountId),
        this.accountService.getAll(),
        this.bookingService.getAll()
      ]);

      if (!account) {
        this.error = 'Konto nicht gefunden';
        this.loading = false;
        return;
      }

      this.account = account;

      const accountMap = new Map<number, Account>(
        allAccounts
          .filter((a): a is Account & { id: number } => a.id !== undefined)
          .map(a => [a.id, a])
      );

      const relevantBookings = (allBookings || []).filter(b =>
        b.positions && b.positions.some(p => p.account_id === accountId)
      );

      let sum = 0;
      for (const b of relevantBookings) {
        for (const p of b.positions) {
          if (p.account_id === accountId) {
            sum += p.amount || 0;
          }
        }
      }
      this.saldo = sum;

      relevantBookings.sort((a, b) => {
        const dateCompare = (b.date || '').localeCompare(a.date || '');
        if (dateCompare !== 0) return dateCompare;
        return (b.id ?? 0) - (a.id ?? 0);
      });

      this.bookings = relevantBookings.map(b => this.mapBookingView(b, accountId, accountMap));
    } catch (err) {
      console.error('Failed to load account details:', err);
      this.error = 'Kontodetails konnten nicht geladen werden.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private mapBookingView(
    b: Booking,
    accountId: number,
    accountMap: Map<number, Account>
  ): AccountBookingView {
    const positionsList = b.positions || [];
    const positionsCount = positionsList.length;

    const mappedPositions: AccountBookingPositionView[] = positionsList.map(p => ({
      accountName: accountMap.get(p.account_id)?.name ?? `Konto #${p.account_id}`,
      valuta: p.valuta,
      amount: p.amount,
      isCurrentAccount: p.account_id === accountId
    }));

    let counterAccountName: string | undefined;
    let valuta: string | undefined;
    let amount: number | undefined;

    if (positionsCount === 2) {
      const currentPos = positionsList.find(p => p.account_id === accountId) || positionsList[0];
      const counterPos = positionsList.find(p => p !== currentPos) || positionsList[1];
      counterAccountName = accountMap.get(counterPos.account_id)?.name ?? `Konto #${counterPos.account_id}`;
      valuta = currentPos.valuta;
      amount = currentPos.amount;
    } else if (positionsCount === 1) {
      const pos = positionsList[0];
      counterAccountName = '-';
      valuta = pos.valuta;
      amount = pos.amount;
    }

    return {
      id: b.id,
      vorgang: b.vorgang,
      date: b.date,
      description: b.description,
      sender_receiver: b.sender_receiver,
      positionsCount,
      counterAccountName,
      valuta,
      amount,
      positions: mappedPositions
    };
  }
}
