#!/usr/bin/env node
const path = require('path');
const Database = require('better-sqlite3');

// Initialize database
const dbPath = path.join(__dirname, '..', '..', 'slowen-app.db');
console.log('Using database:', dbPath);

const db = new Database(dbPath, { fileMustExist: false });

// Check if securities table exists
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='securities'").all();
console.log('\n✓ Securities table exists:', tables.length > 0);

if (tables.length > 0) {
  const schema = db.prepare("PRAGMA table_info(securities)").all();
  console.log('\nSecurities table schema:');
  schema.forEach(col => {
    console.log(`  - ${col.name} (${col.type})`);
  });
}

// Check if security_prices table exists
const pricesTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='security_prices'").all();
console.log('\n✓ Security_prices table exists:', pricesTables.length > 0);

if (pricesTables.length > 0) {
  const pricesSchema = db.prepare("PRAGMA table_info(security_prices)").all();
  console.log('\nSecurity_prices table schema:');
  pricesSchema.forEach(col => {
    console.log(`  - ${col.name} (${col.type})`);
  });
}

// Test insert
console.log('\n--- Testing INSERT ---');
try {
  const insertSecurity = db.prepare(`
    INSERT INTO securities (name, type, isin, wkn)
    VALUES (?, ?, ?, ?)
  `);
  const result = insertSecurity.run('Test Security', 'Aktie', 'DE0000000001', '000001');
  console.log('✓ Inserted security with id:', result.lastInsertRowid);
} catch (err) {
  console.log('✗ Error inserting security:', err.message);
}

// Test select
console.log('\n--- Testing SELECT ---');
try {
  const securities = db.prepare("SELECT * FROM securities").all();
  console.log('✓ Found securities:', securities.length);
  securities.forEach(sec => {
    console.log(`  - ${sec.name} (${sec.type}): ${sec.isin}`);
  });
} catch (err) {
  console.log('✗ Error selecting securities:', err.message);
}

db.close();
console.log('\n✓ Database test completed');
