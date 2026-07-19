export const accounts = {
  getAll: async () => {
    // TODO: Implementierung mit better-sqlite3
    return [];
  },
  getById: async (id: number) => {
    // TODO: Implementierung mit better-sqlite3
    return null;
  },
  create: async (account: any) => {
    // TODO: Implementierung mit better-sqlite3
    return { id: 1, ...account };
  },
  update: async (id: number, account: any) => {
    // TODO: Implementierung mit better-sqlite3
    return { id, ...account };
  },
  delete: async (id: number) => {
    // TODO: Implementierung mit better-sqlite3
  }
};
