import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { DepotDetailComponent } from './depot-detail.component';
import { AccountService } from '../../../services/account.service';
import { BookingService } from '../../../services/booking.service';
import { DepotPositionsService } from '../../../services/depot-positions.service';
import { SecuritiesService } from '../../../services/securities.service';

describe('DepotDetailComponent', () => {
  let component: DepotDetailComponent;
  let fixture: ComponentFixture<DepotDetailComponent>;
  let mockAccountService: { getById: ReturnType<typeof vi.fn> };
  let mockBookingService: { getAll: ReturnType<typeof vi.fn> };
  let mockDepotPositionsService: { getByDepot: ReturnType<typeof vi.fn> };
  let mockSecuritiesService: { getAll: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockAccountService = {
      getById: vi.fn().mockResolvedValue({
        id: 2,
        name: 'Depotkonto',
        type: 'Bestand',
        subtype: 'Depot',
        iban: '',
        notes: ''
      })
    };

    mockBookingService = {
      getAll: vi.fn().mockResolvedValue([])
    };

    mockDepotPositionsService = {
      getByDepot: vi.fn().mockResolvedValue([])
    };

    mockSecuritiesService = {
      getAll: vi.fn().mockResolvedValue([])
    };

    await TestBed.configureTestingModule({
      imports: [DepotDetailComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '2' } } } },
        { provide: AccountService, useValue: mockAccountService },
        { provide: BookingService, useValue: mockBookingService },
        { provide: DepotPositionsService, useValue: mockDepotPositionsService },
        { provide: SecuritiesService, useValue: mockSecuritiesService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DepotDetailComponent);
    component = fixture.componentInstance;
  });

  it('renders the depot page after async data loads', async () => {
    fixture.detectChanges();

    await component.loadDepot();

    const heading = fixture.nativeElement.querySelector('h1');
    expect(heading?.textContent).toContain('Depotkonto');
  });

  it('aggregates depot positions by security', async () => {
    mockDepotPositionsService.getByDepot.mockResolvedValue([
      { booking_id: 1, depot_account_id: 2, security_id: 7, quantity: 1, price_per_unit: 100, purchase_date: '2026-08-01' },
      { booking_id: 2, depot_account_id: 2, security_id: 7, quantity: 2, price_per_unit: 110, purchase_date: '2026-08-03' }
    ]);
    mockSecuritiesService.getAll.mockResolvedValue([
      { id: 7, name: 'ETF World', type: 'ETF', isin: 'IE00TEST0001', wkn: 'TEST01' }
    ]);

    await component.loadDepot();

    expect(component.summaryRows).toHaveLength(1);
    expect(component.summaryRows[0].total_quantity).toBe(3);
    expect(component.summaryRows[0].average_price_per_unit).toBe(106.66666666666667);
  });

  it('reduces displayed quantity by matching sale bookings', async () => {
    mockDepotPositionsService.getByDepot.mockResolvedValue([
      { booking_id: 1, depot_account_id: 2, security_id: 7, quantity: 5, price_per_unit: 100, purchase_date: '2026-08-01' }
    ]);

    mockBookingService.getAll.mockResolvedValue([
      {
        id: 11,
        vorgang: 'Verkauf',
        date: '2026-08-05',
        positions: [],
        saleDetails: {
          security_id: 7,
          depot_account_id: 2,
          settlement_account_id: 1,
          quantity: 2,
          price_per_unit: 130
        }
      }
    ]);

    mockSecuritiesService.getAll.mockResolvedValue([
      { id: 7, name: 'ETF World', type: 'ETF', isin: 'IE00TEST0001', wkn: 'TEST01' }
    ]);

    await component.loadDepot();

    expect(component.summaryRows[0].total_quantity).toBe(3);
  });

  it('builds purchase history from purchase bookings of the depot', async () => {
    mockBookingService.getAll.mockResolvedValue([
      {
        id: 1,
        vorgang: 'Kauf',
        date: '2026-08-03',
        positions: [],
        purchaseDetails: {
          security_id: 7,
          depot_account_id: 2,
          settlement_account_id: 1,
          quantity: 2,
          price_per_unit: 110,
          fees: 3,
          accrued_interest: 0
        }
      }
    ]);
    mockSecuritiesService.getAll.mockResolvedValue([
      { id: 7, name: 'ETF World', type: 'ETF', isin: 'IE00TEST0001', wkn: 'TEST01' }
    ]);

    await component.loadDepot();

    expect(component.purchaseHistory[0].total_amount).toBe(223);
  });

  it('toggles the inline purchase details for an aggregated row', async () => {
    mockDepotPositionsService.getByDepot.mockResolvedValue([
      { booking_id: 1, depot_account_id: 2, security_id: 7, quantity: 1, price_per_unit: 100, purchase_date: '2026-08-01' }
    ]);
    mockSecuritiesService.getAll.mockResolvedValue([
      { id: 7, name: 'ETF World', type: 'ETF', isin: 'IE00TEST0001', wkn: 'TEST01' }
    ]);

    await component.loadDepot();
    component.toggleSecurityDetails(7);

    expect(component.summaryRows[0].expanded).toBe(true);
  });

  it('omits aggregated rows with non-positive net quantity', async () => {
    mockDepotPositionsService.getByDepot.mockResolvedValue([
      { booking_id: 1, depot_account_id: 2, security_id: 7, quantity: 0, price_per_unit: 100, purchase_date: '2026-08-01' }
    ]);
    mockSecuritiesService.getAll.mockResolvedValue([
      { id: 7, name: 'ETF World', type: 'ETF', isin: 'IE00TEST0001', wkn: 'TEST01' }
    ]);

    await component.loadDepot();

    expect(component.summaryRows).toEqual([]);
  });

  it('redirects to the account list when the account is not a depot', async () => {
    mockAccountService.getById.mockResolvedValue({
      id: 1,
      name: 'Girokonto',
      type: 'Bestand',
      subtype: 'Giro',
      iban: '',
      notes: ''
    });

    const routerSpy = vi.spyOn(component['router'], 'navigate');

    await component.loadDepot();

    expect(routerSpy).toHaveBeenCalledWith(['/accounts']);
    expect(component.summaryRows).toEqual([]);
  });
});
