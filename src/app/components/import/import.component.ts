import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { BookingService } from '../../services/booking.service';
import { SecuritiesService } from '../../services/securities.service';
import { ImportParserService } from '../../services/import/import-parser.service';
import { addDaysToIso, dateDiffInDays, decodeCsvBuffer, formatIsoToGermanDate } from '../../services/import/csv-utils';
import { Account } from '../../models/account.model';
import { Booking, PurchaseBookingDetails, SaleBookingDetails } from '../../models/booking.model';
import { Security } from '../../models/security.model';
import { ImportedBooking, ImportType, Institution } from '../../services/import/import-parser.types';

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
  // Wertpapier-spezifische Felder:
  detectedIsin?: string;
  detectedSecurityName?: string;
  purchaseDetails?: PurchaseBookingDetails;
  saleDetails?: SaleBookingDetails;
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
  securities: Security[] = [];
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
    private securitiesService: SecuritiesService,
    private parserService: ImportParserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
    this.loadSecurities();
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

  async loadSecurities(): Promise<void> {
    try {
      this.securities = await this.securitiesService.getAll();
    } catch (err) {
      console.error('Failed to load securities for import:', err);
    }
  }

  get availableAccounts(): Account[] {
    if (this.importType === 'Depot-Bestand') {
      return this.accounts.filter(acc => acc.subtype === 'Depot');
    }
    return this.accounts.filter(acc => acc.subtype !== 'Depot');
  }

  get depotAccounts(): Account[] {
    return this.accounts.filter(acc => acc.subtype === 'Depot');
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

  async buildTableItems(bookings: ImportedBooking[]): Promise<void> {
    // Refresh securities if needed
    if (this.securities.length === 0) {
      await this.loadSecurities();
    }

    const importItems: ImportRowItem[] = bookings.map(b => {
      const targetPos = b.positions[0];
      const isKauf = b.vorgang === 'Kauf';
      const isTilgung = b.vorgang === 'Tilgung';

      let purchaseDetails: PurchaseBookingDetails | undefined;
      let saleDetails: SaleBookingDetails | undefined;
      let detectedIsin: string | undefined;
      let detectedSecurityName: string | undefined;

      if (isKauf || isTilgung) {
        detectedIsin = b.importMeta?.detectedIsin;
        detectedSecurityName = b.importMeta?.detectedSecurityName;

        let matchedSecurityId = 0;
        if (detectedIsin) {
          const matched = this.securities.find(
            s => s.isin.toUpperCase() === detectedIsin?.toUpperCase()
          );
          if (matched && matched.id) {
            matchedSecurityId = matched.id;
          }
        }

        if (isKauf) {
          purchaseDetails = b.purchaseDetails || {
            settlement_account_id: this.selectedAccountId || 0,
            depot_account_id: 0,
            security_id: matchedSecurityId,
            quantity: 0,
            price_per_unit: 0,
            fees: 0,
            accrued_interest: 0
          };

          if (matchedSecurityId > 0 && purchaseDetails.security_id === 0) {
            purchaseDetails.security_id = matchedSecurityId;
          }

          b.purchaseDetails = purchaseDetails;
        } else if (isTilgung) {
          const defaultPrice = 100;
          const posAmount = targetPos?.amount || 0;
          const suggestedQuantity = posAmount > 0 ? Math.round((posAmount / defaultPrice) * 10000) / 10000 : 0;

          saleDetails = b.saleDetails || {
            settlement_account_id: this.selectedAccountId || 0,
            depot_account_id: 0,
            security_id: matchedSecurityId,
            quantity: suggestedQuantity,
            price_per_unit: defaultPrice,
            fees: 0,
            capital_gains_tax: 0,
            solidarity_surcharge: 0
          };

          if (matchedSecurityId > 0 && saleDetails.security_id === 0) {
            saleDetails.security_id = matchedSecurityId;
          }

          b.saleDetails = saleDetails;
        }
      }

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
        originalDescription: b.description || '',
        detectedIsin,
        detectedSecurityName,
        purchaseDetails,
        saleDetails
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

          let contraAccountName = '-';
          if ((b.vorgang === 'Kauf' || b.vorgang === 'Tilgung') && (b.purchaseDetails || b.saleDetails)) {
            const depotId = b.purchaseDetails?.depot_account_id || b.saleDetails?.depot_account_id;
            const depotAcc = this.accounts.find(a => a.id === depotId);
            contraAccountName = depotAcc ? `Depot: ${depotAcc.name}` : 'Depot';
          } else {
            const contraAcc = contraPos ? this.accounts.find(a => a.id === contraPos.account_id) : undefined;
            contraAccountName = contraAcc
              ? `${contraAcc.name} (${contraAcc.subtype})`
              : (contraPos ? `Konto #${contraPos.account_id}` : '-');
          }

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
            contraAccountName,
            purchaseDetails: b.purchaseDetails
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

  hasMissingContraAccount(item: ImportRowItem): boolean {
    if (item.booking.vorgang === 'Kauf') {
      const d = item.purchaseDetails;
      return !d || !d.depot_account_id || d.depot_account_id === 0;
    }
    if (item.booking.vorgang === 'Tilgung') {
      const d = item.saleDetails;
      return !d || !d.depot_account_id || d.depot_account_id === 0;
    }
    return !item.booking.positions[1] || !item.booking.positions[1].account_id || item.booking.positions[1].account_id === 0;
  }

  hasInvalidPurchaseDetails(item: ImportRowItem): boolean {
    if (item.booking.vorgang !== 'Kauf') {
      return false;
    }
    const d = item.purchaseDetails;
    if (!d) return true;
    return (
      !d.security_id ||
      d.security_id <= 0 ||
      !d.depot_account_id ||
      d.depot_account_id <= 0 ||
      !d.quantity ||
      d.quantity <= 0 ||
      !d.price_per_unit ||
      d.price_per_unit <= 0
    );
  }

  hasInvalidRedemptionDetails(item: ImportRowItem): boolean {
    if (item.booking.vorgang !== 'Tilgung') {
      return false;
    }
    const d = item.saleDetails;
    if (!d) return true;
    const net = (d.quantity || 0) * (d.price_per_unit || 0) - (d.fees || 0) - (d.capital_gains_tax || 0) - (d.solidarity_surcharge || 0);
    return (
      !d.security_id ||
      d.security_id <= 0 ||
      !d.depot_account_id ||
      d.depot_account_id <= 0 ||
      !d.quantity ||
      d.quantity <= 0 ||
      !d.price_per_unit ||
      d.price_per_unit <= 0 ||
      net <= 0
    );
  }

  getRedemptionNet(item: ImportRowItem): number {
    const d = item.saleDetails;
    if (!d) return 0;
    const gross = (d.quantity || 0) * (d.price_per_unit || 0);
    const deductions = (d.fees || 0) + (d.capital_gains_tax || 0) + (d.solidarity_surcharge || 0);
    return gross - deductions;
  }

  getRedemptionDiff(item: ImportRowItem): number {
    const net = this.getRedemptionNet(item);
    return Math.round((net - item.amount) * 100) / 100;
  }

  async onFinish(): Promise<void> {
    this.submitted = true;
    this.saveError = null;

    if (this.tableItems.length === 0 && this.parsedBookings.length > 0) {
      await this.buildTableItems(this.parsedBookings);
    }

    const activeImports = this.tableItems.filter(item => item.source === 'import' && !item.ignored);

    // Validate standard Gegenkonto for non-Kauf and non-Tilgung bookings
    const missingContra = activeImports.filter(item => item.booking.vorgang !== 'Kauf' && item.booking.vorgang !== 'Tilgung' && this.hasMissingContraAccount(item));
    if (missingContra.length > 0) {
      this.saveError = 'Bitte wählen Sie für alle Buchungen ein Gegenkonto aus.';
      return;
    }

    // Validate Kauf bookings
    const invalidPurchases = activeImports.filter(item => item.booking.vorgang === 'Kauf' && this.hasInvalidPurchaseDetails(item));
    if (invalidPurchases.length > 0) {
      this.saveError = 'Bitte vervollständigen Sie die Angaben für alle Wertpapierkäufe (Wertpapier, Depot, Stückzahl, Kurs).';
      return;
    }

    // Validate Tilgung bookings
    const invalidRedemptions = activeImports.filter(item => item.booking.vorgang === 'Tilgung' && this.hasInvalidRedemptionDetails(item));
    if (invalidRedemptions.length > 0) {
      this.saveError = 'Bitte vervollständigen Sie die Angaben für alle Tilgungen (Wertpapier, Depot, Stückzahl, Kurs > 0, Nettozufluss > 0).';
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
        if (item.booking.vorgang === 'Kauf' && item.purchaseDetails) {
          item.booking.purchaseDetails = {
            ...item.purchaseDetails,
            settlement_account_id: this.selectedAccountId!,
            fees: item.purchaseDetails.fees || 0,
            accrued_interest: item.purchaseDetails.accrued_interest || 0
          };
        } else if (item.booking.vorgang === 'Tilgung' && item.saleDetails) {
          item.booking.saleDetails = {
            ...item.saleDetails,
            settlement_account_id: this.selectedAccountId!,
            fees: item.saleDetails.fees || 0,
            capital_gains_tax: item.saleDetails.capital_gains_tax || 0,
            solidarity_surcharge: item.saleDetails.solidarity_surcharge || 0
          };
        }
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
