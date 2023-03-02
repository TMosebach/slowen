const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

const events = require('./events');

app.use('/api', events);

const port = process.env.PORT || 3000;
app.listen(port, (err) => {
  if (err) {
    process.stdout.write(`Error: ${err}`);
  } else {
    process.stdout.write(`Server läuft auf Port ${port}\n`);
  }
});
