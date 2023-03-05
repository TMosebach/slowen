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

function buche(konten, event) {
  const { umsaetze } = event;
  umsaetze.forEach((umsatz) => {
    const theKonto = konten.find((aKonto) => aKonto.name === umsatz.konto);
    theKonto.saldo.wert += umsatz.betrag.wert;
  });
}
function addBestand(bestaende, zugang) {
  const result = bestaende
    ? [
      ...bestaende,
    ]
    : [];
  const index = result.findIndex((bst) => bst.asset === zugang.asset);
  let bestand;
  if (index < 0) {
    bestand = {
      asset: zugang.asset,
      menge: 0,
      kaufwert: {
        wert: 0,
        waehrung: 'EUR',
      },
    };
    result.push(bestand);
  } else {
    bestand = result[index];
  }

  bestand.menge += zugang.menge;
  bestand.kaufwert.wert += zugang.betrag.wert;

  return result;
}

function assetZugang(konten, event) {
  const theDepot = konten.find((aKonto) => aKonto.name === event.depot);
  const { asset, menge, betrag } = event;
  theDepot.bestaende = addBestand(theDepot.bestaende, {
    asset,
    menge,
    betrag,
  });
}

function getHauptbuch() {
  const konten = [];

  eventStore.getEvents().forEach((event) => {
    switch (event.eventType) {
      case 'KontoErstellt':
        konten.push(erstelleKonto(event));
        break;
      case 'gebucht':
        buche(konten, event);
        break;
      case 'Zugang':
        assetZugang(konten, event);
        break;
      default:
        // Die übrigen Events ignorieren
    }
  });

  return konten;
}

module.exports = getHauptbuch;
