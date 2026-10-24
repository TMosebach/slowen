import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { BookingService } from '../../services/booking.service';
import { ImportParserService } from '../../services/import/import-parser.service';
import { addDaysToIso, dateDiffInDays, decodeCsvBuffer, formatIsoToGermanDate } from '../../services/import/csv-utils';
import { Account } from '../../models/account.model';
import { Booking } from '../../models/booking.model';
import { ImportType, Institution } from '../../services/import/import-parser.types';

export interface ImportRowItem {
  id?: number;
  source: 'import' | 'existing';
  ignored: boolean;
  isDuplicateSuspect: boolean;
  booking: Booking;
  date: string;
  valuta: string;
  sender_receiver: string;
  description: string;
  amount: number;
  originalDate: string;
  originalValuta: string;
  originalSenderReceiver: string;
  originalDescription: string;
  contraAccountName?: string;
}

@Component({
  selector: 'app-import',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './import.component.html'
})
export class ImportComponent implements OnInit {
  step: 1 | 2 = 1;

  importType: ImportType = 'Umsatz';
  institution: Institution = 'ING';
  selectedAccountId: number | null = null;
  selectedFile: File | null = null;
  selectedFileName = '';

  institutions: Institution[] = ['ING', 'Comdirect', 'Deutsche Bank'];
  accounts: Account[] = [];
  loadingAccounts = false;
  accountError: string | null = null;

  isReadingFile = false;
  parseError: string | null = null;
  parsedBookings: Booking[] = [];
  tableItems: ImportRowItem[] = [];

  submitted = false;
  saveError: string | null = null;
  successMessage: string | null = null;
  saving = false;

  constructor(
    private accountService: AccountService,
    private bookingService: BookingService,
    private parserService: ImportParserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  async loadAccounts(): Promise<void> {
    this.loadingAccounts = true;
    this.accountError = null;
    try {
      this.accounts = await this.accountService.getAll();
      this.ensureValidAccountSelection();
    } catch (err) {
      console.error('Failed to load accounts for import:', err);
      this.accountError = 'Konten konnten nicht geladen werden.';
    } finally {
      this.loadingAccounts = false;
      this.cdr.detectChanges();
    }
  }

  get availableAccounts(): Account[] {
    if (this.importType === 'Depot-Bestand') {
      return this.accounts.filter(acc => acc.subtype === 'Depot');
    }
    return this.accounts.filter(acc => acc.subtype !== 'Depot');
  }

  onImportTypeChange(): void {
    this.successMessage = null;
    this.ensureValidAccountSelection();
  }

  private ensureValidAccountSelection(): void {
    const available = this.availableAccounts;
    if (this.selectedAccountId !== null) {
      const stillValid = available.some(acc => acc.id === this.selectedAccountId);
      if (!stillValid) {
        this.selectedAccountId = available.length > 0 ? (available[0].id ?? null) : null;
      }
    } else if (available.length > 0) {
      this.selectedAccountId = available[0].id ?? null;
    }
  }

  get selectedAccount(): Account | undefined {
    return this.accounts.find(acc => acc.id === this.selectedAccountId);
  }

  get totalAmount(): number {
    if (this.tableItems.length === 0) {
      return this.parsedBookings.reduce((sum, booking) => {
        return sum + (booking.positions[0]?.amount || 0);
      }, 0);
    }
    return this.tableItems
      .filter(item => item.source === 'import' && !item.ignored)
      .reduce((sum, item) => sum + (item.booking.positions[0]?.amount || 0), 0);
  }

  get importCount(): number {
    return this.tableItems.filter(item => item.source === 'import' && !item.ignored).length;
  }

  get ignoredCount(): number {
    return this.tableItems.filter(item => item.source === 'import' && item.ignored).length;
  }

  get existingCount(): number {
    return this.tableItems.filter(item => item.source === 'existing').length;
  }

  onFileSelected(event: Event): void {
    this.successMessage = null;
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
      this.parseError = null;
    } else {
      this.selectedFile = null;
      this.selectedFileName = '';
    }
  }

  get canLoad(): boolean {
    return (
      !!this.importType &&
      !!this.institution &&
      this.selectedAccountId !== null &&
      this.selectedAccountId !== 0 &&
      !!this.selectedFile &&
      !this.isReadingFile
    );
  }

  async onLoadCsv(): Promise<void> {
    if (!this.canLoad || !this.selectedFile || !this.selectedAccountId) {
      return;
    }

    this.isReadingFile = true;
    this.parseError = null;
    this.successMessage = null;
    this.saveError = null;
    this.submitted = false;

    try {
      const content = await this.readFileContent(this.selectedFile);
      const bookings = this.parserService.parse(content, {
        importType: this.importType,
        institution: this.institution,
        accountId: this.selectedAccountId
      });

      if (!bookings || bookings.length === 0) {
        throw new Error('Es konnten keine Buchungen aus der Datei extrahiert werden.');
      }

      this.parsedBookings = bookings;
      await this.buildTableItems(bookings);
      this.step = 2;
    } catch (err: any) {
      console.error('Failed to parse import file:', err);
      this.parseError = err?.message || 'Fehler beim Einlesen der CSV-Datei.';
    } finally {
      this.isReadingFile = false;
      this.cdr.detectChanges();
    }
  }

  async buildTableItems(bookings: Booking[]): Promise<void> {
    const importItems: ImportRowItem[] = bookings.map(b => {
      const targetPos = b.positions[0];
      return {
        source: 'import',
        ignored: false,
        isDuplicateSuspect: false,
        booking: b,
        date: b.date,
        valuta: targetPos?.valuta || b.date,
        sender_receiver: b.sender_receiver || '',
        description: b.description || '',
        amount: targetPos?.amount || 0,
        originalDate: b.date,
        originalValuta: targetPos?.valuta || b.date,
        originalSenderReceiver: b.sender_receiver || '',
        originalDescription: b.description || ''
      };
    });

    let existingItems: ImportRowItem[] = [];

    if (this.importType === 'Umsatz' && bookings.length > 0 && this.selectedAccountId) {
      let minDate = bookings[0].date;
      let maxDate = bookings[0].date;

      for (const b of bookings) {
        const valuta = b.positions[0]?.valuta || b.date;
        if (b.date < minDate) minDate = b.date;
        if (b.date > maxDate) maxDate = b.date;
        if (valuta < minDate) minDate = valuta;
        if (valuta > maxDate) maxDate = valuta;
      }

      const fromDate = addDaysToIso(minDate, -2);
      const toDate = addDaysToIso(maxDate, 2);

      try {
        const existingBookings = await this.bookingService.getByAccountAndPeriod(
          this.selectedAccountId,
          fromDate,
          toDate
        );

        existingItems = (existingBookings || []).map(b => {
          const targetPos = b.positions.find(p => p.account_id === this.selectedAccountId) || b.positions[0];
          const contraPos = b.positions.find(p => p.account_id !== this.selectedAccountId);
          const contraAcc = contraPos ? this.accounts.find(a => a.id === contraPos.account_id) : undefined;
          const contraAccountName = contraAcc
            ? `${contraAcc.name} (${contraAcc.subtype})`
            : (contraPos ? `Konto #${contraPos.account_id}` : '-');

          const valuta = targetPos?.valuta || b.date;
          return {
            id: b.id,
            source: 'existing',
            ignored: false,
            isDuplicateSuspect: false,
            booking: b,
            date: b.date,
            valuta,
            sender_receiver: b.sender_receiver || '',
            description: b.description || '',
            amount: targetPos?.amount || 0,
            originalDate: b.date,
            originalValuta: valuta,
            originalSenderReceiver: b.sender_receiver || '',
            originalDescription: b.description || '',
            contraAccountName
          };
        });
      } catch (err) {
        console.warn('Could not load existing bookings for period:', err);
      }
    }

    // Identify duplicate suspects for import items
    for (const item of importItems) {
      item.isDuplicateSuspect = existingItems.some(ex => {
        const amountMatch = Math.abs(ex.amount - item.amount) < 0.005;
        if (!amountMatch) return false;
        return (
          dateDiffInDays(item.date, ex.date) <= 2 ||
          dateDiffInDays(item.valuta, ex.valuta) <= 2 ||
          dateDiffInDays(item.date, ex.valuta) <= 2 ||
          dateDiffInDays(item.valuta, ex.date) <= 2
        );
      });
    }

    // Merge and sort chronologically
    this.tableItems = [...existingItems, ...importItems].sort((a, b) => {
      const dateComp = a.date.localeCompare(b.date);
      if (dateComp !== 0) return dateComp;
      const valutaComp = a.valuta.localeCompare(b.valuta);
      if (valutaComp !== 0) return valutaComp;
      if (a.source !== b.source) {
        return a.source === 'existing' ? -1 : 1;
      }
      return 0;
    });
  }

  onIgnoredChange(): void {
    this.saveError = null;
    this.cdr.detectChanges();
  }

  hasMissingContraAccount(booking: Booking): boolean {
    return !booking.positions[1] || !booking.positions[1].account_id || booking.positions[1].account_id === 0;
  }

  async onFinish(): Promise<void> {
    this.submitted = true;
    this.saveError = null;

    if (this.tableItems.length === 0 && this.parsedBookings.length > 0) {
      await this.buildTableItems(this.parsedBookings);
    }

    const activeImports = this.tableItems.filter(item => item.source === 'import' && !item.ignored);
    const missing = activeImports.filter(item => this.hasMissingContraAccount(item.booking));
    if (missing.length > 0) {
      this.saveError = 'Bitte wählen Sie für alle Buchungen ein Gegenkonto aus.';
      return;
    }

    this.saving = true;
    try {
      // 1. Update modified existing bookings
      const modifiedExisting = this.tableItems.filter(item => {
        if (item.source !== 'existing' || !item.booking.id) return false;
        return (
          item.date !== item.originalDate ||
          item.valuta !== item.originalValuta ||
          item.sender_receiver !== item.originalSenderReceiver ||
          item.description !== item.originalDescription
        );
      });

      for (const item of modifiedExisting) {
        const b = item.booking;
        b.date = item.date;
        b.sender_receiver = item.sender_receiver;
        b.description = item.description;

        const targetPos = b.positions.find(p => p.account_id === this.selectedAccountId);
        if (targetPos) {
          targetPos.valuta = item.valuta;
        }
        const contraPos = b.positions.find(p => p.account_id !== this.selectedAccountId);
        if (contraPos && contraPos.valuta === item.originalValuta) {
          contraPos.valuta = item.valuta;
        }

        await this.bookingService.update(b.id!, b);
      }

      // 2. Create active import bookings
      for (const item of activeImports) {
        await this.bookingService.create(item.booking);
      }

      const importedCount = activeImports.length;
      const ignoredCount = this.tableItems.filter(item => item.source === 'import' && item.ignored).length;
      const updatedCount = modifiedExisting.length;

      this.step = 1;
      this.tableItems = [];
      this.parsedBookings = [];
      this.selectedFile = null;
      this.selectedFileName = '';
      this.submitted = false;

      if (ignoredCount === 0 && updatedCount === 0) {
        this.successMessage = `${importedCount} Buchungen wurden erfolgreich importiert.`;
      } else {
        const parts: string[] = [`${importedCount} Buchungen wurden erfolgreich importiert`];
        if (ignoredCount > 0) {
          parts.push(`${ignoredCount} ignoriert`);
        }
        if (updatedCount > 0) {
          parts.push(`${updatedCount} vorhandene Buchungen aktualisiert`);
        }
        this.successMessage = parts.join(', ') + '.';
      }
    } catch (err: any) {
      console.error('Failed to save imported bookings:', err);
      this.saveError = err?.message || 'Fehler beim Speichern der Buchungen.';
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }

  formatDate(isoDate?: string): string {
    return formatIsoToGermanDate(isoDate);
  }

  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const buffer = reader.result as ArrayBuffer;
          const text = decodeCsvBuffer(buffer);
          resolve(text);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei.'));
      reader.readAsArrayBuffer(file);
    });
  }
}
