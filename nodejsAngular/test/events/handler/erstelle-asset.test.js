/* eslint no-undef: */

const erstelleAsset = require('../../../app/events/handler/erstelle-asset');

describe('erstellt Asset', () => {
  test('setzt Commando um', () => {
    const command = {
      commandType: 'erstelleAsset',
      isin: 'DE0005933956',
      wkn: '593395',
      assetType: 'ETF',
      name: 'iShare Core EURO STOCC 50 UCITS ETF (DE)',
    };
    expect(erstelleAsset(command)).toMatchObject({
      eventType: 'AssetErstellt',
      isin: 'DE0005933956',
      wkn: '593395',
      assetType: 'ETF',
      name: 'iShare Core EURO STOCC 50 UCITS ETF (DE)',
    });
  });
});
