const validatoren = require('../validatoren');
const checkAssetExists = require('./check-asset-exists');

function checkAssetNotExists(assetIsin) {
  try {
    checkAssetExists(assetIsin);
  } catch (err) {
    // Dann existiert es noch nicht, ok
    return;
  }
  throw new Error(`Asset ${assetIsin} existiert bereits.`);
}

function erstelleAsset(command) {
  const {
    isin,
    wkn,
    assetType,
    name,
  } = command;

  validatoren.checkExists(isin, 'isin');
  validatoren.checkExists(wkn, 'wkn');
  validatoren.checkExists(assetType, 'assetType');
  validatoren.checkExists(name, 'name');

  checkAssetNotExists(isin);

  validatoren.checkValueIsIn(assetType, ['Aktie', 'Fonds', 'ETF']);

  return {
    eventType: 'AssetErstellt',
    created: new Date().toISOString(),
    isin,
    wkn,
    assetType,
    name,
  };
}

module.exports = erstelleAsset;
