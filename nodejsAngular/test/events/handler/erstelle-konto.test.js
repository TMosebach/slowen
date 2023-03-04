/* eslint no-undef: */

const erstelleKonto = require('../../../app/events/handler/erstelle-konto');

describe('erstellt Konto', () => {
  test('setzt Commando um', () => {
    const command = {
      commandType: 'erstelleKonto',
      kontoType: 'Konto',
      name: 'ING-Giro',
      bilanzType: 'Bestand',
    };
    expect(erstelleKonto(command)).toMatchObject({
      eventType: 'KontoErstellt',
      kontoType: 'Konto',
      name: 'ING-Giro',
      bilanzType: 'Bestand',
    });
  });
});
