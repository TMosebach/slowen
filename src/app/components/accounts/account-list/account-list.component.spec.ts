import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AccountListComponent } from './account-list.component';
import { AccountService } from '../../../services/account.service';

describe('AccountListComponent', () => {
  let component: AccountListComponent;
  let fixture: ComponentFixture<AccountListComponent>;
  let mockService: any;

  const mockAccounts = [
    { id: 1, name: 'Girokonto', type: 'Bestand', subtype: 'Giro' },
    { id: 2, name: 'Tagesgeld', type: 'Bestand', subtype: 'Tagesgeld' },
  ];

  beforeEach(async () => {
    mockService = {
      getAll: vi.fn().mockResolvedValue(mockAccounts),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [AccountListComponent],
      providers: [
        provideRouter([]),
        { provide: AccountService, useValue: mockService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load accounts on init', () => {
    expect(component.accounts.length).toBe(2);
    expect(component.accounts[0].name).toBe('Girokonto');
    expect(component.loading).toBeFalsy();
  });

  it('should not call service.delete when deleteAccount is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    await component.deleteAccount(1);
    expect(mockService.delete).not.toHaveBeenCalled();
  });

  it('should call service.delete when deleteAccount is confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await component.deleteAccount(1);
    expect(mockService.delete).toHaveBeenCalledWith(1);
    expect(mockService.getAll).toHaveBeenCalled();
  });

  it('shows a detail link for every account name', async () => {
    mockService.getAll.mockResolvedValue([
      { id: 1, name: 'Girokonto', type: 'Bestand', subtype: 'Giro' },
      { id: 2, name: 'Tagesgeld', type: 'Bestand', subtype: 'Tagesgeld' },
    ]);

    await component.loadAccounts();
    fixture.detectChanges();

    const anchorNodes = fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;
    const links = Array.from(anchorNodes).map((link) => ({
      text: link.textContent?.trim(),
      href: link.getAttribute('href')
    }));

    expect(links).toContainEqual({ text: 'Girokonto', href: '/accounts/1' });
    expect(links).toContainEqual({ text: 'Tagesgeld', href: '/accounts/2' });
  });

  it('shows a depot detail link for depot accounts only', async () => {
    mockService.getAll.mockResolvedValue([
      { id: 1, name: 'Girokonto', type: 'Bestand', subtype: 'Giro' },
      { id: 2, name: 'Depotkonto', type: 'Bestand', subtype: 'Depot' },
    ]);

    await component.loadAccounts();
    fixture.detectChanges();

    const anchorNodes = fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;
    const links = Array.from(anchorNodes).map((link) => ({
      text: link.textContent?.trim(),
      href: link.getAttribute('href')
    }));

    expect(links).toContainEqual({ text: 'Bestand', href: '/accounts/2/depot' });
    expect(links).not.toContainEqual({ text: 'Bestand', href: '/accounts/1/depot' });
  });

  it('hides edit and delete actions for protected system accounts', async () => {
    mockService.getAll.mockResolvedValue([
      { id: 1, name: 'Wertpapierprovision', type: 'GuV', subtype: 'Aufwand' },
      { id: 2, name: 'Normales Konto', type: 'Bestand', subtype: 'Giro' },
    ]);

    await component.loadAccounts();
    fixture.detectChanges();

    const rows = Array.from(fixture.nativeElement.querySelectorAll('tbody tr')) as HTMLTableRowElement[];
    const protectedRow = rows.find((row) => row.textContent?.includes('Wertpapierprovision'));
    const normalRow = rows.find((row) => row.textContent?.includes('Normales Konto'));

    expect(protectedRow?.textContent).toContain('Systemkonto');
    expect(protectedRow?.textContent).not.toContain('Bearbeiten');
    expect(protectedRow?.textContent).not.toContain('Löschen');
    expect(normalRow?.textContent).toContain('Bearbeiten');
    expect(normalRow?.textContent).toContain('Löschen');
  });

  it('keeps a duplicate system account deletable so it can be remediated', async () => {
    mockService.getAll.mockResolvedValue([
      { id: 3, name: 'Wertpapierprovision', type: 'GuV', subtype: 'Aufwand' },
      { id: 5, name: 'Wertpapierprovision', type: 'GuV', subtype: 'Aufwand' },
    ]);

    await component.loadAccounts();
    fixture.detectChanges();

    const rows = Array.from(fixture.nativeElement.querySelectorAll('tbody tr')) as HTMLTableRowElement[];
    const canonicalRow = rows.find((row) => row.textContent?.includes('Wertpapierprovision'));

    expect(component.isProtectedSystemAccount({ id: 3, name: 'Wertpapierprovision', type: 'GuV', subtype: 'Aufwand' })).toBe(true);
    expect(component.isProtectedSystemAccount({ id: 5, name: 'Wertpapierprovision', type: 'GuV', subtype: 'Aufwand' })).toBe(false);
  });
});
