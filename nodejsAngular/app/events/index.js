const express = require('express');
const eventStore = require('./simple-event-store');

const commandHandlerFactory = require('./command-handler-factory');

function execute(req, res) {
  try {
    const command = req.body;
    const handler = commandHandlerFactory(command);
    const event = handler(command);
    eventStore.addEvent(event);
    res.status(201).send(event);
  } catch (err) {
    res.status(400).send(err.message);
  }
}

function getEvents(req, res) {
  res.send(eventStore.getEvents());
}

// Todo function getEventStream(req, res)

const router = express.Router();
router.get('/events', getEvents);
router.post('/commands', execute);

module.exports = router;
