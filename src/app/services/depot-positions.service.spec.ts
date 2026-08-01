import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DepotPositionsService } from './depot-positions.service';

describe('DepotPositionsService', () => {
  let service: DepotPositionsService;
  let mockApi: any;

  beforeEach(() => {
    mockApi = {
      getByBooking: vi.fn().mockResolvedValue(null),
      getByDepot: vi.fn().mockResolvedValue([])
    };

    (window as any).electronAPI = { depotPositions: mockApi };
    TestBed.configureTestingModule({});
    service = TestBed.inject(DepotPositionsService);
  });

  it('calls getByBooking on the preload api', async () => {
    await service.getByBooking(3);

    expect(mockApi.getByBooking).toHaveBeenCalledWith(3);
  });

  it('calls getByDepot on the preload api', async () => {
    await service.getByDepot(9);

    expect(mockApi.getByDepot).toHaveBeenCalledWith(9);
  });
});
