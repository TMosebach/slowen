import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { ImportParserService } from '../../services/import/import-parser.service';
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

  constructor(
    private accountService: AccountService,
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
      const posSum = booking.positions.reduce((pSum, pos) => pSum + (pos.amount || 0), 0);
      return sum + posSum;
    }, 0);
  }

  onFileSelected(event: Event): void {
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

  onFinish(): void {
    this.step = 1;
    this.parsedBookings = [];
    this.selectedFile = null;
    this.selectedFileName = '';
  }

  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei.'));
      reader.readAsText(file);
    });
  }
}
