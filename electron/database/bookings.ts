import { getDatabase } from './connection';
import { Booking, BookingPosition, PurchaseBookingDetails } from '../../src/app/models/booking.model';
import { isSystemAccount } from '../../src/app/models/account.model';

function requireSystemAccount(name: string): number {
  const db = getDatabase();
  const accounts = db.prepare('SELECT id, name, type, subtype FROM accounts WHERE name = ?').all(name) as Array<{
    id: number;
    name: string;
    type: 'Bestand' | 'GuV';
    subtype: string;
  }>;

  if (accounts.length !== 1 || !isSystemAccount(accounts[0])) {
    throw new Error(`Systemkonto-Invariante verletzt: ${name}`);
  }

  return accounts[0].id;
}

function buildPurchasePositions(booking: Booking): BookingPosition[] {
  if (!booking.purchaseDetails) {
    throw new Error('Kaufdetails fehlen.');
  }

  const {
    settlement_account_id,
    depot_account_id,
    quantity,
    price_per_unit,
    fees = 0,
    accrued_interest = 0,
  } = booking.purchaseDetails;
  const purchaseValue = quantity * price_per_unit;
  const positions: BookingPosition[] = [
    {
      account_id: settlement_account_id,
      valuta: booking.date,
      amount: -(purchaseValue + fees + accrued_interest),
    },
    {
      account_id: depot_account_id,
      valuta: booking.date,
      amount: purchaseValue,
    },
  ];

  if (fees > 0) {
    positions.push({
      account_id: requireSystemAccount('Wertpapierprovision'),
      valuta: booking.date,
      amount: fees,
    });
  }

  if (accrued_interest > 0) {
    positions.push({
      account_id: requireSystemAccount('Stückzinsen'),
      valuta: booking.date,
      amount: accrued_interest,
    });
  }

  return positions;
}

function loadPurchaseDetails(booking: Booking): PurchaseBookingDetails | undefined {
  if (booking.vorgang !== 'Kauf' || !booking.id) {
    return undefined;
  }

  const db = getDatabase();
  const depotPosition = db.prepare('SELECT * FROM depot_positions WHERE booking_id = ?').get(booking.id) as
    | {
        security_id: number;
        depot_account_id: number;
        quantity: number;
        price_per_unit: number;
      }
    | undefined;

  if (!depotPosition) {
    return undefined;
  }

  const feesAccountId = requireSystemAccount('Wertpapierprovision');
  const accruedInterestAccountId = requireSystemAccount('Stückzinsen');

  return {
    security_id: depotPosition.security_id,
    depot_account_id: depotPosition.depot_account_id,
    settlement_account_id: booking.positions.find((position) => position.amount < 0)?.account_id ?? 0,
    quantity: depotPosition.quantity,
    price_per_unit: depotPosition.price_per_unit,
    fees: booking.positions.find((position) => position.account_id === feesAccountId)?.amount ?? 0,
    accrued_interest:
      booking.positions.find((position) => position.account_id === accruedInterestAccountId)?.amount ?? 0,
  };
}

function loadBookingRelations(booking: Booking): Booking {
  const db = getDatabase();
  booking.positions = db.prepare('SELECT * FROM booking_positions WHERE booking_id = ?').all(booking.id!) as BookingPosition[];
  booking.purchaseDetails = loadPurchaseDetails(booking);
  return booking;
}

export const bookings = {
  getAll: async (): Promise<Booking[]> => {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM bookings').all() as Booking[];
    for (const row of rows) {
      loadBookingRelations(row);
    }
    return rows;
  },

  getById: async (id: number): Promise<Booking | null> => {
    const db = getDatabase();
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as Booking | null;
    if (booking) {
      loadBookingRelations(booking);
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
    const insertDepotPosition = db.prepare(`
      INSERT INTO depot_positions
        (booking_id, depot_account_id, security_id, quantity, price_per_unit, purchase_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      const result = insertBooking.run(
        booking.vorgang,
        booking.date,
        booking.description || null,
        booking.sender_receiver || null
      );
      const bookingId = result.lastInsertRowid as number;
      const effectivePositions = booking.vorgang === 'Kauf' ? buildPurchasePositions(booking) : booking.positions;

      for (const pos of effectivePositions) {
        insertPosition.run(bookingId, pos.account_id, pos.valuta, pos.amount);
      }

      if (booking.vorgang === 'Kauf' && booking.purchaseDetails) {
        insertDepotPosition.run(
          bookingId,
          booking.purchaseDetails.depot_account_id,
          booking.purchaseDetails.security_id,
          booking.purchaseDetails.quantity,
          booking.purchaseDetails.price_per_unit,
          booking.date
        );
      }

      return { id: bookingId, ...booking, positions: effectivePositions };
    });

    return transaction();
  },

  update: async (id: number, booking: Booking): Promise<Booking> => {
    const db = getDatabase();
    const updateBooking = db.prepare(
      'UPDATE bookings SET vorgang = ?, date = ?, description = ?, sender_receiver = ? WHERE id = ?'
    );
    const deletePositions = db.prepare('DELETE FROM booking_positions WHERE booking_id = ?');
    const deleteDepotPosition = db.prepare('DELETE FROM depot_positions WHERE booking_id = ?');
    const insertPosition = db.prepare(
      'INSERT INTO booking_positions (booking_id, account_id, valuta, amount) VALUES (?, ?, ?, ?)'
    );
    const insertDepotPosition = db.prepare(`
      INSERT INTO depot_positions
        (booking_id, depot_account_id, security_id, quantity, price_per_unit, purchase_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      updateBooking.run(
        booking.vorgang,
        booking.date,
        booking.description || null,
        booking.sender_receiver || null,
        id
      );
      deletePositions.run(id);
      deleteDepotPosition.run(id);
      const effectivePositions = booking.vorgang === 'Kauf' ? buildPurchasePositions(booking) : booking.positions;

      for (const pos of effectivePositions) {
        insertPosition.run(id, pos.account_id, pos.valuta, pos.amount);
      }

      if (booking.vorgang === 'Kauf' && booking.purchaseDetails) {
        insertDepotPosition.run(
          id,
          booking.purchaseDetails.depot_account_id,
          booking.purchaseDetails.security_id,
          booking.purchaseDetails.quantity,
          booking.purchaseDetails.price_per_unit,
          booking.date
        );
      }

      return { id, ...booking, positions: effectivePositions };
    });

    return transaction();
  },

  delete: async (id: number): Promise<void> => {
    const db = getDatabase();
    db.prepare('DELETE FROM bookings WHERE id = ?').run(id);
  }
};
