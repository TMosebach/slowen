const validatoren = require('../validatoren');
const getAssets = require('../../views/assets');

function checkAssetNotExists(assetIsin) {
  const bekannteAssets = getAssets();
  const treffer = bekannteAssets.filter((asset) => asset.isin === assetIsin);
  if (treffer && treffer.length > 0) {
    throw new Error(`Asset ${assetIsin} existiert bereits.`);
  }
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
