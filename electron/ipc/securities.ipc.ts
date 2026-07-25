import { ipcMain } from 'electron';
import { securities } from '../database/securities';

export function registerSecuritiesIPC() {
  ipcMain.handle('securities:create', async (_, security) => {
    try {
      return await securities.create(security);
    } catch (error) {
      console.error('IPC securities:create failed:', error);
      throw error;
    }
  });

  ipcMain.handle('securities:getAll', async () => {
    try {
      return await securities.getAll();
    } catch (error) {
      console.error('IPC securities:getAll failed:', error);
      throw error;
    }
  });

  ipcMain.handle('securities:getById', async (_, id) => {
    try {
      return await securities.getById(id);
    } catch (error) {
      console.error('IPC securities:getById failed:', error);
      throw error;
    }
  });

  ipcMain.handle('securities:update', async (_, id, updates) => {
    try {
      return await securities.update(id, updates);
    } catch (error) {
      console.error('IPC securities:update failed:', error);
      throw error;
    }
  });
}
