const validatoren = require('./validatoren');

const erstelleKonto = require('./handler/erstelle-konto');
const erstelleAsset = require('./handler/erstelle-asset');

function commandHandlerFactory(command) {
  const { commandType } = command;
  validatoren.checkExists(commandType, 'commandType');

  switch (commandType) {
    case 'erstelleKonto':
      return erstelleKonto;
    case 'erstelleAsset':
      return erstelleAsset;
    default:
      throw new Error(`Unbekannter Command-Type ${commandType} - ${JSON.stringify(command)}`);
  }
}

module.exports = commandHandlerFactory;
