import { getDatabase } from './connection';
import { Booking, BookingPosition } from '../../src/app/models/booking.model';

export const bookings = {
  getAll: async (): Promise<Booking[]> => {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM bookings').all() as Booking[];
    for (const row of rows) {
      row.positions = db.prepare(
        'SELECT * FROM booking_positions WHERE booking_id = ?'
      ).all(row.id!) as BookingPosition[];
    }
    return rows;
  },

  getById: async (id: number): Promise<Booking | null> => {
    const db = getDatabase();
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as Booking | null;
    if (booking) {
      booking.positions = db.prepare(
        'SELECT * FROM booking_positions WHERE booking_id = ?'
      ).all(id) as BookingPosition[];
    }
    return booking;
  },

  create: async (booking: Booking): Promise<Booking> => {
    const db = getDatabase();
    const insertBooking = db.prepare(
      'INSERT INTO bookings (vorgang, date, description, sender_receiver) VALUES (?, ?, ?, ?)'
    );
    const insertPosition = db.prepare(
      'INSERT INTO booking_positions (booking_id, account_id, valuta, amount) VALUES (?, ?, ?, ?)'
    );

    const transaction = db.transaction(() => {
      const result = insertBooking.run(
        booking.vorgang,
        booking.date,
        booking.description || null,
        booking.sender_receiver || null
      );
      const bookingId = result.lastInsertRowid as number;

      for (const pos of booking.positions) {
        insertPosition.run(bookingId, pos.account_id, pos.valuta, pos.amount);
      }

      return { id: bookingId, ...booking };
    });

    return transaction();
  },

  update: async (id: number, booking: Booking): Promise<Booking> => {
    const db = getDatabase();
    const updateBooking = db.prepare(
      'UPDATE bookings SET vorgang = ?, date = ?, description = ?, sender_receiver = ? WHERE id = ?'
    );
    const deletePositions = db.prepare('DELETE FROM booking_positions WHERE booking_id = ?');
    const insertPosition = db.prepare(
      'INSERT INTO booking_positions (booking_id, account_id, valuta, amount) VALUES (?, ?, ?, ?)'
    );

    const transaction = db.transaction(() => {
      updateBooking.run(
        booking.vorgang,
        booking.date,
        booking.description || null,
        booking.sender_receiver || null,
        id
      );
      deletePositions.run(id);
      for (const pos of booking.positions) {
        insertPosition.run(id, pos.account_id, pos.valuta, pos.amount);
      }
      return { id, ...booking };
    });

    return transaction();
  },

  delete: async (id: number): Promise<void> => {
    const db = getDatabase();
    db.prepare('DELETE FROM bookings WHERE id = ?').run(id);
  }
};
