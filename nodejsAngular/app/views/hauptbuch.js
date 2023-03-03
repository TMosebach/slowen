const eventStore = require('../events/simple-event-store');

function erstelleKonto(event) {
  const { kontoType, name, bilanzType } = event;
  return {
    kontoType,
    name,
    bilanzType,
    saldo: {
      wert: 0,
      waehrung: 'EUR',
    },
  };
}

function getHauptbuch() {
  const konten = [];

  eventStore.getEvents().forEach((event) => {
    switch (event.eventType) {
      case 'KontoErstellt':
        konten.push(erstelleKonto(event));
        break;
      default:
        // Die übrigen Events ignorieren
    }
  });

  return konten;
}

module.exports = getHauptbuch;
