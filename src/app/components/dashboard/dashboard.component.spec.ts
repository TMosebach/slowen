import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { AccountService } from '../../services/account.service';
import { BookingService } from '../../services/booking.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockAccountService: any;
  let mockBookingService: any;

  const mockAccounts = [
    { id: 1, name: 'Girokonto', type: 'Bestand', subtype: 'Giro' },
    { id: 2, name: 'Tagesgeld', type: 'Bestand', subtype: 'Tagesgeld' }
  ];

  const mockBookings = [
    {
      id: 1,
      vorgang: 'Buchung',
      date: '2026-07-01',
      positions: [
        { account_id: 1, amount: 100 },
        { account_id: 2, amount: 50 }
      ]
    }
  ];

  beforeEach(async () => {
    mockAccountService = { getAll: vi.fn().mockResolvedValue(mockAccounts) };
    mockBookingService = { getAll: vi.fn().mockResolvedValue(mockBookings) };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: AccountService, useValue: mockAccountService },
        { provide: BookingService, useValue: mockBookingService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads accounts and computes balances', () => {
    expect(component.accounts.length).toBe(2);
    expect(component.getBalanceFor(component.accounts[0])).toBe(100);
    expect(component.total).toBe(150);
  });
});
