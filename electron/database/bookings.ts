import { getDatabase } from './connection';
import { computeSaleCostBasis, FifoEvent } from './sale-fifo';
import { Booking, BookingPosition, PurchaseBookingDetails, SaleBookingDetails } from '../../src/app/models/booking.model';
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

function loadFifoCostBasisForSale(booking: Booking, quantity: number): number {
  if (!booking.saleDetails) {
    throw new Error('Verkaufsdetails fehlen.');
  }

  const db = getDatabase();
  const rows = db
    .prepare(
      `
      SELECT b.id AS booking_id, b.date, b.vorgang, d.quantity, d.price_per_unit
      FROM bookings b
      INNER JOIN depot_positions d ON d.booking_id = b.id
      WHERE d.depot_account_id = ?
        AND d.security_id = ?
        AND b.vorgang IN ('Kauf', 'Verkauf')
        AND (
          b.date < ?
          OR (
            ? IS NOT NULL
            AND b.date = ?
            AND b.id < ?
          )
        )
        AND (? IS NULL OR b.id != ?)
    `
    )
    .all(
      booking.saleDetails.depot_account_id,
      booking.saleDetails.security_id,
      booking.date,
      booking.id ?? null,
      booking.date,
      booking.id ?? null,
      booking.id ?? null,
      booking.id ?? null
    ) as Array<{
    booking_id: number;
    date: string;
    vorgang: 'Kauf' | 'Verkauf';
    quantity: number;
    price_per_unit: number;
  }>;

  const events: FifoEvent[] = rows.map((row) => ({
    booking_id: row.booking_id,
    date: row.date,
    type: row.vorgang === 'Kauf' ? 'buy' : 'sell',
    quantity: row.quantity,
    price_per_unit: row.price_per_unit,
  }));

  return computeSaleCostBasis(events, quantity).costBasis;
}

function loadSaleDetailsByBookingId(bookingId: number): SaleBookingDetails {
  const db = getDatabase();
  const depotPosition = db.prepare('SELECT * FROM depot_positions WHERE booking_id = ?').get(bookingId) as
    | {
        security_id: number;
        depot_account_id: number;
        quantity: number;
        price_per_unit: number;
      }
    | undefined;

  if (!depotPosition) {
    throw new Error(`Depotposition fehlt fuer Verkauf ${bookingId}`);
  }

  const bookingPositions = db.prepare('SELECT * FROM booking_positions WHERE booking_id = ?').all(bookingId) as BookingPosition[];
  const feesAccountId = requireSystemAccount('Wertpapierprovision');
  const capitalGainsTaxAccountId = requireSystemAccount('Kapitalertragsteuer');
  const solidaritySurchargeAccountId = requireSystemAccount('Solidaritätszuschlag');

  const settlementPosition = bookingPositions.find((position) => {
    if (position.amount <= 0) {
      return false;
    }

    const account = db
      .prepare('SELECT id, name, type, subtype FROM accounts WHERE id = ?')
      .get(position.account_id) as
      | {
          id: number;
          name: string;
          type: 'Bestand' | 'GuV';
          subtype: string;
        }
      | undefined;

    return Boolean(account) && !isSystemAccount(account);
  });

  if (!settlementPosition) {
    throw new Error(`Abrechnungskonto fehlt fuer Verkauf ${bookingId}`);
  }

  const saleDetails: SaleBookingDetails = {
    security_id: depotPosition.security_id,
    depot_account_id: depotPosition.depot_account_id,
    settlement_account_id: settlementPosition.account_id,
    quantity: depotPosition.quantity,
    price_per_unit: depotPosition.price_per_unit,
    fees: bookingPositions.find((position) => position.account_id === feesAccountId)?.amount ?? 0,
    capital_gains_tax: bookingPositions.find((position) => position.account_id === capitalGainsTaxAccountId)?.amount ?? 0,
    solidarity_surcharge:
      bookingPositions.find((position) => position.account_id === solidaritySurchargeAccountId)?.amount ?? 0,
  };

  return {
    ...saleDetails,
    fees: saleDetails.fees ?? 0,
    capital_gains_tax: saleDetails.capital_gains_tax ?? 0,
    solidarity_surcharge: saleDetails.solidarity_surcharge ?? 0,
  };
}

function recomputeDerivedSalesForPairs(pairs: Array<{ depot_account_id: number; security_id: number }>): void {
  if (pairs.length === 0) {
    return;
  }

  const db = getDatabase();
  const uniquePairs = Array.from(new Map(pairs.map((pair) => [`${pair.depot_account_id}:${pair.security_id}`, pair])).values());
  const saleQuery = db.prepare(`
    SELECT b.id, b.date
    FROM bookings b
    INNER JOIN depot_positions d ON d.booking_id = b.id
    WHERE b.vorgang = 'Verkauf'
      AND d.depot_account_id = ?
      AND d.security_id = ?
    ORDER BY b.date, b.id
  `);
  const deletePositions = db.prepare('DELETE FROM booking_positions WHERE booking_id = ?');
  const insertPosition = db.prepare(
    'INSERT INTO booking_positions (booking_id, account_id, valuta, amount) VALUES (?, ?, ?, ?)'
  );

  for (const pair of uniquePairs) {
    const sales = saleQuery.all(pair.depot_account_id, pair.security_id) as Array<{ id: number; date: string }>;

    for (const sale of sales) {
      const saleDetails = loadSaleDetailsByBookingId(sale.id);
      const effectivePositions = buildSalePositions({
        id: sale.id,
        vorgang: 'Verkauf',
        date: sale.date,
        positions: [],
        saleDetails,
      } as Booking);

      deletePositions.run(sale.id);
      for (const position of effectivePositions) {
        insertPosition.run(sale.id, position.account_id, position.valuta, position.amount);
      }
    }
  }
}

function loadDepotPairByBookingId(id: number): { depot_account_id: number; security_id: number } | null {
  const db = getDatabase();
  const row = db
    .prepare('SELECT depot_account_id, security_id FROM depot_positions WHERE booking_id = ?')
    .get(id) as { depot_account_id: number; security_id: number } | undefined;

  if (!row) {
    return null;
  }

  return row;
}

function buildSalePositions(booking: Booking): BookingPosition[] {
  if (!booking.saleDetails) {
    throw new Error('Verkaufsdetails fehlen.');
  }

  const details = booking.saleDetails;
  const fees = details.fees ?? 0;
  const tax = details.capital_gains_tax ?? 0;
  const soli = details.solidarity_surcharge ?? 0;
  const costBasis = loadFifoCostBasisForSale(booking, details.quantity);
  const proceeds = details.quantity * details.price_per_unit;
  const net = proceeds - fees - tax - soli;
  const pnl = net - costBasis;

  const positions: BookingPosition[] = [
    {
      account_id: details.depot_account_id,
      valuta: booking.date,
      amount: -costBasis,
    },
    {
      account_id: details.settlement_account_id,
      valuta: booking.date,
      amount: net,
    },
  ];

  if (fees > 0) {
    positions.push({
      account_id: requireSystemAccount('Wertpapierprovision'),
      valuta: booking.date,
      amount: fees,
    });
  }

  if (tax > 0) {
    positions.push({
      account_id: requireSystemAccount('Kapitalertragsteuer'),
      valuta: booking.date,
      amount: tax,
    });
  }

  if (soli > 0) {
    positions.push({
      account_id: requireSystemAccount('Solidaritätszuschlag'),
      valuta: booking.date,
      amount: soli,
    });
  }

  if (pnl > 0) {
    positions.push({
      account_id: requireSystemAccount('Kursgewinn'),
      valuta: booking.date,
      amount: pnl,
    });
  }

  if (pnl < 0) {
    positions.push({
      account_id: requireSystemAccount('Kursverlust'),
      valuta: booking.date,
      amount: Math.abs(pnl),
    });
  }

  const total = positions.reduce((sum, position) => sum + position.amount, 0);
  if (Math.abs(total) > 1e-9) {
    positions[1].amount -= total;
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

function loadSaleDetails(booking: Booking): SaleBookingDetails | undefined {
  if (booking.vorgang !== 'Verkauf' || !booking.id) {
    return undefined;
  }

  return loadSaleDetailsByBookingId(booking.id);
}

function loadBookingRelations(booking: Booking): Booking {
  const db = getDatabase();
  booking.positions = db.prepare('SELECT * FROM booking_positions WHERE booking_id = ?').all(booking.id!) as BookingPosition[];
  booking.purchaseDetails = loadPurchaseDetails(booking);
  booking.saleDetails = loadSaleDetails(booking);
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
      const effectivePositions =
        booking.vorgang === 'Kauf'
          ? buildPurchasePositions(booking)
          : booking.vorgang === 'Verkauf'
            ? buildSalePositions({ ...booking, id: bookingId })
            : booking.positions;

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

      if (booking.vorgang === 'Verkauf' && booking.saleDetails) {
        insertDepotPosition.run(
          bookingId,
          booking.saleDetails.depot_account_id,
          booking.saleDetails.security_id,
          booking.saleDetails.quantity,
          booking.saleDetails.price_per_unit,
          booking.date
        );
      }

      if (booking.vorgang === 'Kauf' && booking.purchaseDetails) {
        recomputeDerivedSalesForPairs([
          {
            depot_account_id: booking.purchaseDetails.depot_account_id,
            security_id: booking.purchaseDetails.security_id,
          },
        ]);
      }

      if (booking.vorgang === 'Verkauf' && booking.saleDetails) {
        recomputeDerivedSalesForPairs([
          {
            depot_account_id: booking.saleDetails.depot_account_id,
            security_id: booking.saleDetails.security_id,
          },
        ]);
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
      const previousPair = loadDepotPairByBookingId(id);

      updateBooking.run(
        booking.vorgang,
        booking.date,
        booking.description || null,
        booking.sender_receiver || null,
        id
      );
      deletePositions.run(id);
      deleteDepotPosition.run(id);
      const effectivePositions =
        booking.vorgang === 'Kauf'
          ? buildPurchasePositions(booking)
          : booking.vorgang === 'Verkauf'
            ? buildSalePositions({ ...booking, id })
            : booking.positions;

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

      if (booking.vorgang === 'Verkauf' && booking.saleDetails) {
        insertDepotPosition.run(
          id,
          booking.saleDetails.depot_account_id,
          booking.saleDetails.security_id,
          booking.saleDetails.quantity,
          booking.saleDetails.price_per_unit,
          booking.date
        );
      }

      const affectedPairs: Array<{ depot_account_id: number; security_id: number }> = [];
      if (previousPair) {
        affectedPairs.push(previousPair);
      }
      if (booking.vorgang === 'Kauf' && booking.purchaseDetails) {
        affectedPairs.push({
          depot_account_id: booking.purchaseDetails.depot_account_id,
          security_id: booking.purchaseDetails.security_id,
        });
      }
      if (booking.vorgang === 'Verkauf' && booking.saleDetails) {
        affectedPairs.push({
          depot_account_id: booking.saleDetails.depot_account_id,
          security_id: booking.saleDetails.security_id,
        });
      }

      recomputeDerivedSalesForPairs(affectedPairs);

      return { id, ...booking, positions: effectivePositions };
    });

    return transaction();
  },

  delete: async (id: number): Promise<void> => {
    const db = getDatabase();
    const transaction = db.transaction(() => {
      const pair = loadDepotPairByBookingId(id);
      db.prepare('DELETE FROM bookings WHERE id = ?').run(id);

      if (pair) {
        recomputeDerivedSalesForPairs([pair]);
      }
    });

    transaction();
  }
};
