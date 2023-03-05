const validatoren = require('../validatoren');
const { checkKontoExists } = require('./check-konto-exists');

function buche(command) {
  const { verwendung, empfaenger, umsaetze } = command;
  validatoren.checkExists(umsaetze, 'umsaetze');
  let summe = 0;
  umsaetze.forEach((umsatz) => {
    checkKontoExists(umsatz.konto);
    summe += umsatz.betrag.wert;
  });
  if (summe !== 0) {
    throw new Error(`Die Summe von Soll und Haben sind unterschhiedlich, Differenz: ${summe}`);
  }

  return {
    eventType: 'gebucht',
    created: new Date().toISOString(),
    verwendung,
    empfaenger,
    umsaetze,
  };
}

module.exports = buche;
