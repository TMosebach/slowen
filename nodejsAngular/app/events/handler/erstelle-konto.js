const validatoren = require('../validatoren');
const { checkKontoExists } = require('./check-konto-exists');

function checkKontoNotExists(kontoName) {
  try {
    checkKontoExists(kontoName);
  } catch (err) {
    // Dann existiert es noch nicht, ok
    return;
  }
  throw new Error(`Konto ${kontoName} existiert bereits.`);
}

function erstelleKonto(command) {
  const { name, kontoType, bilanzType } = command;

  validatoren.checkExists(name, 'Name', command);
  validatoren.checkExists(kontoType, 'kontoType');
  validatoren.checkExists(bilanzType, 'bilanzType');

  checkKontoNotExists(name);

  validatoren.checkValueIsIn(kontoType, ['Konto', 'Depot']);
  validatoren.checkValueIsIn(bilanzType, ['Bestand', 'GuV']);

  return {
    eventType: 'KontoErstellt',
    created: new Date().toISOString(),
    kontoType,
    name,
    bilanzType,
  };
}

module.exports = erstelleKonto;
