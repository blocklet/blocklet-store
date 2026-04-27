const BlockletNotification = require('@blocklet/sdk/service/notification');

const logger = '../logger';

const createInfoTable = (infoData = {}) => {
  const fields = Object.keys(infoData).reduce((list, cur) => {
    const item = infoData[cur];
    const data = {
      type: 'plain',
      text: item,
      color: undefined,
    };

    if (Array.isArray(item)) {
      const [text, color] = item;
      data.text = text;
      if (color) {
        data.color = color;
      }
    }

    if (typeof data.text !== 'string') {
      data.text = String(data.text);
    }

    list.push(
      // @ts-ignore
      {
        type: 'text',
        data: {
          type: 'plain',
          color: '#9397A1',
          text: cur,
        },
      },
      {
        type: 'text',
        data,
      }
    );
    return list;
  }, []);

  return {
    type: 'section',
    fields,
  };
};

const sendNotification = async ({ to, title, message, actions, attachments = [] }) => {
  try {
    const payload = { title, body: message, actions: actions || [], attachments: [...attachments] };

    await BlockletNotification.sendToUser(to, payload);

    logger.info('text message was sent', { to, payload: JSON.stringify(payload, null, 2) });
  } catch (error) {
    logger.error('send text message failed', { error, to, message, actions, attachments });
    throw error;
  }
};

module.exports = { sendNotification, createInfoTable };
