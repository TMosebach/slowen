import { ipcMain } from 'electron';
import { accounts } from '../database/accounts';

export function registerAccountsIPC() {
  ipcMain.handle('accounts:getAll', async () => {
    try {
      return await accounts.getAll();
    } catch (error) {
      console.error('IPC accounts:getAll failed:', error);
      throw error;
    }
  });

  ipcMain.handle('accounts:getById', async (_event, id) => {
    try {
      return await accounts.getById(id);
    } catch (error) {
      console.error('IPC accounts:getById failed:', error);
      throw error;
    }
  });

  ipcMain.handle('accounts:create', async (_event, account) => {
    try {
      return await accounts.create(account);
    } catch (error) {
      console.error('IPC accounts:create failed:', error);
      throw error;
    }
  });

  ipcMain.handle('accounts:update', async (_event, id, account) => {
    try {
      return await accounts.update(id, account);
    } catch (error) {
      console.error('IPC accounts:update failed:', error);
      throw error;
    }
  });

  ipcMain.handle('accounts:delete', async (_event, id) => {
    try {
      return await accounts.delete(id);
    } catch (error) {
      console.error('IPC accounts:delete failed:', error);
      throw error;
    }
  });
}
