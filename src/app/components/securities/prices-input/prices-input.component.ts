import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SecuritiesService } from '../../../services/securities.service';
import { SecurityPricesService } from '../../../services/security-prices.service';
import { Security } from '../../../models/security.model';
import { SecurityPrice } from '../../../models/security-price.model';

@Component({
  selector: 'app-prices-input',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './prices-input.component.html',
  styleUrls: ['./prices-input.component.scss']
})
export class PricesInputComponent implements OnInit {
  securities: Security[] = [];
  selectedDate: string = this.getTodayISO();
  displayDate: string = this.getTodayDE();
  priceInputs: Map<number, string> = new Map();
  existingPrices: Map<number, SecurityPrice> = new Map();
  loading = true;
  saving = false;
  error: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private securitiesService: SecuritiesService,
    private pricesService: SecurityPricesService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSecurities();
  }

  async loadSecurities() {
    this.loading = true;
    this.error = null;
    try {
      this.securities = await this.securitiesService.getAll();
      await this.loadPricesForDate();
    } catch (err) {
      console.error('Failed to load securities:', err);
      this.error = 'Wertpapiere konnten nicht geladen werden.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async loadPricesForDate() {
    this.existingPrices.clear();
    this.priceInputs.clear();

    try {
      const prices = await this.pricesService.getByDate(this.selectedDate);
      for (const price of prices) {
        this.existingPrices.set(price.security_id, price);
        this.priceInputs.set(price.security_id, this.formatPrice(price.price));
      }
    } catch (err) {
      console.error('Failed to load prices:', err);
    } finally {
      this.cdr.detectChanges();
    }
  }

  async onDateChange(event: any) {
    const dateValue = event.target.value;
    if (dateValue) {
      // Input type="date" gibt bereits YYYY-MM-DD Format
      this.selectedDate = dateValue;
      this.displayDate = this.isoToDE(dateValue);
      await this.loadPricesForDate();
      this.cdr.detectChanges();
    }
  }

  async save() {
    this.saving = true;
    this.errorMessage = null;

    try {
      for (const security of this.securities) {
        const priceStr = this.priceInputs.get(security.id!);
        const existingPrice = this.existingPrices.get(security.id!);

        // Skip wenn leer und kein bisheriger Kurs
        if (!priceStr && !existingPrice) {
          continue;
        }

        if (priceStr) {
          if (!this.validatePriceFormat(priceStr)) {
            this.errorMessage = `Ungültiges Zahlenformat für ${security.name}. Bitte verwenden Sie Zahlen und Komma oder Punkt als Dezimaltrennzeichen.`;
            this.saving = false;
            this.cdr.detectChanges();
            return;
          }

          const price = this.parsePrice(priceStr);
          if (price === null) {
            this.errorMessage = `Fehler beim Parsen des Kurses für ${security.name}`;
            this.saving = false;
            this.cdr.detectChanges();
            return;
          }

          try {
            if (existingPrice) {
              await this.pricesService.update(security.id!, this.selectedDate, price);
            } else {
              await this.pricesService.create(security.id!, this.selectedDate, price);
            }
          } catch (err: any) {
            this.errorMessage = err.message || 'Fehler beim Speichern';
            console.error('Failed to save price:', err);
          }
        }
      }

      if (!this.errorMessage) {
        alert('Kurse gespeichert');
        this.router.navigate(['/securities']);
      }
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }

  cancel() {
    this.router.navigate(['/securities']);
  }

  getPriceInput(securityId: number): string {
    return this.priceInputs.get(securityId) || '';
  }

  setPriceInput(securityId: number, value: string) {
    // Filter: only allow numbers, comma, dot (for decimal input)
    // Accept: 123, 123.45, 123,45 (German and international formats)
    if (!value || /^[\d.,]*$/.test(value)) {
      this.priceInputs.set(securityId, value);
    }
  }

  private validatePriceFormat(priceStr: string): boolean {
    // Check if format is valid: numbers, comma or dot as decimal separator
    return /^\d+([.,]\d+)?$/.test(priceStr.trim());
  }

  private getTodayISO(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  private getTodayDE(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}.${month}.${year}`;
  }

  private deToISO(dateDE: string): string {
    // DD.MM.YYYY -> YYYY-MM-DD
    const parts = dateDE.split('.');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateDE;
  }

  private isoToDE(dateISO: string): string {
    // YYYY-MM-DD -> DD.MM.YYYY
    const parts = dateISO.split('-');
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return dateISO;
  }

  private formatPrice(price: number): string {
    // 1234.56 -> "1.234,56"
    return price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private parsePrice(priceStr: string): number | null {
    // Support both German format "1.234,56" and international "1234.56"
    if (!priceStr) return null;
    try {
      let normalized = priceStr.trim();
      
      // Determine decimal separator by position of last comma or dot
      const lastComma = normalized.lastIndexOf(',');
      const lastDot = normalized.lastIndexOf('.');
      
      if (lastComma > lastDot) {
        // German format: "1.234,56" -> remove all dots (thousands), replace comma with dot
        normalized = normalized.replace(/\./g, '').replace(',', '.');
      } else if (lastDot !== -1) {
        // International or German without thousands: "1234.56" or "31.4"
        // Remove any commas (shouldn't exist, but just in case)
        normalized = normalized.replace(/,/g, '');
      } else {
        // No dot or comma: "31" - just use as-is
        // normalized is already correct
      }
      
      const price = parseFloat(normalized);
      return isNaN(price) ? null : price;
    } catch {
      return null;
    }
  }
}
