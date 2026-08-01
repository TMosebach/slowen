import { getDatabase } from './connection';
import { DepotPosition } from '../../src/app/models/depot-position.model';

export const depotPositions = {
  create: async (position: Omit<DepotPosition, 'id'>): Promise<DepotPosition> => {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO depot_positions
        (booking_id, depot_account_id, security_id, quantity, price_per_unit, purchase_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      position.booking_id,
      position.depot_account_id,
      position.security_id,
      position.quantity,
      position.price_per_unit,
      position.purchase_date
    );

    return db.prepare('SELECT * FROM depot_positions WHERE id = last_insert_rowid()').get() as DepotPosition;
  },

  getByBooking: async (bookingId: number): Promise<DepotPosition | null> => {
    const db = getDatabase();
    return (db.prepare('SELECT * FROM depot_positions WHERE booking_id = ?').get(bookingId) as DepotPosition | undefined) || null;
  },

  getByDepot: async (depotAccountId: number): Promise<DepotPosition[]> => {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM depot_positions
      WHERE depot_account_id = ?
      ORDER BY purchase_date DESC, id DESC
    `).all(depotAccountId) as DepotPosition[];
  }
};
