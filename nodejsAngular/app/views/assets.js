const eventStore = require('../events/simple-event-store');

function erstelleAsset(event) {
  const {
    isin, wkn, assetType, name,
  } = event;
  return {
    isin,
    wkn,
    assetType,
    name,
  };
}

function getAssets() {
  const assets = [];

  eventStore.getEvents().forEach((event) => {
    switch (event.eventType) {
      case 'AssetErstellt':
        assets.push(erstelleAsset(event));
        break;
      default:
        // Die übrigen Events ignorieren
    }
  });

  return assets;
}

module.exports = getAssets;
