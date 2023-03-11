const validatoren = require('../validatoren');
const { checkDepotExists } = require('./check-konto-exists');
const checkAssetExists = require('./check-asset-exists');
const getHauptbuch = require('../../views/hauptbuch');

function hatAusreichenderBestand(depotName, isin, menge) {
  const bekannteKonten = getHauptbuch();
  const depot = bekannteKonten.filter((konto) => konto.name === depotName)[0];
  if (depot.bestaende) {
    const treffer = depot.bestaende.filter((bst) => bst.asset === isin);
    if (treffer && treffer.length === 1) {
      const bestand = treffer[0];
      if (bestand.menge < menge) {
        throw new Error(`Der Bestand von ${bestand.menge} reicht nicht für einen Abgang von ${menge}`);
      }
      return;
    }
  }
  throw new Error(`Das Depot ${depotName} hat keinen Betand für Asset ${isin}`);
}

function abgangBuchen(command) {
  const {
    depot, valuta, asset, menge,
  } = command;

  validatoren.checkExists(depot, 'Depot');
  checkDepotExists(depot);

  validatoren.checkExists(valuta, 'valuta');

  validatoren.checkExists(asset, 'asset');
  checkAssetExists(asset);

  validatoren.checkExists(menge, 'menge');
  hatAusreichenderBestand(depot, asset, menge);

  return {
    eventType: 'Abgang',
    created: new Date().toISOString(),
    depot,
    valuta,
    asset,
    menge,
  };
}

module.exports = abgangBuchen;
