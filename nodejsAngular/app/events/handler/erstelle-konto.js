const validatoren = require('../validatoren');

function erstelleKonto(command) {
  const { name } = command;

  validatoren.checkExists(name, 'Name', command);

  return {
    eventType: 'KontoErstellt',
    name,
  };
}

module.exports = erstelleKonto;
