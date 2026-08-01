import { TestBed } from '@angular/core/testing';

import type { Booking } from '../models/booking.model';

import { BookingService } from './booking.service';

describe('BookingService', () => {
  let service: BookingService;
  let mockApi: any;

  beforeEach(() => {
    mockApi = {
      getAll: vi.fn().mockResolvedValue([]),
      getById: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation((b: any) => Promise.resolve({ id: 1, ...b })),
      update: vi.fn().mockImplementation((id: number, b: any) => Promise.resolve({ id, ...b })),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    (window as any).electronAPI = { bookings: mockApi };

    TestBed.configureTestingModule({});
    service = TestBed.inject(BookingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call api.getAll on getAll()', async () => {
    const result = await service.getAll();
    expect(mockApi.getAll).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should call api.getById with correct id', async () => {
    const mockBooking = {
      id: 5,
      vorgang: 'Buchung',
      date: '2026-01-01',
      positions: [{ account_id: 1, valuta: '2026-01-01', amount: 100 }],
    };
    mockApi.getById.mockResolvedValue(mockBooking);

    const result = await service.getById(5);
    expect(mockApi.getById).toHaveBeenCalledWith(5);
    expect(result).toEqual(mockBooking);
  });

  it('should call api.create with booking data', async () => {
    const booking: Booking = {
      vorgang: 'Buchung',
      date: '2026-01-01',
      positions: [{ account_id: 1, valuta: '2026-01-01', amount: 50 }],
    };
    const result = await service.create(booking);
    expect(mockApi.create).toHaveBeenCalledWith(booking);
    expect(result.id).toBe(1);
  });

  it('should call api.update with id and booking data', async () => {
    const booking: Booking = {
      vorgang: 'Buchung',
      date: '2026-02-01',
      positions: [{ account_id: 2, valuta: '2026-02-01', amount: 200 }],
    };
    const result = await service.update(3, booking);
    expect(mockApi.update).toHaveBeenCalledWith(3, booking);
    expect(result.id).toBe(3);
  });

  it('should call api.delete with id', async () => {
    await service.delete(7);
    expect(mockApi.delete).toHaveBeenCalledWith(7);
  });
});
