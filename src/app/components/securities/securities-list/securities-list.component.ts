import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SecuritiesService } from '../../../services/securities.service';
import { SecurityPricesService } from '../../../services/security-prices.service';
import { Security } from '../../../models/security.model';
import { SecurityPrice } from '../../../models/security-price.model';

@Component({
  selector: 'app-securities-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './securities-list.component.html',
  styleUrls: ['./securities-list.component.scss']
})
export class SecuritiesListComponent implements OnInit {
  securities: Security[] = [];
  latestPrices: Map<number, number | null> = new Map();
  loading = true;
  error: string | null = null;

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
      this.latestPrices.clear();

      for (const security of this.securities) {
        const price = await this.pricesService.getLatest(security.id!);
        this.latestPrices.set(security.id!, price?.price ?? null);
      }
    } catch (err) {
      console.error('Failed to load securities:', err);
      this.error = 'Wertpapiere konnten nicht geladen werden.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  editSecurity(id: number | undefined) {
    if (id) {
      this.router.navigate(['/securities/form', id]);
    }
  }

  createSecurity() {
    this.router.navigate(['/securities/form']);
  }

  goToPrices() {
    this.router.navigate(['/securities/prices']);
  }

  getLatestPrice(securityId: number): string {
    const price = this.latestPrices.get(securityId);
    if (price === null || price === undefined) {
      return '-';
    }
    return this.formatPrice(price);
  }

  private formatPrice(price: number): string {
    return price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
