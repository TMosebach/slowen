import { Injectable } from '@angular/core';
import { Booking } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private get api() {
    return window.electronAPI.bookings;
  }

  getAll(): Promise<Booking[]> {
    return this.api.getAll();
  }

  getById(id: number): Promise<Booking | null> {
    return this.api.getById(id);
  }

  create(booking: Booking): Promise<Booking> {
    return this.api.create(booking);
  }

  update(id: number, booking: Booking): Promise<Booking> {
    return this.api.update(id, booking);
  }

  delete(id: number): Promise<void> {
    return this.api.delete(id);
  }
}
