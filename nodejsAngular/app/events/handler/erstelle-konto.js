function erstelleKonto(command) {
  const { name } = command;
  return {
    eventType: 'KontoErstellt',
    name,
  };
}

module.exports = erstelleKonto;
