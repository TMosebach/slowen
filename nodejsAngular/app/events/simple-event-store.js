const events = [];

function addEvent(event) {
  events.push(event);
}

function getEvents() {
  return events;
}

module.exports = {
  addEvent,
  getEvents,
};
