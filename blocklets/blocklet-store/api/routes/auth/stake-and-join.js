const { getDeveloperStakeClaim, handleDeveloperStakeClaim, checkDidWalletVersion } = require('../../libs/auth-utils');

module.exports = {
  action: 'stake-and-join',
  onConnect: ({ userDid, userPk, didwallet, extraParams }) => {
    checkDidWalletVersion({ didwallet, extraParams });
    return getDeveloperStakeClaim({ userDid, userPk, extraParams });
  },
  onAuth: handleDeveloperStakeClaim,
};
