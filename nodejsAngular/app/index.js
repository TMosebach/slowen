const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Konfiguration
const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Controller definieren
const events = require('./events');
const views = require('./views');

app.use('/api', events);
app.use('/api/views', views);

// Start des Servers
const port = process.env.PORT || 3000;
app.listen(port, (err) => {
  if (err) {
    process.stdout.write(`Error: ${err}`);
  } else {
    process.stdout.write(`Server läuft auf Port ${port}\n`);
  }
});
