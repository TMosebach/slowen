import { ipcMain } from 'electron';
import { securityPrices } from '../database/security-prices';

export function registerSecurityPricesIPC() {
  ipcMain.handle('security-prices:create', async (_, security_id, date, price) => {
    try {
      return await securityPrices.create(security_id, date, price);
    } catch (error) {
      console.error('IPC security-prices:create failed:', error);
      throw error;
    }
  });

  ipcMain.handle('security-prices:getBySecurityAndDate', async (_, security_id, date) => {
    try {
      return await securityPrices.getBySecurityAndDate(security_id, date);
    } catch (error) {
      console.error('IPC security-prices:getBySecurityAndDate failed:', error);
      throw error;
    }
  });

  ipcMain.handle('security-prices:getByDate', async (_, date) => {
    try {
      return await securityPrices.getByDate(date);
    } catch (error) {
      console.error('IPC security-prices:getByDate failed:', error);
      throw error;
    }
  });

  ipcMain.handle('security-prices:update', async (_, security_id, date, price) => {
    try {
      return await securityPrices.update(security_id, date, price);
    } catch (error) {
      console.error('IPC security-prices:update failed:', error);
      throw error;
    }
  });

  ipcMain.handle('security-prices:getLatest', async (_, security_id) => {
    try {
      return await securityPrices.getLatest(security_id);
    } catch (error) {
      console.error('IPC security-prices:getLatest failed:', error);
      throw error;
    }
  });
}
