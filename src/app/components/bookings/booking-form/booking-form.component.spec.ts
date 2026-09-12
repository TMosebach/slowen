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
      getAll: vi.fn().mockResolvedValue([]),
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

  it('loads accounts and populates dropdown options in template', async () => {
    mockAccountService.getAll.mockResolvedValue([
      { id: 1, name: 'Girokonto', type: 'Bestand', subtype: 'Giro' },
      { id: 2, name: 'Tagesgeld', type: 'Bestand', subtype: 'Giro' }
    ]);

    await component.ngOnInit();
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('tbody select') as HTMLSelectElement;
    expect(select).toBeTruthy();
    const options = Array.from(select.querySelectorAll('option')).map((o) => o.textContent?.trim());
    expect(options).toContain('Girokonto');
    expect(options).toContain('Tagesgeld');
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

  it('initializes sale route in Verkauf mode', () => {
    const route = TestBed.inject(ActivatedRoute);
    route.snapshot.data['vorgang'] = 'Verkauf';

    fixture.detectChanges();

    expect(component.booking.vorgang).toBe('Verkauf');
    expect(component.booking.saleDetails?.fees).toBe(0);
  });

  it('validates sale input and submits saleDetails payload', async () => {
    component['allBookings'] = [
      {
        id: 1,
        vorgang: 'Kauf',
        date: '2026-08-01',
        positions: [],
        purchaseDetails: {
          security_id: 7,
          depot_account_id: 3,
          settlement_account_id: 2,
          quantity: 5,
          price_per_unit: 100,
          fees: 0,
          accrued_interest: 0,
        },
      },
    ];

    component.booking = {
      vorgang: 'Verkauf',
      date: '2026-08-10',
      positions: [],
      saleDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 1,
        price_per_unit: 150,
        fees: 1,
        capital_gains_tax: 2,
        solidarity_surcharge: 0.1,
      },
    };

    await component.onSubmit();

    expect(mockBookingService.create).toHaveBeenCalledWith(component.booking);
  });

  it('calculates sale gross, deductions and net from sale details', () => {
    component.booking.vorgang = 'Verkauf';
    component.booking.saleDetails = {
      security_id: 7,
      depot_account_id: 3,
      settlement_account_id: 2,
      quantity: 2,
      price_per_unit: 130,
      fees: 2,
      capital_gains_tax: 5,
      solidarity_surcharge: 0.5,
    };

    expect(component.getSaleGross()).toBe(260);
    expect(component.getSaleDeductions()).toBe(7.5);
    expect(component.getSaleNet()).toBe(252.5);
  });

  it('calculates live sale pnl from FIFO cost basis', () => {
    component.booking.vorgang = 'Verkauf';
    component.booking.date = '2026-08-10';
    component['allBookings'] = [
      {
        id: 1,
        vorgang: 'Kauf',
        date: '2026-08-01',
        positions: [],
        purchaseDetails: {
          security_id: 7,
          depot_account_id: 3,
          settlement_account_id: 2,
          quantity: 5,
          price_per_unit: 100,
          fees: 0,
          accrued_interest: 0,
        },
      },
    ];
    component.booking.saleDetails = {
      security_id: 7,
      depot_account_id: 3,
      settlement_account_id: 2,
      quantity: 2,
      price_per_unit: 130,
      fees: 2,
      capital_gains_tax: 5,
      solidarity_surcharge: 0.5,
    };

    expect(component.getSaleEstimatedCostBasis()).toBe(200);
    expect(component.getSalePnl()).toBe(52.5);
  });

  it('detects insufficient holdings in sale form', () => {
    component.booking.vorgang = 'Verkauf';
    component.booking.date = '2026-08-10';
    component['allBookings'] = [
      {
        id: 1,
        vorgang: 'Kauf',
        date: '2026-08-01',
        positions: [],
        purchaseDetails: {
          security_id: 7,
          depot_account_id: 3,
          settlement_account_id: 2,
          quantity: 1,
          price_per_unit: 100,
          fees: 0,
          accrued_interest: 0,
        },
      },
    ];
    component.booking.saleDetails = {
      security_id: 7,
      depot_account_id: 3,
      settlement_account_id: 2,
      quantity: 2,
      price_per_unit: 130,
      fees: 0,
      capital_gains_tax: 0,
      solidarity_surcharge: 0,
    };

    expect(component.hasEnoughHoldingsForSale()).toBe(false);
  });

  it('rejects sale submit when net inflow is non-positive', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    component.booking = {
      vorgang: 'Verkauf',
      date: '2026-08-10',
      positions: [],
      saleDetails: {
        security_id: 7,
        depot_account_id: 3,
        settlement_account_id: 2,
        quantity: 1,
        price_per_unit: 10,
        fees: 11,
        capital_gains_tax: 0,
        solidarity_surcharge: 0,
      },
    };

    await component.onSubmit();

    expect(alertSpy).toHaveBeenCalledWith('Nettozufluss muss größer 0 sein.');
    expect(mockBookingService.create).not.toHaveBeenCalled();
    alertSpy.mockRestore();
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
