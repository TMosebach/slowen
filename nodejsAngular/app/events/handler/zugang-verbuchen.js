const validatoren = require('../validatoren');
const { checkDepotExists } = require('./check-konto-exists');
const checkAssetExists = require('./check-asset-exists');

function zugangBuchen(command) {
  const {
    depot,
    valuta,
    asset,
    menge,
    betrag,
  } = command;

  validatoren.checkExists(depot, 'Depot');
  checkDepotExists(depot);

  validatoren.checkExists(asset, 'asset');
  checkAssetExists(asset);

  validatoren.checkExists(valuta, 'valuta');
  validatoren.checkExists(menge, 'menge');
  validatoren.checkExists(betrag, 'betrag');

  return {
    type: 'zugangEvent',
    created: new Date().toISOString(),
    depot,
    valuta,
    asset,
    menge,
    betrag,
  };
}

module.exports = zugangBuchen;
