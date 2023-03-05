const getHauptbuch = require('../../views/hauptbuch');

function checkKontoExists(kontoName) {
  const bekannteKonten = getHauptbuch();
  const treffer = bekannteKonten.filter((konto) => konto.name === kontoName);
  if (!treffer || treffer.length === 0) {
    throw new Error(`Konto ${kontoName} ist unbekannt.`);
  }
  return treffer;
}

function checkDepotExists(depotName) {
  const konto = checkKontoExists(depotName);
  if (konto[0].kontoType !== 'Depot') {
    throw new Error(`Konto ${depotName} ist kein Depot.`);
  }
}

module.exports = {
  checkKontoExists,
  checkDepotExists,
};
