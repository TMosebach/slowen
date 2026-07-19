import { ipcMain } from 'electron';
import { accounts } from '../database/accounts';

export function registerAccountsIPC() {
  ipcMain.handle('accounts:getAll', async () => {
    return accounts.getAll();
  });

  ipcMain.handle('accounts:getById', async (_event, id) => {
    return accounts.getById(id);
  });

  ipcMain.handle('accounts:create', async (_event, account) => {
    return accounts.create(account);
  });

  ipcMain.handle('accounts:update', async (_event, id, account) => {
    return accounts.update(id, account);
  });

  ipcMain.handle('accounts:delete', async (_event, id) => {
    return accounts.delete(id);
  });
}
