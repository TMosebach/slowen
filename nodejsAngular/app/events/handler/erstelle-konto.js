const validatoren = require('../validatoren');

function erstelleKonto(command) {
  const { name, kontoType, bilanzType } = command;

  validatoren.checkExists(name, 'Name', command);

  // Todo: Zugriff auf aktulle View erst ermöglichen
  // validatoren.checkNotKontoExists(name);

  validatoren.checkExists(kontoType, 'kontoType');
  validatoren.checkValueIsIn(kontoType, ['Konto', 'Depot']);

  validatoren.checkExists(bilanzType, 'bilanzType');
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
