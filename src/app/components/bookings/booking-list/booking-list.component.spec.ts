import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { BookingListComponent } from './booking-list.component';
import { BookingService } from '../../../services/booking.service';

describe('BookingListComponent', () => {
  let component: BookingListComponent;
  let fixture: ComponentFixture<BookingListComponent>;
  let mockService: any;

  const mockBookings = [
    { id: 1, vorgang: 'Buchung', date: '2024-01-15', description: 'Test', sender_receiver: 'Test Empfänger', positions: [] },
    { id: 2, vorgang: 'Buchung', date: '2024-01-16', description: 'Test 2', sender_receiver: 'Test Sender', positions: [] },
  ];

  beforeEach(async () => {
    mockService = {
      getAll: vi.fn().mockResolvedValue(mockBookings),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [BookingListComponent],
      providers: [
        provideRouter([]),
        { provide: BookingService, useValue: mockService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load bookings on init', () => {
    expect(component.bookings.length).toBe(2);
    expect(component.bookings[0].vorgang).toBe('Buchung');
    expect(component.loading).toBeFalsy();
  });

  it('should not call service.delete when deleteBooking is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    await component.deleteBooking(1);
    expect(mockService.delete).not.toHaveBeenCalled();
  });

  it('should call service.delete when deleteBooking is confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await component.deleteBooking(1);
    expect(mockService.delete).toHaveBeenCalledWith(1);
    expect(mockService.getAll).toHaveBeenCalled();
  });

  it('navigates to the dedicated purchase entry point', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.createPurchase();

    expect(navigate).toHaveBeenCalledWith(['/bookings/new/purchase']);
  });

  it('navigates to dedicated sale entry point', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.createSale();

    expect(navigate).toHaveBeenCalledWith(['/bookings/new/sale']);
  });

  it('renders table with table-fixed, zebra rows, and text-wrapping cells', () => {
    const table = (fixture.nativeElement as HTMLElement).querySelector('table');
    expect(table?.classList.contains('table-fixed')).toBe(true);

    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].classList.contains('odd:bg-white')).toBe(true);
    expect(rows[0].classList.contains('even:bg-gray-50')).toBe(true);

    // Beschreibung cell should wrap rather than truncate/nowrap
    const descCell = rows[0].querySelectorAll('td')[2];
    expect(descCell.classList.contains('whitespace-normal')).toBe(true);
    expect(descCell.classList.contains('break-words')).toBe(true);
    expect(descCell.classList.contains('whitespace-nowrap')).toBe(false);

    // Aktionen cell retains nowrap to keep buttons together
    const actionCell = rows[0].querySelectorAll('td')[4];
    expect(actionCell.classList.contains('whitespace-nowrap')).toBe(true);
  });
});
