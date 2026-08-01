import { Injectable } from '@angular/core';

import { DepotPosition } from '../models/depot-position.model';

@Injectable({ providedIn: 'root' })
export class DepotPositionsService {
  private get api() {
    return window.electronAPI.depotPositions;
  }

  getByBooking(bookingId: number): Promise<DepotPosition | null> {
    return this.api.getByBooking(bookingId);
  }

  getByDepot(depotAccountId: number): Promise<DepotPosition[]> {
    return this.api.getByDepot(depotAccountId);
  }
}
