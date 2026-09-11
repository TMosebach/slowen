import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ImportComponent } from './import.component';
import { AccountService } from '../../services/account.service';
import { ImportParserService } from '../../services/import/import-parser.service';
import { Account } from '../../models/account.model';
import { Booking } from '../../models/booking.model';

describe('ImportComponent', () => {
  let component: ImportComponent;
  let fixture: ComponentFixture<ImportComponent>;
  let mockAccountService: { getAll: ReturnType<typeof vi.fn> };
  let mockParserService: { parse: ReturnType<typeof vi.fn> };

  const mockAccounts: Account[] = [
    { id: 1, name: 'Girokonto ING', type: 'Bestand', subtype: 'Giro' },
    { id: 2, name: 'Tagesgeld ING', type: 'Bestand', subtype: 'Tagesgeld' },
    { id: 3, name: 'Depot Comdirect', type: 'Bestand', subtype: 'Depot' },
    { id: 4, name: 'Depot DB', type: 'Bestand', subtype: 'Depot' },
  ];

  const mockBookings: Booking[] = [
    {
      vorgang: 'Buchung',
      date: '2026-09-01',
      sender_receiver: 'Arbeitgeber GmbH',
      description: 'Gehalt',
      positions: [{ account_id: 1, valuta: '2026-09-01', amount: 2500 }]
    },
    {
      vorgang: 'Buchung',
      date: '2026-09-02',
      sender_receiver: 'Supermarkt AG',
      description: 'Lebensmittel',
      positions: [{ account_id: 1, valuta: '2026-09-02', amount: -50 }]
    }
  ];

  beforeEach(async () => {
    mockAccountService = {
      getAll: vi.fn().mockResolvedValue(mockAccounts),
    };
    mockParserService = {
      parse: vi.fn().mockReturnValue(mockBookings),
    };

    await TestBed.configureTestingModule({
      imports: [ImportComponent],
      providers: [
        provideRouter([]),
        { provide: AccountService, useValue: mockAccountService },
        { provide: ImportParserService, useValue: mockParserService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create and load accounts on init', () => {
    expect(component).toBeTruthy();
    expect(component.step).toBe(1);
    expect(component.accounts.length).toBe(4);
    expect(mockAccountService.getAll).toHaveBeenCalled();
  });

  it('should filter accounts by importType', () => {
    component.importType = 'Umsatz';
    expect(component.availableAccounts.map(a => a.name)).toEqual(['Girokonto ING', 'Tagesgeld ING']);

    component.importType = 'Depot-Bestand';
    expect(component.availableAccounts.map(a => a.name)).toEqual(['Depot Comdirect', 'Depot DB']);
  });

  it('should adjust selectedAccountId when switching importType', () => {
    component.importType = 'Umsatz';
    component.onImportTypeChange();
    expect(component.selectedAccountId).toBe(1);

    component.importType = 'Depot-Bestand';
    component.onImportTypeChange();
    expect(component.selectedAccountId).toBe(3);
  });

  it('should handle file selection', () => {
    const file = new File(['Buchung;Valuta;Betrag\n01.09.2026;01.09.2026;100,00'], 'umsatz.csv', { type: 'text/csv' });
    const event = {
      target: {
        files: [file]
      }
    } as unknown as Event;

    component.onFileSelected(event);
    expect(component.selectedFile).toBe(file);
    expect(component.selectedFileName).toBe('umsatz.csv');
  });

  it('should correctly evaluate canLoad', () => {
    expect(component.canLoad).toBeFalsy(); // no file yet

    const file = new File(['test'], 'test.csv', { type: 'text/csv' });
    component.selectedFile = file;
    component.selectedFileName = 'test.csv';
    component.selectedAccountId = 1;
    component.institution = 'ING';
    component.importType = 'Umsatz';

    expect(component.canLoad).toBeTruthy();

    component.selectedAccountId = null;
    expect(component.canLoad).toBeFalsy();
  });

  it('should parse CSV using parser service and switch to step 2 with bookings', async () => {
    const file = new File(['dummy-csv-content'], 'ing_umsatz.csv', { type: 'text/csv' });

    component.selectedFile = file;
    component.selectedFileName = 'ing_umsatz.csv';
    component.selectedAccountId = 1;
    component.institution = 'ING';
    component.importType = 'Umsatz';

    await component.onLoadCsv();

    expect(mockParserService.parse).toHaveBeenCalledWith('dummy-csv-content', {
      importType: 'Umsatz',
      institution: 'ING',
      accountId: 1
    });

    expect(component.step).toBe(2);
    expect(component.parsedBookings.length).toBe(2);
    expect(component.totalAmount).toBe(2450);
  });

  it('should return to step 1 and reset state on finish', async () => {
    const file = new File(['dummy'], 'test.csv', { type: 'text/csv' });
    component.selectedFile = file;
    component.selectedFileName = 'test.csv';
    component.selectedAccountId = 1;

    await component.onLoadCsv();
    expect(component.step).toBe(2);

    component.onFinish();
    expect(component.step).toBe(1);
    expect(component.parsedBookings).toEqual([]);
    expect(component.selectedFile).toBeNull();
    expect(component.selectedFileName).toBe('');
  });

  it('should display error when parser service throws', async () => {
    mockParserService.parse.mockImplementation(() => {
      throw new Error('Kein Parser für Format gefunden');
    });

    const file = new File(['bad-content'], 'bad.csv', { type: 'text/csv' });
    component.selectedFile = file;
    component.selectedFileName = 'bad.csv';
    component.selectedAccountId = 1;

    await component.onLoadCsv();
    expect(component.step).toBe(1);
    expect(component.parseError).toBe('Kein Parser für Format gefunden');
  });
});
