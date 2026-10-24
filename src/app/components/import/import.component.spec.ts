import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ImportComponent } from './import.component';
import { AccountService } from '../../services/account.service';
import { BookingService } from '../../services/booking.service';
import { ImportParserService } from '../../services/import/import-parser.service';
import { Account } from '../../models/account.model';
import { Booking } from '../../models/booking.model';

describe('ImportComponent', () => {
  let component: ImportComponent;
  let fixture: ComponentFixture<ImportComponent>;
  let mockAccountService: { getAll: ReturnType<typeof vi.fn> };
  let mockBookingService: {
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    getByAccountAndPeriod: ReturnType<typeof vi.fn>;
  };
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
      positions: [
        { account_id: 1, valuta: '2026-09-01', amount: 2500 },
        { account_id: 0, valuta: '2026-09-01', amount: -2500 }
      ]
    },
    {
      vorgang: 'Buchung',
      date: '2026-09-02',
      sender_receiver: 'Supermarkt AG',
      description: 'Lebensmittel',
      positions: [
        { account_id: 1, valuta: '2026-09-02', amount: -50 },
        { account_id: 0, valuta: '2026-09-02', amount: 50 }
      ]
    }
  ];

  beforeEach(async () => {
    mockAccountService = {
      getAll: vi.fn().mockResolvedValue(mockAccounts),
    };
    mockBookingService = {
      create: vi.fn().mockImplementation((b: Booking) => Promise.resolve({ id: 100, ...b })),
      update: vi.fn().mockImplementation((id: number, b: Booking) => Promise.resolve({ id, ...b })),
      getByAccountAndPeriod: vi.fn().mockResolvedValue([]),
    };
    mockParserService = {
      parse: vi.fn().mockReturnValue(mockBookings.map(b => JSON.parse(JSON.stringify(b)))),
    };

    await TestBed.configureTestingModule({
      imports: [ImportComponent],
      providers: [
        provideRouter([]),
        { provide: AccountService, useValue: mockAccountService },
        { provide: BookingService, useValue: mockBookingService },
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

  it('should parse CSV using parser service and switch to step 2 with formatted dates', async () => {
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

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const dateCells = compiled.querySelectorAll('tbody tr td:nth-child(4)');
    expect(dateCells[0].textContent?.trim()).toBe('01.09.2026');
    expect(dateCells[1].textContent?.trim()).toBe('02.09.2026');
  });

  it('shows error and highlights fields if Gegenkonto is missing on finish', async () => {
    const file = new File(['dummy'], 'test.csv', { type: 'text/csv' });
    component.selectedFile = file;
    component.selectedFileName = 'test.csv';
    component.selectedAccountId = 1;

    await component.onLoadCsv();
    expect(component.step).toBe(2);

    // Only assign 1 of the 2 bookings
    component.parsedBookings[0].positions[1].account_id = 2;
    component.parsedBookings[1].positions[1].account_id = 0; // Missing

    await component.onFinish();

    expect(component.step).toBe(2);
    expect(component.saveError).toContain('Bitte wählen Sie für alle Buchungen ein Gegenkonto aus');
    expect(mockBookingService.create).not.toHaveBeenCalled();

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const selects = compiled.querySelectorAll('tbody tr select');
    expect(selects[1].classList.contains('border-red-500')).toBe(true);
  });

  it('saves all bookings and returns to step 1 with success message when all Gegenkonten are chosen', async () => {
    const file = new File(['dummy'], 'test.csv', { type: 'text/csv' });
    component.selectedFile = file;
    component.selectedFileName = 'test.csv';
    component.selectedAccountId = 1;

    await component.onLoadCsv();
    expect(component.step).toBe(2);

    // Assign all Gegenkonten
    component.parsedBookings[0].positions[1].account_id = 2;
    component.parsedBookings[1].positions[1].account_id = 3;

    await component.onFinish();

    expect(mockBookingService.create).toHaveBeenCalledTimes(2);
    expect(component.step).toBe(1);
    expect(component.successMessage).toContain('2 Buchungen wurden erfolgreich importiert');
    expect(component.parsedBookings).toEqual([]);
    expect(component.selectedFile).toBeNull();
  });

  it('handles booking save errors gracefully', async () => {
    mockBookingService.create.mockRejectedValue(new Error('DB Fehler beim Speichern'));

    const file = new File(['dummy'], 'test.csv', { type: 'text/csv' });
    component.selectedFile = file;
    component.selectedFileName = 'test.csv';
    component.selectedAccountId = 1;

    await component.onLoadCsv();
    component.parsedBookings[0].positions[1].account_id = 2;
    component.parsedBookings[1].positions[1].account_id = 3;

    await component.onFinish();

    expect(component.step).toBe(2);
    expect(component.saveError).toBe('DB Fehler beim Speichern');
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

  it('loads existing bookings for extended period (±2 days) and displays them with Vorhanden badge', async () => {
    const existing: Booking[] = [
      {
        id: 50,
        vorgang: 'Buchung',
        date: '2026-08-31',
        sender_receiver: 'Vermieter',
        description: 'Miete',
        positions: [
          { account_id: 1, valuta: '2026-08-31', amount: -600 },
          { account_id: 2, valuta: '2026-08-31', amount: 600 }
        ]
      }
    ];
    mockBookingService.getByAccountAndPeriod.mockResolvedValue(existing);

    const file = new File(['dummy'], 'test.csv', { type: 'text/csv' });
    component.selectedFile = file;
    component.selectedFileName = 'test.csv';
    component.selectedAccountId = 1;
    component.importType = 'Umsatz';

    await component.onLoadCsv();

    // Min date is 2026-09-01, max is 2026-09-02 -> extended period: 2026-08-30 to 2026-09-04
    expect(mockBookingService.getByAccountAndPeriod).toHaveBeenCalledWith(1, '2026-08-30', '2026-09-04');
    expect(component.tableItems.length).toBe(3); // 1 existing + 2 import
    expect(component.existingCount).toBe(1);
    expect(component.importCount).toBe(2);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const badges = compiled.querySelectorAll('tbody tr td:nth-child(2)');
    expect(badges[0].textContent?.trim()).toContain('Vorhanden');
  });

  it('detects potential duplicates and marks them with Dublette? badge', async () => {
    // Existing booking matching second mock booking: amount -50, date 2026-09-02 (within 2 days)
    const existing: Booking[] = [
      {
        id: 51,
        vorgang: 'Buchung',
        date: '2026-09-03', // 1 day difference
        sender_receiver: 'Supermarkt alt',
        description: 'Lebensmittel Vorab',
        positions: [
          { account_id: 1, valuta: '2026-09-03', amount: -50 },
          { account_id: 2, valuta: '2026-09-03', amount: 50 }
        ]
      }
    ];
    mockBookingService.getByAccountAndPeriod.mockResolvedValue(existing);

    const file = new File(['dummy'], 'test.csv', { type: 'text/csv' });
    component.selectedFile = file;
    component.selectedFileName = 'test.csv';
    component.selectedAccountId = 1;

    await component.onLoadCsv();

    const suspectRow = component.tableItems.find(item => item.source === 'import' && item.amount === -50);
    expect(suspectRow?.isDuplicateSuspect).toBe(true);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Dublette?');
  });

  it('allows ignoring an import booking: omits Gegenkonto validation and does not save ignored booking', async () => {
    const file = new File(['dummy'], 'test.csv', { type: 'text/csv' });
    component.selectedFile = file;
    component.selectedFileName = 'test.csv';
    component.selectedAccountId = 1;

    await component.onLoadCsv();

    // Mark 2nd booking as ignored
    const itemToIgnore = component.tableItems.find(item => item.source === 'import' && item.amount === -50);
    expect(itemToIgnore).toBeDefined();
    itemToIgnore!.ignored = true;

    // Set Gegenkonto only for the active 1st booking
    const activeItem = component.tableItems.find(item => item.source === 'import' && !item.ignored);
    activeItem!.booking.positions[1].account_id = 2;

    await component.onFinish();

    // Only 1 booking created
    expect(mockBookingService.create).toHaveBeenCalledTimes(1);
    expect(component.step).toBe(1);
    expect(component.successMessage).toContain('1 Buchungen wurden erfolgreich importiert, 1 ignoriert.');
  });

  it('updates modified existing booking on finish', async () => {
    const existing: Booking[] = [
      {
        id: 52,
        vorgang: 'Buchung',
        date: '2026-09-01',
        sender_receiver: 'Alter Empfänger',
        description: 'Alte Verwendung',
        positions: [
          { account_id: 1, valuta: '2026-09-01', amount: 100 },
          { account_id: 2, valuta: '2026-09-01', amount: -100 }
        ]
      }
    ];
    mockBookingService.getByAccountAndPeriod.mockResolvedValue(existing);

    const file = new File(['dummy'], 'test.csv', { type: 'text/csv' });
    component.selectedFile = file;
    component.selectedFileName = 'test.csv';
    component.selectedAccountId = 1;

    await component.onLoadCsv();

    // Modify existing booking
    const existingItem = component.tableItems.find(item => item.source === 'existing');
    expect(existingItem).toBeDefined();
    existingItem!.sender_receiver = 'Neuer Empfänger';
    existingItem!.description = 'Neue Verwendung';
    existingItem!.date = '2026-09-02';
    existingItem!.valuta = '2026-09-03';

    // Assign Gegenkonten for import items
    const importItems = component.tableItems.filter(item => item.source === 'import');
    importItems[0].booking.positions[1].account_id = 2;
    importItems[1].booking.positions[1].account_id = 2;

    await component.onFinish();

    expect(mockBookingService.update).toHaveBeenCalledWith(52, expect.objectContaining({
      id: 52,
      sender_receiver: 'Neuer Empfänger',
      description: 'Neue Verwendung',
      date: '2026-09-02',
      positions: [
        { account_id: 1, valuta: '2026-09-03', amount: 100 },
        { account_id: 2, valuta: '2026-09-03', amount: -100 }
      ]
    }));
    expect(mockBookingService.create).toHaveBeenCalledTimes(2);
    expect(component.successMessage).toContain('1 vorhandene Buchungen aktualisiert');
  });
});
