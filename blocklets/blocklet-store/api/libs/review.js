const Blocklet = require('../db/blocklet');
const BlockletCategory = require('../db/blocklet-category');
const blockletVersion = require('../db/blocklet-version');
const { VERSION_STATUS, REVIEW_TYPE } = require('../db/constant');
const { systemComment } = require('./comment');

async function startReview({ blocklet, version, operator }) {
  const versionInfo = await blockletVersion.findOne({ did: blocklet.did, version });

  const newVersion = {
    ...versionInfo,
    status: VERSION_STATUS.IN_REVIEW,
    inReviewAt: new Date().toISOString(),
    operations: {
      ...(versionInfo.operations || {}),
      [VERSION_STATUS.IN_REVIEW]: operator,
    },
  };

  await blockletVersion.update({ did: blocklet.did, version }, newVersion);
  await Blocklet.update(
    { did: blocklet.did },
    {
      $set: {
        reviewVersion: newVersion,
        ...(blocklet.latestVersion.version === version ? { latestVersion: newVersion } : {}),
      },
    }
  );

  await systemComment({ reviewId: newVersion.id, text: '👀 In Review ...', color: '#4196ff' });
  return { code: 200, status: VERSION_STATUS.IN_REVIEW };
}

async function approveReview({ blocklet, version, categoryId, reviewType, operator }) {
  // 校验 category 必填
  if (!categoryId) {
    return { code: 400, error: 'The category is required' };
  }
  // 检查 category 是否存在, 不存在时拒绝客户端请求
  const category = await BlockletCategory.findOne({ id: categoryId });
  if (!category) {
    return { code: 400, error: 'The category is not exist' };
  }

  const versionInfo = await blockletVersion.findOne({ did: blocklet.did, version });
  if (versionInfo.status === VERSION_STATUS.CANCELLED) {
    return { code: 400, error: 'The version has been cancelled' };
  }

  if (versionInfo.status !== VERSION_STATUS.IN_REVIEW) {
    return { code: 400, error: 'The version is not in review status' };
  }

  const newVersion = {
    ...versionInfo,
    status: VERSION_STATUS.APPROVED,
    approvedAt: new Date().toISOString(),
    operations: {
      ...(versionInfo.operations || {}),
      [VERSION_STATUS.APPROVED]: operator,
    },
  };

  await blockletVersion.update({ did: blocklet.did, version }, newVersion);
  await Blocklet.update(
    { did: blocklet.did },
    {
      $set: {
        reviewVersion: newVersion,
        ...(blocklet.latestVersion.version === version ? { latestVersion: newVersion } : {}),
        reviewType: reviewType === REVIEW_TYPE.FIRST ? REVIEW_TYPE.FIRST : REVIEW_TYPE.EACH,
        category: categoryId,
      },
    }
  );

  await systemComment({ reviewId: newVersion.id, text: '✅ Approved !', color: '#7ed321' });
  return { code: 200, status: VERSION_STATUS.APPROVED };
}

async function rejectReview({ blocklet, version, operator }) {
  const versionInfo = await blockletVersion.findOne({ did: blocklet.did, version });
  if (versionInfo.status === VERSION_STATUS.CANCELLED) {
    return { code: 400, error: 'The version has been cancelled' };
  }

  if (versionInfo.status !== VERSION_STATUS.IN_REVIEW) {
    return { code: 400, error: 'The version is not in review status' };
  }

  const newVersion = {
    ...versionInfo,
    status: VERSION_STATUS.REJECTED,
    rejectedAt: new Date().toISOString(),
    operations: {
      ...(versionInfo.operations || {}),
      [VERSION_STATUS.REJECTED]: operator,
    },
  };

  await blockletVersion.update({ did: blocklet.did, version }, newVersion);
  await Blocklet.update(
    { did: blocklet.did },
    {
      $set: {
        reviewVersion: newVersion,
        ...(blocklet.latestVersion.version === version ? { latestVersion: newVersion } : {}),
      },
    }
  );

  await systemComment({ reviewId: newVersion.id, text: '⛔ Rejected !', color: '#d0021b' });
  return { code: 200, status: VERSION_STATUS.REJECTED };
}

module.exports = { startReview, approveReview, rejectReview };
