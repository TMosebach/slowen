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

type SaleEvent = {
  bookingId: number;
  date: string;
  quantity: number;
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

      const saleBookingIds = this.buildSaleBookingIdSet(bookings, accountId);
      const grouped = new Map<number, DepotPosition[]>();
      for (const position of positions) {
        if (saleBookingIds.has(position.booking_id)) {
          continue;
        }

        const current = grouped.get(position.security_id) ?? [];
        current.push(position);
        grouped.set(position.security_id, current);
      }

      const saleEventsBySecurity = this.buildSaleEventsBySecurity(bookings, accountId);

      this.summaryRows = Array.from(grouped.entries())
        .map(([securityId, purchases]) => this.buildSummaryRow(securityId, purchases, securityMap, saleEventsBySecurity))
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
    securityMap: Map<number, Security>,
    saleEventsBySecurity: Map<number, SaleEvent[]>
  ): DepotSummaryRow | null {
    const security = securityMap.get(securityId);
    if (!security) {
      return null;
    }

    const sales = saleEventsBySecurity.get(securityId) ?? [];
    const remainingLots = this.computeRemainingLots(purchases, sales);
    const totalQuantity = remainingLots.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQuantity <= 0) {
      return null;
    }
    const totalPurchaseValue = remainingLots.reduce((sum, item) => sum + item.quantity * item.price_per_unit, 0);

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

  private buildSaleEventsBySecurity(bookings: Booking[], depotAccountId: number): Map<number, SaleEvent[]> {
    const map = new Map<number, SaleEvent[]>();

    for (const booking of bookings) {
      if (
        booking.vorgang !== 'Verkauf'
        || booking.id === undefined
        || booking.saleDetails?.depot_account_id !== depotAccountId
      ) {
        continue;
      }

      const securityId = booking.saleDetails.security_id;
      const current = map.get(securityId) ?? [];
      current.push({
        bookingId: booking.id,
        date: booking.date,
        quantity: booking.saleDetails.quantity,
      });
      map.set(securityId, current);
    }

    for (const events of map.values()) {
      events.sort((left, right) => left.date.localeCompare(right.date) || left.bookingId - right.bookingId);
    }

    return map;
  }

  private computeRemainingLots(purchases: DepotPosition[], sales: SaleEvent[]): DepotPosition[] {
    const lots = [...purchases]
      .map((item) => ({ ...item }))
      .sort((left, right) => left.purchase_date.localeCompare(right.purchase_date) || left.booking_id - right.booking_id);

    for (const sale of sales) {
      let quantityToConsume = sale.quantity;
      for (const lot of lots) {
        if (quantityToConsume <= 0) {
          break;
        }

        const consume = Math.min(lot.quantity, quantityToConsume);
        lot.quantity -= consume;
        quantityToConsume -= consume;
      }
    }

    return lots.filter((lot) => lot.quantity > 0);
  }

  private buildSaleBookingIdSet(bookings: Booking[], depotAccountId: number): Set<number> {
    const ids = new Set<number>();

    for (const booking of bookings) {
      if (booking.vorgang !== 'Verkauf' || booking.saleDetails?.depot_account_id !== depotAccountId || booking.id === undefined) {
        continue;
      }

      ids.add(booking.id);
    }

    return ids;
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
