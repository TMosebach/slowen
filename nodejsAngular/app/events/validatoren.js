function checkValueIsIn(value, werteraum) {
  if (value) {
    const result = werteraum.filter((w) => w === value);
    if (result.length !== 1) {
      throw new Error(`Wert <${value}> nicht im Definitionsbereich (${werteraum})`);
    }
  }
}

function checkExists(value, name, obj) {
  if (!value) {
    let msg = `${name} fehlt`;
    if (obj) {
      msg = `${msg} - ${JSON.stringify(obj)}`;
    }
    throw Error(msg);
  }
}

module.exports = {
  checkExists,
  checkValueIsIn,
};
