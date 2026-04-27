const flat = require('flat');

module.exports = flat({
  common: {
    viewBlocklet: 'View Blocklet',
    viewTransaction: 'View Transaction',
    parameterMustExistIn: 'Parameter {param} must exist in {params}',
  },
  auth: {
    error: {
      needInvite: 'Your must be invited to access this store',
      userNotFound: 'You are not a user on this store yet',
      userBlocked: 'Your access to this store has been revoked',
      passportNotFound: 'Your developer passport not found or has been revoked',
      didWalletOutdated: 'Please upgrade DID Wallet to latest version',
      passportExist: 'You already got a valid developer passport',
      stakeExist: 'You already staked enough tokens to join as developer',
      stakeNotEnough: 'You need to stake more tokens to join as developer',
      generateDidForNewBlocklet: 'Please generate DID for new blocklet',
    },
    publish: {
      blockletNotFound: 'Blocklet not found',
      blockletBlocked: 'Blocklet has been blocked',
      signContent: 'Please sign this content to publish "{name}"',
      createNFTFactory: 'Please sign the transaction to create factory',
      successTitle: '🚀 "{blockletName}" was published',
      successDescription: '"{blockletName}" version {blockletLatestVersion} was published successfully',
      successTitleForStoreOwner: '🚀 "{blockletName}" was published',
      successDescriptionForStoreOwner: '{userInfo} published "{blockletName}" version {blockletLatestVersion}',
      stake: 'Approve this transaction to stake for publishing',
      signatureNotFound: 'Signature not found',
    },
    create: {
      nameRequired: 'Name is required',
      remarkRequired: 'Remark is required',
      nameExist: 'Name already exists',
      successTitle: '"{blockletName}" was created',
      successDescription: '"{blockletName}" was created successfully',
      successTitleForStoreOwner: '"{blockletName}" was created',
      successDescriptionForStoreOwner: '{developerDid} created a new Blocklet "{blockletName}"',
    },
    upload: {
      successTitle: '"{blockletName}" was uploaded',
      successDescription: '"{blockletName}" new version {blockletLatestVersion} uploaded successfully',
    },
    autoPublish: {
      signDescription: 'Sign the following delegation to enable auto publish for "{name}"',
      enableTitle: '"{blockletName}" auto publish is on',
      enableDescription: '"{blockletName}" will start auto publishing from version {blockletReleasedVersion}',
      enabledButNftFactoryChangeTitle: '"{blockletName}" auto publish is off',
      enabledButNftFactoryChangeDescription:
        'Due to pricing changes, "{blockletName}" needs manual publishing before turning auto publish back on',
      disableTitle: '"{blockletName}" auto publish is off',
      disableDescription: '"{blockletName}" will stop auto publishing from version {blockletReleasedVersion}',
      successTitle: '🚀 "{blockletName}" was auto-published',
      successDescription: '"{blockletName}" version {blockletLatestVersion} went live via auto publish',
      successTitleForStoreOwner: '🚀 "{blockletName}" was auto-published',
      successDescriptionForStoreOwner: '{userInfo} auto published "{blockletName}" version {blockletLatestVersion}',
    },
    purchase: {
      successTitle: 'New Purchase for "{blockletName}"',
      successDescription: '{purchaserDid} bought "{blockletName}", developer earned {profitMessage}',
      successTitleForStoreOwner: 'New Purchase for "{blockletName}"',
      successDescriptionForStoreOwner: '{purchaserDid} bought "{blockletName}", store {appId} earned {profitMessage}',
    },
    joined: {
      profile: 'Please provide your profile information to join as developer',
      scanDescription: 'Provide stake to join the developer program',
      stakeMessage: 'Stake for developer passport',
      successTitleForStoreOwner: '{fullNameOrUserDid} successfully registered as a developer',
      successDescriptionForStoreOwner: 'User DID: {userDid}, Source: {source}',
    },
    verifyPurchaseBlocklet: {
      blockletPurchaseNftDescription: 'Please provide Purchase NFT',
    },
  },
  blocklet: {
    blocked: {
      title: '"{blockletName}" has been disabled',
      description: 'Reason for disabling: {reason}',
    },
    unBlocked: {
      title: '"{blockletName}" is enabled',
    },
    reviewed: {
      pendingReviewTitle: '🚧 "{blockletName}" awaits review',
      pendingReviewDescription: '"{blockletName}" version {version} needs review',
      inReviewTitle: '👀 "{blockletName}" review in progress',
      inReviewDescription: 'Review for "{blockletName}" version {version} is ongoing',
      approvedTitle: '✅ "{blockletName}" passed review',
      approvedDescription: 'Congratulations! "{blockletName}" version {version} passed review, ready to publish',
      rejectedTitle: '❌ "{blockletName}" failed review',
      rejectedDescription: 'Sorry! "{blockletName}" version {version} needs changes. Please update and try again',
      cancelledTitle: '✖️ "{blockletName}" review stopped',
      cancelledDescription: 'Review for "{blockletName}" version {version} has stopped',
    },
  },
});
