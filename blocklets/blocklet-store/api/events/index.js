const { event, Events } = require('./event');

require('./handlers/notify');
require('./handlers/meilisearch');
require('./handlers/event-bus');

module.exports = {
  event,
  Events,
};
