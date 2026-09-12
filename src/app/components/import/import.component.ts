import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { BookingService } from '../../services/booking.service';
import { ImportParserService } from '../../services/import/import-parser.service';
import { decodeCsvBuffer, formatIsoToGermanDate } from '../../services/import/csv-utils';
import { Account } from '../../models/account.model';
import { Booking } from '../../models/booking.model';
import { ImportType, Institution } from '../../services/import/import-parser.types';

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
    return this.parsedBookings.reduce((sum, booking) => {
      return sum + (booking.positions[0]?.amount || 0);
    }, 0);
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
      this.step = 2;
    } catch (err: any) {
      console.error('Failed to parse import file:', err);
      this.parseError = err?.message || 'Fehler beim Einlesen der CSV-Datei.';
    } finally {
      this.isReadingFile = false;
      this.cdr.detectChanges();
    }
  }

  hasMissingContraAccount(booking: Booking): boolean {
    return !booking.positions[1] || !booking.positions[1].account_id || booking.positions[1].account_id === 0;
  }

  async onFinish(): Promise<void> {
    this.submitted = true;
    this.saveError = null;

    const missing = this.parsedBookings.filter(b => this.hasMissingContraAccount(b));
    if (missing.length > 0) {
      this.saveError = 'Bitte wählen Sie für alle Buchungen ein Gegenkonto aus.';
      return;
    }

    this.saving = true;
    try {
      for (const booking of this.parsedBookings) {
        await this.bookingService.create(booking);
      }
      const count = this.parsedBookings.length;
      this.step = 1;
      this.parsedBookings = [];
      this.selectedFile = null;
      this.selectedFileName = '';
      this.submitted = false;
      this.successMessage = `${count} Buchungen wurden erfolgreich importiert.`;
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
