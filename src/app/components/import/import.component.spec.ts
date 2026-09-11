import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ImportComponent } from './import.component';
import { AccountService } from '../../services/account.service';
import { Account } from '../../models/account.model';

describe('ImportComponent', () => {
  let component: ImportComponent;
  let fixture: ComponentFixture<ImportComponent>;
  let mockAccountService: { getAll: ReturnType<typeof vi.fn> };

  const mockAccounts: Account[] = [
    { id: 1, name: 'Girokonto ING', type: 'Bestand', subtype: 'Giro' },
    { id: 2, name: 'Tagesgeld ING', type: 'Bestand', subtype: 'Tagesgeld' },
    { id: 3, name: 'Depot Comdirect', type: 'Bestand', subtype: 'Depot' },
    { id: 4, name: 'Depot DB', type: 'Bestand', subtype: 'Depot' },
  ];

  beforeEach(async () => {
    mockAccountService = {
      getAll: vi.fn().mockResolvedValue(mockAccounts),
    };

    await TestBed.configureTestingModule({
      imports: [ImportComponent],
      providers: [
        provideRouter([]),
        { provide: AccountService, useValue: mockAccountService },
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
    const file = new File(['Buchungstag;Betrag\n2026-09-01;100.00'], 'umsatz.csv', { type: 'text/csv' });
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

    const file = new File(['a;b\n1;2'], 'test.csv', { type: 'text/csv' });
    component.selectedFile = file;
    component.selectedFileName = 'test.csv';
    component.selectedAccountId = 1;
    component.institution = 'ING';
    component.importType = 'Umsatz';

    expect(component.canLoad).toBeTruthy();

    component.selectedAccountId = null;
    expect(component.canLoad).toBeFalsy();
  });

  it('should parse semicolon-delimited CSV correctly and switch to step 2', async () => {
    const csvContent = 'Buchungsdatum;Verwendungszweck;Betrag\n01.09.2026;Gehalt;2500,00\n02.09.2026;Miete;-800,00';
    const file = new File([csvContent], 'ing_umsatz.csv', { type: 'text/csv' });

    component.selectedFile = file;
    component.selectedFileName = 'ing_umsatz.csv';
    component.selectedAccountId = 1;
    component.institution = 'ING';
    component.importType = 'Umsatz';

    await component.onLoadCsv();

    expect(component.step).toBe(2);
    expect(component.parsedCsv).toBeTruthy();
    expect(component.parsedCsv?.headers).toEqual(['Buchungsdatum', 'Verwendungszweck', 'Betrag']);
    expect(component.parsedCsv?.rows.length).toBe(2);
    expect(component.parsedCsv?.rows[0]).toEqual(['01.09.2026', 'Gehalt', '2500,00']);
    expect(component.parsedCsv?.rows[1]).toEqual(['02.09.2026', 'Miete', '-800,00']);
  });

  it('should parse comma-delimited CSV with quoted strings correctly', () => {
    const csvContent = 'ISIN,Name,Stuecke,Kurs\nUS0378331005,"Apple, Inc.",10,180.50';
    const parsed = component.parseCsv(csvContent);

    expect(parsed.headers).toEqual(['ISIN', 'Name', 'Stuecke', 'Kurs']);
    expect(parsed.rows.length).toBe(1);
    expect(parsed.rows[0]).toEqual(['US0378331005', 'Apple, Inc.', '10', '180.50']);
  });

  it('should return to step 1 and reset state on finish', async () => {
    const csvContent = 'Header1;Header2\nValue1;Value2';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    component.selectedFile = file;
    component.selectedFileName = 'test.csv';
    component.selectedAccountId = 1;

    await component.onLoadCsv();
    expect(component.step).toBe(2);

    component.onFinish();
    expect(component.step).toBe(1);
    expect(component.parsedCsv).toBeNull();
    expect(component.selectedFile).toBeNull();
    expect(component.selectedFileName).toBe('');
  });

  it('should handle empty file with error message', async () => {
    const file = new File([''], 'empty.csv', { type: 'text/csv' });
    component.selectedFile = file;
    component.selectedFileName = 'empty.csv';
    component.selectedAccountId = 1;

    await component.onLoadCsv();
    expect(component.step).toBe(1);
    expect(component.parseError).toBeTruthy();
  });
});
