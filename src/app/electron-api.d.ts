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
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
