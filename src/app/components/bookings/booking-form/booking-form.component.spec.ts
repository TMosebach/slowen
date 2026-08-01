import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BookingFormComponent } from './booking-form.component';
import { BookingService } from '../../../services/booking.service';
import { AccountService } from '../../../services/account.service';
import { SecuritiesService } from '../../../services/securities.service';

@Component({ template: '' })
class DummyBookingsComponent {}

describe('BookingFormComponent', () => {
  let component: BookingFormComponent;
  let fixture: ComponentFixture<BookingFormComponent>;
  let mockBookingService: any;
  let mockAccountService: any;
  let mockSecuritiesService: any;

  beforeEach(async () => {
    mockBookingService = {
      getById: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    };

    mockAccountService = {
      getAll: vi.fn().mockResolvedValue([]),
    };

    mockSecuritiesService = {
      getAll: vi.fn().mockResolvedValue([]),
    };

    await TestBed.configureTestingModule({
      imports: [BookingFormComponent],
      providers: [
        provideRouter([{ path: 'bookings', component: DummyBookingsComponent }]),
        { provide: BookingService, useValue: mockBookingService },
        { provide: AccountService, useValue: mockAccountService },
        { provide: SecuritiesService, useValue: mockSecuritiesService },
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

  it('filters depot and settlement accounts for purchase mode', async () => {
    mockAccountService.getAll.mockResolvedValue([
      { id: 1, name: 'Depot A', type: 'Bestand', subtype: 'Depot' },
      { id: 2, name: 'Giro', type: 'Bestand', subtype: 'Giro' }
    ]);

    await component.loadAccounts();

    expect(component.depotAccounts.map((account) => account.id)).toEqual([1]);
    expect(component.settlementAccounts.map((account) => account.id)).toEqual([2]);
  });

  it('loads securities for the purchase dropdown', async () => {
    mockSecuritiesService.getAll.mockResolvedValue([
      { id: 7, name: 'ETF World', type: 'ETF', isin: 'IE00TEST0001', wkn: 'ETF001' }
    ]);

    await component.loadSecurities();

    expect(component.securities.map((security) => security.id)).toEqual([7]);
  });

  it('initializes the dedicated purchase route in purchase mode', () => {
    const route = TestBed.inject(ActivatedRoute);
    route.snapshot.data['vorgang'] = 'Kauf';

    fixture.detectChanges();

    expect(component.booking.vorgang).toBe('Kauf');
    expect(component.booking.purchaseDetails).toEqual({
      security_id: 0,
      depot_account_id: 0,
      settlement_account_id: 0,
      quantity: 0,
      price_per_unit: 0,
      fees: 0,
      accrued_interest: 0,
    });
  });

  it('allows fractional quantity input in purchase mode', () => {
    component.booking.vorgang = 'Kauf';
    component.booking.purchaseDetails = {
      security_id: 1,
      depot_account_id: 2,
      settlement_account_id: 3,
      quantity: 0,
      price_per_unit: 0,
      fees: 0,
      accrued_interest: 0,
    };

    fixture.detectChanges();

    const quantityInput = fixture.nativeElement.querySelector('input[name="quantity"]') as HTMLInputElement;
    expect(quantityInput.getAttribute('step')).toBe('any');
  });

  it('allows fractional price, fees and accrued interest in purchase mode', () => {
    component.booking.vorgang = 'Kauf';
    component.booking.purchaseDetails = {
      security_id: 1,
      depot_account_id: 2,
      settlement_account_id: 3,
      quantity: 0,
      price_per_unit: 0,
      fees: 0,
      accrued_interest: 0,
    };

    fixture.detectChanges();

    const priceInput = fixture.nativeElement.querySelector('input[name="price_per_unit"]') as HTMLInputElement;
    const feesInput = fixture.nativeElement.querySelector('input[name="fees"]') as HTMLInputElement;
    const interestInput = fixture.nativeElement.querySelector('input[name="accrued_interest"]') as HTMLInputElement;

    expect(priceInput.getAttribute('step')).toBe('any');
    expect(feesInput.getAttribute('step')).toBe('any');
    expect(interestInput.getAttribute('step')).toBe('any');
  });
});
