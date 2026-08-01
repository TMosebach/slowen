import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BookingFormComponent } from './booking-form.component';
import { BookingService } from '../../../services/booking.service';
import { AccountService } from '../../../services/account.service';

@Component({ template: '' })
class DummyBookingsComponent {}

describe('BookingFormComponent', () => {
  let component: BookingFormComponent;
  let fixture: ComponentFixture<BookingFormComponent>;
  let mockBookingService: any;
  let mockAccountService: any;

  beforeEach(async () => {
    mockBookingService = {
      getById: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    };

    mockAccountService = {
      getAll: vi.fn().mockResolvedValue([]),
    };

    await TestBed.configureTestingModule({
      imports: [BookingFormComponent],
      providers: [
        provideRouter([{ path: 'bookings', component: DummyBookingsComponent }]),
        { provide: BookingService, useValue: mockBookingService },
        { provide: AccountService, useValue: mockAccountService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.booking.vorgang).toBe('Buchung');
    expect(component.booking.positions.length).toBe(1);
  });

  it('should add position', () => {
    component.addPosition();
    expect(component.booking.positions.length).toBe(2);
  });

  it('should remove position', () => {
    component.addPosition();
    component.removePosition(0);
    expect(component.booking.positions.length).toBe(1);
  });

  it('should not remove last position', () => {
    component.removePosition(0);
    expect(component.booking.positions.length).toBe(1);
  });

  it('switches into purchase mode when vorgang is Kauf', () => {
    component.booking.vorgang = 'Kauf';

    expect(component.isPurchase()).toBe(true);
  });

  it('calculates purchase totals from quantity, price, fees and accrued interest', () => {
    component.booking.vorgang = 'Kauf';
    component.booking.purchaseDetails = {
      security_id: 1,
      depot_account_id: 2,
      settlement_account_id: 3,
      quantity: 10,
      price_per_unit: 99,
      fees: 4,
      accrued_interest: 6,
    };

    expect(component.getPurchaseValue()).toBe(990);
    expect(component.getPurchaseTotal()).toBe(1000);
  });

  it('submits purchase bookings without manual positions', async () => {
    component.booking = {
      vorgang: 'Kauf',
      date: '2026-08-01',
      description: 'ETF Kauf',
      positions: [],
      purchaseDetails: {
        security_id: 1,
        depot_account_id: 2,
        settlement_account_id: 3,
        quantity: 5,
        price_per_unit: 100,
        fees: 2,
        accrued_interest: 0,
      },
    };

    await component.onSubmit();

    expect(mockBookingService.create).toHaveBeenCalledWith(component.booking);
  });
});
