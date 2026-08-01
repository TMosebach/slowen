import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import { Booking } from '../../../models/booking.model';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './booking-list.component.html'
})
export class BookingListComponent implements OnInit {
  bookings: Booking[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadBookings();
  }

  async loadBookings() {
    this.loading = true;
    this.error = null;
    try {
      this.bookings = await this.bookingService.getAll();
    } catch (err) {
      console.error('Failed to load bookings:', err);
      this.error = 'Buchungen konnten nicht geladen werden.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async deleteBooking(id: number) {
    if (confirm('Buchung wirklich löschen?')) {
      try {
        await this.bookingService.delete(id);
        await this.loadBookings();
      } catch (err) {
        console.error('Failed to delete booking:', err);
        alert('Buchung konnte nicht gelöscht werden.');
      }
    }
  }

  createPurchase() {
    this.router.navigate(['/bookings/new/purchase']);
  }
}
