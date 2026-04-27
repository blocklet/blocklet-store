const flat = require('flat');

module.exports = flat({
  common: {
    viewBlocklet: '查看应用',
    viewTransaction: '查看交易',
    parameterMustExistIn: 'Parameter {param} must exist in {params}',
  },
  auth: {
    error: {
      needInvite: '您必须被邀请才能访问此商店',
      userNotFound: '您还不是此商店的用户',
      userBlocked: '您的访问权限已被撤销',
      passportNotFound: '您的开发者护照未找到或已被撤销',
      didWalletOutdated: '请升级 DID Wallet 到最新版本',
      passportExist: '您已经拥有有效的开发者护照',
      stakeExist: '您已经质押足够多的代币以加入开发者计划',
      stakeNotEnough: '您需要质押更多代币以加入开发者计划',
      generateDidForNewBlocklet: '请为新应用生成 DID',
    },
    publish: {
      blockletNotFound: 'Blocklet 不存在',
      blockletBlocked: 'Blocklet 已被禁用',
      signContent: '请对以下内容进行签名以发布项目 "{name}"',
      createNFTFactory: '请对创建 NFT Factory 的交易签名',
      successTitle: '🚀 "{blockletName}" 已发布',
      successDescription: '"{blockletName}" {blockletLatestVersion} 版本发布成功',
      successTitleForStoreOwner: '🚀 "{blockletName}" 已发布',
      successDescriptionForStoreOwner: '{userInfo} 发布了 "{blockletName}" {blockletLatestVersion} 版本',
      stake: '批准如下交易来完成应用交易的质押',
      signatureNotFound: '签名未找到',
    },
    create: {
      nameRequired: 'Blocklet 名称是必填的',
      remarkRequired: 'Blocklet 描述是必填的',
      nameExist: 'Blocklet 名称已经存在，请换一个名称',
      successTitle: '"{blockletName}" 创建成功',
      successDescription: '"{blockletName}" 创建完成',
      successTitleForStoreOwner: '"{blockletName}" 创建成功',
      successDescriptionForStoreOwner: '开发者已创建 "{blockletName}"',
    },
    upload: {
      successTitle: '"{blockletName}" 上传成功',
      successDescription: '"{blockletName}" {blockletLatestVersion} 版本上传完成',
    },
    autoPublish: {
      signDescription: '请签署下面内容以授权应用商店自动发布 "{name}"',
      enableTitle: '"{blockletName}" 已启用自动发布',
      enableDescription: '"{blockletName}" 从 {blockletReleasedVersion} 版本起将自动发布',
      enabledButNftFactoryChangeTitle: '"{blockletName}" 自动发布已被禁用',
      enabledButNftFactoryChangeDescription:
        '由于定价变更，"{blockletName}" 的自动发布功能已被禁用，需要手动发布后才能重新启用',
      disableTitle: '"{blockletName}" 已被禁用自动发布',
      disableDescription: '"{blockletName}" 从 {blockletReleasedVersion} 版本起将停止自动发布',
      successTitle: '🚀 "{blockletName}" 已自动发布',
      successDescription: '"{blockletName}" {blockletLatestVersion} 版本自动发布完成',
      successTitleForStoreOwner: '🚀 "{blockletName}" 已自动发布',
      successDescriptionForStoreOwner: '{userInfo} 的 "{blockletName}" {blockletLatestVersion} 版本已自动发布',
    },
    purchase: {
      successTitle: '"{blockletName}" 购买成功',
      successDescription: '{purchaserDid} 购买了 "{blockletName}"，开发者收益为 {profitMessage}',
      successTitleForStoreOwner: '"{blockletName}" 购买成功',
      successDescriptionForStoreOwner: '{purchaserDid} 购买了 "{blockletName}"，商店 {appId} 收益为 {profitMessage}',
    },
    joined: {
      profile: '请提供您的个人资料以加入开发者计划',
      scanDescription: '提供来自 {trustedCertifyStore} 的商店开发者的 NFT 以继续',
      stakeMessage: '质押以加入开发者计划',
      successTitleForStoreOwner: '{fullNameOrUserDid} 成功注册成为开发者',
      successDescriptionForStoreOwner: '用户 DID: {userDid}，来源: {source}',
    },
    verifyPurchaseBlocklet: {
      blockletPurchaseNftDescription: '请提供应用购买凭证',
    },
  },
  blocklet: {
    blocked: {
      title: '"{blockletName}" 已被禁用',
      description: '禁用原因: {reason}',
    },
    unBlocked: {
      title: '"{blockletName}" 已启用',
    },
    reviewed: {
      pendingReviewTitle: '🚧 "{blockletName}" 等待审核中',
      pendingReviewDescription: '"{blockletName}" {version} 版本已提交审核申请，请审核',
      inReviewTitle: '👀 "{blockletName}" 正在审核',
      inReviewDescription: '管理员正在审核 "{blockletName}" {version} 版本',
      approvedTitle: '✅ "{blockletName}" 审核通过',
      approvedDescription: '恭喜！"{blockletName}" {version} 版本已通过审核，请及时发布',
      rejectedTitle: '❌ "{blockletName}" 审核未通过',
      rejectedDescription: '很抱歉！"{blockletName}" {version} 版本未通过审核，请根据反馈修改后重新提交',
      cancelledTitle: '✖️ "{blockletName}" 审核已取消',
      cancelledDescription: '"{blockletName}" {version} 版本的审核已取消',
    },
  },
});
