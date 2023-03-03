const validatoren = require('../validatoren');
const getHauptbuch = require('../../views/hauptbuch');

function checkKontoNotExists(kontoName) {
  const bekannteKonten = getHauptbuch();
  const treffer = bekannteKonten.filter((konto) => konto.name === kontoName);
  if (treffer && treffer.length > 0) {
    throw new Error(`Konto ${kontoName} existiert bereits.`);
  }
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
