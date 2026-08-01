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
  },
  depotPositions: {
    getByBooking: (bookingId: number) => ipcRenderer.invoke('depot-positions:getByBooking', bookingId),
    getByDepot: (depotAccountId: number) => ipcRenderer.invoke('depot-positions:getByDepot', depotAccountId)
  },
  securities: {
    create: (security: any) => ipcRenderer.invoke('securities:create', security),
    getAll: () => ipcRenderer.invoke('securities:getAll'),
    getById: (id: number) => ipcRenderer.invoke('securities:getById', id),
    update: (id: number, updates: any) => ipcRenderer.invoke('securities:update', id, updates)
  },
  securityPrices: {
    create: (security_id: number, date: string, price: number) =>
      ipcRenderer.invoke('security-prices:create', security_id, date, price),
    getBySecurityAndDate: (security_id: number, date: string) =>
      ipcRenderer.invoke('security-prices:getBySecurityAndDate', security_id, date),
    getByDate: (date: string) => ipcRenderer.invoke('security-prices:getByDate', date),
    update: (security_id: number, date: string, price: number) =>
      ipcRenderer.invoke('security-prices:update', security_id, date, price),
    getLatest: (security_id: number) => ipcRenderer.invoke('security-prices:getLatest', security_id)
  }
});
