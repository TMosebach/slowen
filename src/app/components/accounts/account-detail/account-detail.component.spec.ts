import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { AccountDetailComponent } from './account-detail.component';
import { AccountService } from '../../../services/account.service';
import { BookingService } from '../../../services/booking.service';
import { Account } from '../../../models/account.model';
import { Booking } from '../../../models/booking.model';

registerLocaleData(localeDe);

describe('AccountDetailComponent', () => {
  let component: AccountDetailComponent;
  let fixture: ComponentFixture<AccountDetailComponent>;
  let mockAccountService: { getById: ReturnType<typeof vi.fn>; getAll: ReturnType<typeof vi.fn> };
  let mockBookingService: { getAll: ReturnType<typeof vi.fn> };

  const mockAccount: Account = {
    id: 1,
    name: 'Girokonto',
    type: 'Bestand',
    subtype: 'Giro',
    iban: 'DE1234567890',
    notes: 'Hauptkonto'
  };

  const mockAllAccounts: Account[] = [
    mockAccount,
    { id: 2, name: 'Supermarkt', type: 'GuV', subtype: 'Aufwand' },
    { id: 3, name: 'Gehalt', type: 'GuV', subtype: 'Ertrag' },
    { id: 4, name: 'Tagesgeld', type: 'Bestand', subtype: 'Tagesgeld' }
  ];

  const mockBookings: Booking[] = [
    {
      id: 101,
      vorgang: 'Buchung',
      date: '2026-09-01',
      description: 'Lebensmitteleinkauf',
      sender_receiver: 'REWE',
      positions: [
        { account_id: 1, valuta: '2026-09-01', amount: -50 },
        { account_id: 2, valuta: '2026-09-01', amount: 50 }
      ]
    },
    {
      id: 102,
      vorgang: 'Buchung',
      date: '2026-09-05',
      description: 'Gehaltszahlung',
      sender_receiver: 'Arbeitgeber GmbH',
      positions: [
        { account_id: 1, valuta: '2026-09-05', amount: 3000 },
        { account_id: 3, valuta: '2026-09-05', amount: -3000 }
      ]
    },
    {
      id: 103,
      vorgang: 'Buchung',
      date: '2026-09-10',
      description: 'Splitbuchung',
      sender_receiver: 'Gemischt',
      positions: [
        { account_id: 1, valuta: '2026-09-10', amount: -120 },
        { account_id: 2, valuta: '2026-09-10', amount: 100 },
        { account_id: 4, valuta: '2026-09-10', amount: 20 }
      ]
    },
    {
      id: 104,
      vorgang: 'Buchung',
      date: '2026-09-12',
      description: 'Unbeteiligte Buchung',
      sender_receiver: 'Dritte',
      positions: [
        { account_id: 2, valuta: '2026-09-12', amount: 50 },
        { account_id: 4, valuta: '2026-09-12', amount: -50 }
      ]
    }
  ];

  beforeEach(async () => {
    mockAccountService = {
      getById: vi.fn().mockResolvedValue(mockAccount),
      getAll: vi.fn().mockResolvedValue(mockAllAccounts)
    };

    mockBookingService = {
      getAll: vi.fn().mockResolvedValue(mockBookings)
    };

    await TestBed.configureTestingModule({
      imports: [AccountDetailComponent],
      providers: [
        provideRouter([]),
        { provide: LOCALE_ID, useValue: 'de-DE' },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
        { provide: AccountService, useValue: mockAccountService },
        { provide: BookingService, useValue: mockBookingService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create and load account details and bookings', async () => {
    fixture.detectChanges();
    await component.loadData();

    expect(component.account).toEqual(mockAccount);
    expect(component.loading).toBe(false);
    expect(component.error).toBeNull();
  });

  it('should calculate saldo correctly from matching positions', async () => {
    await component.loadData();

    // Matching bookings for account 1:
    // 101: -50
    // 102: +3000
    // 103: -120
    // Total = 2830
    expect(component.saldo).toBe(2830);
  });

  it('should filter only bookings that have positions for this account and sort descending by date', async () => {
    await component.loadData();

    expect(component.bookings.length).toBe(3);
    // Ordered by date desc: 2026-09-10 (103), 2026-09-05 (102), 2026-09-01 (101)
    expect(component.bookings[0].id).toBe(103);
    expect(component.bookings[1].id).toBe(102);
    expect(component.bookings[2].id).toBe(101);
  });

  it('should handle 2-position bookings with counter account name', async () => {
    await component.loadData();

    const booking102 = component.bookings.find(b => b.id === 102);
    expect(booking102).toBeDefined();
    expect(booking102?.positionsCount).toBe(2);
    expect(booking102?.counterAccountName).toBe('Gehalt');
    expect(booking102?.valuta).toBe('2026-09-05');
    expect(booking102?.amount).toBe(3000);
  });

  it('should handle >2-position bookings with detailed position list', async () => {
    await component.loadData();

    const booking103 = component.bookings.find(b => b.id === 103);
    expect(booking103).toBeDefined();
    expect(booking103?.positionsCount).toBe(3);
    expect(booking103?.positions.length).toBe(3);
    expect(booking103?.positions[0].accountName).toBe('Girokonto');
    expect(booking103?.positions[0].isCurrentAccount).toBe(true);
    expect(booking103?.positions[1].accountName).toBe('Supermarkt');
    expect(booking103?.positions[1].isCurrentAccount).toBe(false);
  });

  it('should render header card with name, type, subtype, iban, and saldo formatted in German in DOM', async () => {
    fixture.detectChanges();
    await component.loadData();
    fixture.detectChanges();

    const nativeEl = fixture.nativeElement as HTMLElement;
    expect(nativeEl.querySelector('h1')?.textContent).toContain('Girokonto');
    expect(nativeEl.textContent).toContain('Bestand');
    expect(nativeEl.textContent).toContain('Giro');
    expect(nativeEl.textContent).toContain('DE1234567890');
    expect(nativeEl.textContent).toContain('2.830,00 €');
    expect(nativeEl.textContent).toContain('05.09.2026');
  });

  it('should handle account not found error', async () => {
    mockAccountService.getById.mockResolvedValue(null);

    await component.loadData();

    expect(component.error).toBe('Konto nicht gefunden');
    expect(component.account).toBeNull();
  });
});
