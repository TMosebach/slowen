import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Accounts
  accounts: {
    getAll: () => ipcRenderer.invoke('accounts:getAll'),
    getById: (id: number) => ipcRenderer.invoke('accounts:getById', id),
    create: (account: any) => ipcRenderer.invoke('accounts:create', account),
    update: (id: number, account: any) => ipcRenderer.invoke('accounts:update', id, account),
    delete: (id: number) => ipcRenderer.invoke('accounts:delete', id)
  },
  bookings: {
    getAll: () => ipcRenderer.invoke('bookings:getAll'),
    getById: (id: number) => ipcRenderer.invoke('bookings:getById', id),
    create: (booking: any) => ipcRenderer.invoke('bookings:create', booking),
    update: (id: number, booking: any) => ipcRenderer.invoke('bookings:update', id, booking),
    delete: (id: number) => ipcRenderer.invoke('bookings:delete', id)
  }
});
