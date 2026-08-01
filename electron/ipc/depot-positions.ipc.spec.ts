import { afterEach, describe, expect, it, vi } from 'vitest';

const { ipcMain } = vi.hoisted(() => ({
  ipcMain: {
    handle: vi.fn()
  }
}));

vi.mock('electron', () => ({ ipcMain }));

import { registerDepotPositionsIPC } from './depot-positions.ipc';

describe('registerDepotPositionsIPC', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('registers handler for depot-positions:getByDepot', () => {
    registerDepotPositionsIPC();

    expect(ipcMain.handle).toHaveBeenCalledWith('depot-positions:getByDepot', expect.any(Function));
  });

  it('registers handler for depot-positions:getByBooking', () => {
    registerDepotPositionsIPC();

    expect(ipcMain.handle).toHaveBeenCalledWith('depot-positions:getByBooking', expect.any(Function));
  });
});
