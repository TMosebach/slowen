import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Accounts
  accounts: {
    getAll: () => ipcRenderer.invoke('accounts:getAll'),
    getById: (id: number) => ipcRenderer.invoke('accounts:getById', id),
    create: (account: any) => ipcRenderer.invoke('accounts:create', account),
    update: (id: number, account: any) => ipcRenderer.invoke('accounts:update', id, account),
    delete: (id: number) => ipcRenderer.invoke('accounts:delete', id)
  }
});
