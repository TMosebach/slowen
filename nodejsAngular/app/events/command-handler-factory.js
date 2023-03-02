const erstelleKonto = require('./handler/erstelle-konto');
const validatoren = require('./validatoren');

function commandHandlerFactory(command) {
  const { commandType } = command;
  validatoren.checkExists(commandType, 'commandType');

  switch (commandType) {
    case 'erstelleKonto':
      return erstelleKonto;
    default:
      throw new Error(`Unbekannter Command-Type ${commandType} - ${JSON.stringify(command)}`);
  }
}

module.exports = commandHandlerFactory;
