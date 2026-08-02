import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { Account } from '../../../models/account.model';
import { Booking } from '../../../models/booking.model';
import { DepotPosition, DepotPositionSummary, DepotPurchaseHistoryItem } from '../../../models/depot-position.model';
import { Security } from '../../../models/security.model';
import { AccountService } from '../../../services/account.service';
import { BookingService } from '../../../services/booking.service';
import { DepotPositionsService } from '../../../services/depot-positions.service';
import { SecuritiesService } from '../../../services/securities.service';

type DepotSummaryRow = DepotPositionSummary & {
  purchases: DepotPosition[];
  expanded: boolean;
};

@Component({
  selector: 'app-depot-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './depot-detail.component.html'
})
export class DepotDetailComponent implements OnInit {
  account: Account | null = null;
  summaryRows: DepotSummaryRow[] = [];
  purchaseHistory: DepotPurchaseHistoryItem[] = [];
  expandedSecurityIds = new Set<number>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private depotPositionsService: DepotPositionsService,
    private bookingService: BookingService,
    private securitiesService: SecuritiesService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.loadDepot();
  }

  async loadDepot() {
    const accountId = Number(this.route.snapshot.paramMap.get('id'));
    try {
      if (!accountId) {
        this.account = null;
        this.summaryRows = [];
        this.purchaseHistory = [];
        return;
      }

      const [account, positions, bookings, securities] = await Promise.all([
        this.accountService.getById(accountId),
        this.depotPositionsService.getByDepot(accountId),
        this.bookingService.getAll(),
        this.securitiesService.getAll()
      ]);

      if (!account || account.subtype !== 'Depot') {
        this.account = null;
        this.summaryRows = [];
        this.purchaseHistory = [];
        this.router.navigate(['/accounts']);
        return;
      }

      this.account = account;

      const securityMap = new Map<number, Security>(
        securities
          .filter((security): security is Security & { id: number } => security.id !== undefined)
          .map((security) => [security.id, security])
      );

      const grouped = new Map<number, DepotPosition[]>();
      for (const position of positions) {
        const current = grouped.get(position.security_id) ?? [];
        current.push(position);
        grouped.set(position.security_id, current);
      }

      this.summaryRows = Array.from(grouped.entries())
        .map(([securityId, purchases]) => this.buildSummaryRow(securityId, purchases, securityMap))
        .filter((row): row is DepotSummaryRow => row !== null);

      this.purchaseHistory = this.buildPurchaseHistory(bookings, accountId, securityMap);
    } finally {
      this.cdr.detectChanges();
    }
  }

  toggleSecurityDetails(securityId: number): void {
    if (this.expandedSecurityIds.has(securityId)) {
      this.expandedSecurityIds.delete(securityId);
    } else {
      this.expandedSecurityIds.add(securityId);
    }

    this.summaryRows = this.summaryRows.map((row) =>
      row.security_id === securityId ? { ...row, expanded: this.expandedSecurityIds.has(securityId) } : row
    );
  }

  private buildSummaryRow(
    securityId: number,
    purchases: DepotPosition[],
    securityMap: Map<number, Security>
  ): DepotSummaryRow | null {
    const security = securityMap.get(securityId);
    if (!security) {
      return null;
    }

    const totalQuantity = purchases.reduce((sum, item) => sum + item.quantity, 0);
    const totalPurchaseValue = purchases.reduce((sum, item) => sum + item.quantity * item.price_per_unit, 0);

    return {
      security_id: securityId,
      security_name: security.name,
      security_type: security.type,
      isin: security.isin,
      total_quantity: totalQuantity,
      average_price_per_unit: totalQuantity > 0 ? totalPurchaseValue / totalQuantity : 0,
      total_purchase_value: totalPurchaseValue,
      first_purchase_date: purchases.map((item) => item.purchase_date).sort()[0],
      purchases,
      expanded: this.expandedSecurityIds.has(securityId)
    };
  }

  private buildPurchaseHistory(
    bookings: Booking[],
    accountId: number,
    securityMap: Map<number, Security>
  ): DepotPurchaseHistoryItem[] {
    return bookings
      .filter((booking) => booking.vorgang === 'Kauf' && booking.purchaseDetails?.depot_account_id === accountId)
      .map((booking) => ({
        booking_id: booking.id!,
        booking_date: booking.date,
        security_name: securityMap.get(booking.purchaseDetails!.security_id)?.name ?? '-',
        quantity: booking.purchaseDetails!.quantity,
        price_per_unit: booking.purchaseDetails!.price_per_unit,
        total_amount:
          booking.purchaseDetails!.quantity * booking.purchaseDetails!.price_per_unit +
          (booking.purchaseDetails!.fees ?? 0) +
          (booking.purchaseDetails!.accrued_interest ?? 0)
      }))
      .sort((left, right) => right.booking_date.localeCompare(left.booking_date));
  }
}
