const { sendToRelay } = require('@blocklet/sdk/service/notification');

module.exports = {
  broadcast: (channel, eventName, data) =>
    sendToRelay(channel, eventName, data).catch((err) =>
      console.error(`Failed to broadcast info: vault.${channel}.${eventName}`, err)
    ),
};
