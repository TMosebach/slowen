import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import { AccountService } from '../../../services/account.service';
import { SecuritiesService } from '../../../services/securities.service';
import { Booking, BookingPosition, PurchaseBookingDetails, SaleBookingDetails, VORGANG_OPTIONS } from '../../../models/booking.model';
import { Account } from '../../../models/account.model';
import { Security } from '../../../models/security.model';

type LocalFifoLot = {
  remaining: number;
  price: number;
};

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './booking-form.component.html'
})
export class BookingFormComponent implements OnInit {
  booking: Booking = {
    vorgang: 'Buchung',
    date: new Date().toISOString().split('T')[0],
    description: '',
    sender_receiver: '',
    positions: [this.createEmptyPosition()]
  };

  accounts: Account[] = [];
  depotAccounts: Account[] = [];
  settlementAccounts: Account[] = [];
  securities: Security[] = [];
  vorgangOptions = VORGANG_OPTIONS;
  isEditing = false;
  bookingId: number | null = null;
  saving = false;
  errorMessage: string | null = null;
  private allBookings: Booking[] = [];

  constructor(
    private bookingService: BookingService,
    private accountService: AccountService,
    private securitiesService: SecuritiesService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAccounts();
    this.loadSecurities();
    this.loadAllBookings();

    if (this.route.snapshot.data['vorgang'] === 'Kauf') {
      this.booking.vorgang = 'Kauf';
      this.booking.purchaseDetails = this.createEmptyPurchaseDetails();
    } else if (this.route.snapshot.data['vorgang'] === 'Verkauf') {
      this.booking.vorgang = 'Verkauf';
      this.booking.saleDetails = this.createEmptySaleDetails();
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.bookingId = parseInt(id, 10);
      this.loadBooking();
    }
  }

  async loadAccounts() {
    try {
      this.accounts = await this.accountService.getAll();
      this.depotAccounts = this.accounts.filter((account) => account.subtype === 'Depot');
      this.settlementAccounts = this.accounts.filter((account) => account.type === 'Bestand' && account.subtype !== 'Depot');
    } catch (err) {
      console.error('Failed to load accounts:', err);
    }
  }

  async loadSecurities() {
    try {
      this.securities = await this.securitiesService.getAll();
    } catch (err) {
      console.error('Failed to load securities:', err);
    }
  }

  async loadBooking() {
    if (this.bookingId) {
      const booking = await this.bookingService.getById(this.bookingId);
      if (booking) {
        this.booking = booking;
        if (this.isPurchase() && !this.booking.purchaseDetails) {
          this.booking.purchaseDetails = this.createEmptyPurchaseDetails();
        }
        if (this.isSale() && !this.booking.saleDetails) {
          this.booking.saleDetails = this.createEmptySaleDetails();
        }
      }
      this.cdr.detectChanges();
    }
  }

  async loadAllBookings() {
    try {
      this.allBookings = await this.bookingService.getAll();
    } catch (err) {
      console.error('Failed to load bookings:', err);
      this.allBookings = [];
    }
  }

  createEmptyPurchaseDetails(): PurchaseBookingDetails {
    return {
      security_id: 0,
      depot_account_id: 0,
      settlement_account_id: 0,
      quantity: 0,
      price_per_unit: 0,
      fees: 0,
      accrued_interest: 0
    };
  }

  createEmptySaleDetails(): SaleBookingDetails {
    return {
      security_id: 0,
      depot_account_id: 0,
      settlement_account_id: 0,
      quantity: 0,
      price_per_unit: 0,
      fees: 0,
      capital_gains_tax: 0,
      solidarity_surcharge: 0,
    };
  }

  createEmptyPosition(): BookingPosition {
    return {
      account_id: 0,
      valuta: this.booking?.date || new Date().toISOString().split('T')[0],
      amount: 0
    };
  }

  addPosition() {
    this.booking.positions.push(this.createEmptyPosition());
  }

  removePosition(index: number) {
    if (this.booking.positions.length > 1) {
      this.booking.positions.splice(index, 1);
    }
  }

  onDateChange() {
    for (const pos of this.booking.positions) {
      pos.valuta = this.booking.date;
    }
  }

  onVorgangChange() {
    if (this.isPurchase() && !this.booking.purchaseDetails) {
      this.booking.purchaseDetails = this.createEmptyPurchaseDetails();
    }

    if (this.isSale() && !this.booking.saleDetails) {
      this.booking.saleDetails = this.createEmptySaleDetails();
    }
  }

  isPurchase(): boolean {
    return this.booking.vorgang === 'Kauf';
  }

  isSale(): boolean {
    return this.booking.vorgang === 'Verkauf';
  }

  getPurchaseValue(): number {
    const details = this.booking.purchaseDetails;
    if (!details) {
      return 0;
    }

    return details.quantity * details.price_per_unit;
  }

  getPurchaseTotal(): number {
    const details = this.booking.purchaseDetails;
    if (!details) {
      return 0;
    }

    return this.getPurchaseValue() + (details.fees ?? 0) + (details.accrued_interest ?? 0);
  }

  getSaleGross(): number {
    const details = this.booking.saleDetails;
    if (!details) {
      return 0;
    }

    return details.quantity * details.price_per_unit;
  }

  getSaleDeductions(): number {
    const details = this.booking.saleDetails;
    if (!details) {
      return 0;
    }

    return (details.fees ?? 0) + (details.capital_gains_tax ?? 0) + (details.solidarity_surcharge ?? 0);
  }

  getSaleNet(): number {
    return this.getSaleGross() - this.getSaleDeductions();
  }

  getSaleEstimatedCostBasis(): number {
    const details = this.booking.saleDetails;
    if (!details || details.quantity <= 0 || details.price_per_unit <= 0 || !details.depot_account_id || !details.security_id) {
      return 0;
    }

    try {
      const lots = this.buildSaleFifoState(details.depot_account_id, details.security_id);
      let remaining = details.quantity;
      let costBasis = 0;

      for (const lot of lots) {
        if (remaining <= 0) {
          break;
        }

        const consume = Math.min(lot.remaining, remaining);
        remaining -= consume;
        costBasis += consume * lot.price;
      }

      if (remaining > 0) {
        return 0;
      }

      return costBasis;
    } catch {
      return 0;
    }
  }

  getSalePnl(): number {
    return this.getSaleNet() - this.getSaleEstimatedCostBasis();
  }

  hasEnoughHoldingsForSale(): boolean {
    const details = this.booking.saleDetails;
    if (!details || details.quantity <= 0 || !details.depot_account_id || !details.security_id) {
      return true;
    }

    const lots = this.buildSaleFifoState(details.depot_account_id, details.security_id);
    const available = lots.reduce((sum, lot) => sum + lot.remaining, 0);
    return details.quantity <= available + 1e-9;
  }

  private buildSaleFifoState(depotAccountId: number, securityId: number): LocalFifoLot[] {
    const candidateId = this.isEditing ? this.bookingId : null;
    const events = this.allBookings
      .filter((booking) => {
        if (!booking.id) {
          return false;
        }

        if (candidateId !== null && booking.id === candidateId) {
          return false;
        }

        if (booking.date > this.booking.date) {
          return false;
        }

        if (booking.date === this.booking.date && candidateId !== null && booking.id >= candidateId) {
          return false;
        }

        if (booking.vorgang === 'Kauf') {
          return (
            booking.purchaseDetails?.depot_account_id === depotAccountId
            && booking.purchaseDetails.security_id === securityId
          );
        }

        if (booking.vorgang === 'Verkauf') {
          return (
            booking.saleDetails?.depot_account_id === depotAccountId
            && booking.saleDetails.security_id === securityId
          );
        }

        return false;
      })
      .sort((left, right) => left.date.localeCompare(right.date) || (left.id ?? 0) - (right.id ?? 0));

    const lots: LocalFifoLot[] = [];
    for (const booking of events) {
      if (booking.vorgang === 'Kauf' && booking.purchaseDetails) {
        lots.push({
          remaining: booking.purchaseDetails.quantity,
          price: booking.purchaseDetails.price_per_unit,
        });
        continue;
      }

      if (booking.vorgang === 'Verkauf' && booking.saleDetails) {
        let remaining = booking.saleDetails.quantity;
        for (const lot of lots) {
          if (remaining <= 0) {
            break;
          }

          const consume = Math.min(lot.remaining, remaining);
          lot.remaining -= consume;
          remaining -= consume;
        }
      }
    }

    return lots;
  }

  async onSubmit() {
    if (!this.booking.date) {
      alert('Datum ist ein Pflichtfeld.');
      return;
    }

    if (this.isPurchase()) {
      const details = this.booking.purchaseDetails;
      if (!details || !details.security_id || !details.depot_account_id || !details.settlement_account_id) {
        alert('Alle Pflichtfelder des Kaufs müssen ausgefüllt sein.');
        return;
      }

      if (details.depot_account_id === details.settlement_account_id) {
        alert('Depot-Konto und Verrechnungskonto müssen unterschiedlich sein.');
        return;
      }

      if (details.quantity <= 0 || details.price_per_unit <= 0 || (details.fees ?? 0) < 0 || (details.accrued_interest ?? 0) < 0) {
        alert('Stückzahl und Kurs müssen größer 0 sein. Gebühren und Stückzinsen dürfen nicht negativ sein.');
        return;
      }
    } else if (this.isSale()) {
      const details = this.booking.saleDetails;
      if (!details || !details.security_id || !details.depot_account_id || !details.settlement_account_id) {
        alert('Alle Pflichtfelder des Verkaufs müssen ausgefüllt sein.');
        return;
      }

      if (details.depot_account_id === details.settlement_account_id) {
        alert('Depot-Konto und Verrechnungskonto müssen unterschiedlich sein.');
        return;
      }

      if (
        details.quantity <= 0
        || details.price_per_unit <= 0
        || (details.fees ?? 0) < 0
        || (details.capital_gains_tax ?? 0) < 0
        || (details.solidarity_surcharge ?? 0) < 0
      ) {
        alert('Stückzahl und Kurs müssen größer 0 sein. Gebühren und Steuern dürfen nicht negativ sein.');
        return;
      }

      if (this.getSaleNet() <= 0) {
        alert('Nettozufluss muss größer 0 sein.');
        return;
      }

      if (!this.hasEnoughHoldingsForSale()) {
        alert('Nicht genügend Bestand für den Verkauf.');
        return;
      }
    } else {
      if (this.booking.positions.length === 0) {
        alert('Mindestens eine Position ist erforderlich.');
        return;
      }

      for (const pos of this.booking.positions) {
        if (!pos.account_id || !pos.valuta || pos.amount === null) {
          alert('Alle Positionen müssen ausgefüllt sein.');
          return;
        }
      }
    }

    this.saving = true;
    this.errorMessage = null;
    try {
      if (this.isEditing && this.bookingId) {
        await this.bookingService.update(this.bookingId, this.booking);
      } else {
        await this.bookingService.create(this.booking);
      }
      this.router.navigate(['/bookings']);
    } catch (err) {
      console.error('Failed to save booking:', err);
      this.errorMessage = this.isEditing
        ? 'Buchung konnte nicht gespeichert werden.'
        : 'Buchung konnte nicht angelegt werden.';
      this.cdr.detectChanges();
    } finally {
      this.saving = false;
    }
  }
}
