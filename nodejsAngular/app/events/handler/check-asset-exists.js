const getAssets = require('../../views/assets');

function checkAssetExists(assetIsin) {
  const bekannteAssets = getAssets();
  const treffer = bekannteAssets.filter((asset) => asset.isin === assetIsin);
  if (!treffer || treffer.length === 0) {
    throw new Error(`Asset ${assetIsin} ist unbekannt.`);
  }
}

module.exports = checkAssetExists;
