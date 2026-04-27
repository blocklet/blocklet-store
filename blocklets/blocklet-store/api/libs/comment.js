const component = require('@blocklet/sdk/lib/component');
const { REVIEW_BOARD_ID, DISCUSS_KIT_DID } = require('./constant');
const logger = require('./logger');

async function createReviewBoard() {
  try {
    const { status } = await component.call({
      name: DISCUSS_KIT_DID,
      path: '/api/boards',
      data: {
        id: REVIEW_BOARD_ID,
        title: 'Blocklet Review',
        desc: 'A board dedicated to Blocklet review',
        icon: '🚦',
        translation: {
          title: {
            zh: 'Blocklet 审核',
            en: 'Blocklet Review',
          },
          desc: {
            zh: '一个用于 Blocklet 审核的板块',
            en: 'A board dedicated to Blocklet review',
          },
        },
      },
    });
    if (status === 200) {
      logger.info('create "Blocklet Review" board success');
    }
  } catch (e) {
    logger.error('create "Blocklet Review" board failed', e);
    throw new Error(`create "Blocklet Review" board failed: ${e.message}`);
  }
}

async function createTopicPost({ url, reviewId, title, version, blockletOwnerDid }) {
  const { data } = await component.call({
    name: DISCUSS_KIT_DID,
    path: '/api/call/posts/topics',
    data: {
      id: reviewId,
      title: `${title}(v${version}) - Review History`,
      url,
      boardId: REVIEW_BOARD_ID,
      allowedUserDids: [blockletOwnerDid],
      allowedPassports: ['admin'],
    },
  });
  return data;
}

async function publishComment({ reviewId, content, author }) {
  const { data } = await component.call({
    name: DISCUSS_KIT_DID,
    path: `/api/call/posts/topics/${reviewId}/comments`,
    data: { content, author },
  });
  return data;
}

async function systemComment({ reviewId, text, color = '' }) {
  try {
    const content = getCommentContent({ text, color });
    return await publishComment({ reviewId, content });
  } catch (e) {
    logger.error(`left system comment ${text} to ${reviewId} failed:`, e);
    return false;
  }
}

module.exports = {
  createReviewBoard,
  createTopicPost,
  publishComment,
  systemComment,
};

const getCommentContent = ({ text, color = '' }) => {
  return JSON.stringify({
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 1,
              mode: 'normal',
              style: color ? `color: ${color};` : '',
              text,
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  });
};
