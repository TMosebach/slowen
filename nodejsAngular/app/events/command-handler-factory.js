const validatoren = require('./validatoren');

const erstelleKonto = require('./handler/erstelle-konto');
const erstelleAsset = require('./handler/erstelle-asset');
const buche = require('./handler/buche');
const zugangVerbuchen = require('./handler/zugang-verbuchen');
const kaufVerbuchen = require('./handler/kauf-verbuchen');
const abgangBuchen = require('./handler/abgang-verbuchen');

function commandHandlerFactory(command) {
  const { commandType } = command;
  validatoren.checkExists(commandType, 'commandType');

  switch (commandType) {
    case 'erstelleKonto':
      return erstelleKonto;
    case 'erstelleAsset':
      return erstelleAsset;
    case 'buche':
      return buche;
    case 'zugangVerbuchen':
      return zugangVerbuchen;
    case 'kaufVerbuchen':
      return kaufVerbuchen;
    case 'abgangVerbuchen':
      return abgangBuchen;
    default:
      throw new Error(`Unbekannter Command-Type ${commandType} - ${JSON.stringify(command)}`);
  }
}

module.exports = commandHandlerFactory;
