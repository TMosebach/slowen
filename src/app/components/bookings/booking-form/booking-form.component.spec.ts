import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
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

  describe('Buchung ändern', () => {
    function setReturnTo(value: string | null) {
      const route = TestBed.inject(ActivatedRoute);
      Object.defineProperty(route.snapshot, 'queryParamMap', {
        configurable: true,
        value: { get: (key: string) => (key === 'returnTo' ? value : null) },
      });
    }

    const validBooking = () => ({
      vorgang: 'Buchung' as const,
      date: '2026-08-01',
      positions: [{ account_id: 1, valuta: '2026-08-01', amount: 10 }],
    });

    it('uses /bookings as default return target', () => {
      setReturnTo(null);
      fixture.detectChanges();
      expect(component.returnTo).toBe('/bookings');
    });

    it('accepts an internal returnTo target', () => {
      setReturnTo('/accounts/3');
      fixture.detectChanges();
      expect(component.returnTo).toBe('/accounts/3');
    });

    it('rejects external returnTo targets', () => {
      setReturnTo('//evil.com');
      fixture.detectChanges();
      expect(component.returnTo).toBe('/bookings');

      const fixture2 = TestBed.createComponent(BookingFormComponent);
      setReturnTo('https://evil.com');
      fixture2.detectChanges();
      expect(fixture2.componentInstance.returnTo).toBe('/bookings');
    });

    it('labels the submit button "Buchen" when creating', () => {
      setReturnTo(null);
      fixture.detectChanges();
      const button = (fixture.nativeElement as HTMLElement).querySelector('button[type="submit"]');
      expect(button?.textContent?.trim()).toBe('Buchen');
    });

    it('labels the submit button "Ändern" when editing', () => {
      setReturnTo(null);
      component.isEditing = true;
      fixture.detectChanges();
      const button = (fixture.nativeElement as HTMLElement).querySelector('button[type="submit"]');
      expect(button?.textContent?.trim()).toBe('Ändern');
    });

    it('updates and navigates to returnTo after submit', async () => {
      setReturnTo('/accounts/3');
      fixture.detectChanges();
      const router = TestBed.inject(Router);
      const navSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

      component.isEditing = true;
      component.bookingId = 5;
      component.booking = validBooking();
      await component.onSubmit();

      expect(mockBookingService.update).toHaveBeenCalledWith(5, component.booking);
      expect(navSpy).toHaveBeenCalledWith('/accounts/3');
    });

    it('cancel link points to returnTo target', () => {
      setReturnTo('/accounts/3');
      fixture.detectChanges();
      const cancel = Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll('a')
      ).find(a => a.textContent?.trim() === 'Abbrechen') as HTMLAnchorElement;
      expect(cancel.getAttribute('href')).toBe('/accounts/3');
    });
  });

  describe('Tilgung (redemption) handling', () => {
    it('initializes Tilgung with price_per_unit = 100 when routing with vorgang Tilgung', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [BookingFormComponent],
        providers: [
          provideRouter([{ path: 'bookings', component: DummyBookingsComponent }]),
          { provide: BookingService, useValue: mockBookingService },
          { provide: AccountService, useValue: mockAccountService },
          { provide: SecuritiesService, useValue: mockSecuritiesService },
          { provide: ActivatedRoute, useValue: { snapshot: { data: { vorgang: 'Tilgung' }, paramMap: new Map(), queryParamMap: new Map() } } },
        ],
      }).compileComponents();

      const tilgungFixture = TestBed.createComponent(BookingFormComponent);
      const tilgungComp = tilgungFixture.componentInstance;
      tilgungFixture.detectChanges();

      expect(tilgungComp.booking.vorgang).toBe('Tilgung');
      expect(tilgungComp.isRedemption()).toBe(true);
      expect(tilgungComp.isSale()).toBe(true);
      expect(tilgungComp.booking.saleDetails?.price_per_unit).toBe(100);
    });

    it('pre-fills date and valuta with security faelligkeit on security change', () => {
      component.booking.vorgang = 'Tilgung';
      component.securities = [
        { id: 42, name: 'Bundesanleihe 2026', type: 'Anleihe', isin: 'DE000123', wkn: '123456', faelligkeit: '2026-11-15' },
      ];
      component.booking.saleDetails = component.createEmptySaleDetails();
      component.booking.saleDetails.security_id = 42;

      component.onSecurityChange();

      expect(component.booking.date).toBe('2026-11-15');
      expect(component.booking.saleDetails.price_per_unit).toBe(100);
    });
  });

  describe('Ertrag (income) handling', () => {
    it('initializes Ertrag mode when routing with vorgang Ertrag and supports queryParam preselection', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [BookingFormComponent],
        providers: [
          provideRouter([{ path: 'bookings', component: DummyBookingsComponent }]),
          { provide: BookingService, useValue: mockBookingService },
          { provide: AccountService, useValue: mockAccountService },
          { provide: SecuritiesService, useValue: mockSecuritiesService },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                data: { vorgang: 'Ertrag' },
                paramMap: new Map(),
                queryParamMap: new Map([
                  ['depotId', '3'],
                  ['securityId', '10'],
                ]),
              },
            },
          },
        ],
      }).compileComponents();

      const incomeFixture = TestBed.createComponent(BookingFormComponent);
      const incomeComp = incomeFixture.componentInstance;
      incomeFixture.detectChanges();

      expect(incomeComp.booking.vorgang).toBe('Ertrag');
      expect(incomeComp.isIncome()).toBe(true);
      expect(incomeComp.booking.incomeDetails?.depot_account_id).toBe(3);
      expect(incomeComp.booking.incomeDetails?.security_id).toBe(10);
    });

    it('preselects income account based on security type (Aktie -> Dividende, Anleihe -> Zins, ETF -> Fondsertrag)', () => {
      component.booking.vorgang = 'Ertrag';
      component.booking.incomeDetails = component.createEmptyIncomeDetails();
      component.incomeAccounts = [
        { id: 101, name: 'Dividende', type: 'GuV', subtype: 'Ertrag' },
        { id: 102, name: 'Zins', type: 'GuV', subtype: 'Ertrag' },
        { id: 103, name: 'Fondsertrag', type: 'GuV', subtype: 'Ertrag' },
      ];
      component.securities = [
        { id: 1, name: 'Apple', type: 'Aktie', isin: 'US1', wkn: '1' },
        { id: 2, name: 'Bundesanleihe', type: 'Anleihe', isin: 'DE1', wkn: '2' },
        { id: 3, name: 'MSCI World', type: 'ETF', isin: 'IE1', wkn: '3' },
      ];

      // 1. Aktie
      component.booking.incomeDetails.security_id = 1;
      component.onIncomeSecurityChange();
      expect(component.booking.incomeDetails.income_account_id).toBe(101);

      // 2. Anleihe
      component.booking.incomeDetails.security_id = 2;
      component.onIncomeSecurityChange();
      expect(component.booking.incomeDetails.income_account_id).toBe(102);

      // 3. ETF
      component.booking.incomeDetails.security_id = 3;
      component.onIncomeSecurityChange();
      expect(component.booking.incomeDetails.income_account_id).toBe(103);
    });

    it('calculates deductions and net income', () => {
      component.booking.vorgang = 'Ertrag';
      component.booking.incomeDetails = {
        depot_account_id: 3,
        security_id: 1,
        settlement_account_id: 1,
        income_account_id: 101,
        gross_amount: 100,
        capital_gains_tax: 25,
        solidarity_surcharge: 1.37,
      };

      expect(component.getIncomeDeductions()).toBe(26.37);
      expect(component.getIncomeNet()).toBe(73.63);
    });

    it('submits valid Ertrag booking through bookingService.create', async () => {
      const router = TestBed.inject(Router);
      const navSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

      component.booking = {
        vorgang: 'Ertrag',
        date: '2026-08-20',
        positions: [],
        incomeDetails: {
          depot_account_id: 3,
          security_id: 1,
          settlement_account_id: 1,
          income_account_id: 101,
          gross_amount: 100,
          capital_gains_tax: 25,
          solidarity_surcharge: 1.37,
        },
      };

      await component.onSubmit();

      expect(mockBookingService.create).toHaveBeenCalledWith(component.booking);
      expect(navSpy).toHaveBeenCalledWith('/bookings');
    });
  });
});
