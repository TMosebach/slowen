const erstelleKonto = require('./handler/erstelle-konto');

function commandHandlerFactory(command) {
  const { commandType } = command;
  if (!commandType) {
    throw new Error('Kein Command-Type gegeben.');
  }
  switch (commandType) {
    case 'erstelleKonto':
      return erstelleKonto;
    default:
      throw new Error(`Unbekannter Command-Type ${commandType} - ${JSON.stringify(command)}`);
  }
}

module.exports = commandHandlerFactory;
