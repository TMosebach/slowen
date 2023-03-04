/* eslint no-undef: */
const eventStore = require('../../app/events/simple-event-store');

describe('Simple-Event-Store', () => {
  test('Merkt sich Events', () => {
    const event = {
      eventType: 'AssetErstellt',
      isin: 'DE0005933956',
      wkn: '593395',
      assetType: 'ETF',
      name: 'iShare Core EURO STOCC 50 UCITS ETF (DE)',
    };

    eventStore.addEvent(event);

    const result = eventStore.getEvents();

    expect(result).toStrictEqual([
      {
        eventType: 'AssetErstellt',
        isin: 'DE0005933956',
        wkn: '593395',
        assetType: 'ETF',
        name: 'iShare Core EURO STOCC 50 UCITS ETF (DE)',
      },
    ]);
  });
});
