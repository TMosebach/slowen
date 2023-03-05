const validatoren = require('../validatoren');
const { checkDepotExists, checkKontoExists } = require('./check-konto-exists');
const checkAssetExists = require('./check-asset-exists');

function zugangBuchen(command) {
  const {
    depot,
    valuta,
    asset,
    menge,
    betrag,
    umsaetze,
  } = command;

  validatoren.checkExists(depot, 'Depot');
  checkDepotExists(depot);

  validatoren.checkExists(asset, 'asset');
  checkAssetExists(asset);

  validatoren.checkExists(valuta, 'valuta');
  validatoren.checkExists(menge, 'menge');
  validatoren.checkExists(betrag, 'betrag');

  validatoren.checkExists(umsaetze, 'umsaetze');
  let summe = betrag.wert;
  umsaetze.forEach((umsatz) => {
    checkKontoExists(umsatz.konto);
    summe += umsatz.betrag.wert;
  });
  if (summe !== 0) {
    throw new Error(`Die Summe von Soll und Haben sind unterschhiedlich, Differenz: ${summe}`);
  }

  return {
    eventType: 'Kauf',
    created: new Date().toISOString(),
    depot,
    valuta,
    asset,
    menge,
    betrag,
    umsaetze,
  };
}

module.exports = zugangBuchen;
