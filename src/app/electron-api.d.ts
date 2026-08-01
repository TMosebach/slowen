import { DepotPosition } from './models/depot-position.model';

interface ElectronAPI {
  accounts: {
    getAll: () => Promise<any[]>;
    getById: (id: number) => Promise<any>;
    create: (account: any) => Promise<any>;
    update: (id: number, account: any) => Promise<any>;
    delete: (id: number) => Promise<void>;
  };
  bookings: {
    getAll: () => Promise<any[]>;
    getById: (id: number) => Promise<any>;
    create: (booking: any) => Promise<any>;
    update: (id: number, booking: any) => Promise<any>;
    delete: (id: number) => Promise<void>;
  };
  depotPositions: {
    getByBooking: (bookingId: number) => Promise<DepotPosition | null>;
    getByDepot: (depotAccountId: number) => Promise<DepotPosition[]>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
