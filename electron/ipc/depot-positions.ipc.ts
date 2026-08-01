import { ipcMain } from 'electron';

import { depotPositions } from '../database/depot-positions';

export function registerDepotPositionsIPC() {
  ipcMain.handle('depot-positions:getByBooking', async (_event, bookingId) => {
    return await depotPositions.getByBooking(bookingId);
  });

  ipcMain.handle('depot-positions:getByDepot', async (_event, depotAccountId) => {
    return await depotPositions.getByDepot(depotAccountId);
  });
}
