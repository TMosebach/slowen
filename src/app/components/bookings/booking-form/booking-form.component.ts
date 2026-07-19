import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import { AccountService } from '../../../services/account.service';
import { Booking, BookingPosition, VORGANG_OPTIONS } from '../../../models/booking.model';
import { Account } from '../../../models/account.model';

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
  vorgangOptions = VORGANG_OPTIONS;
  isEditing = false;
  bookingId: number | null = null;
  saving = false;
  errorMessage: string | null = null;

  constructor(
    private bookingService: BookingService,
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAccounts();
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
    } catch (err) {
      console.error('Failed to load accounts:', err);
    }
  }

  async loadBooking() {
    if (this.bookingId) {
      const booking = await this.bookingService.getById(this.bookingId);
      if (booking) {
        this.booking = booking;
      }
      this.cdr.detectChanges();
    }
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

  async onSubmit() {
    if (!this.booking.date) {
      alert('Datum ist ein Pflichtfeld.');
      return;
    }

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
