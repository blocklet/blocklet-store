const AccessToken = require('../../db/access-token');
const { checkDeveloperPassport } = require('../../libs/auth-utils');

module.exports = {
  action: 'connect-cli',
  claims: {
    profile: async ({ userDid, extraParams = {} }) => {
      const { locale = 'en' } = extraParams;

      await checkDeveloperPassport(userDid, locale);
      return {
        fields: ['fullName', 'avatar', 'email'],
      };
    },
  },

  onAuth: async ({ userDid, claims, updateSession }) => {
    const profile = claims.find((item) => item.type === 'profile');
    const data = await AccessToken.create({ userDid, remark: 'generated-from-connect' });
    updateSession(
      {
        config: {
          developerDid: userDid,
          secretKey: data.secretKey,
          email: profile.email,
          name: profile.fullName,
        },
      },
      true
    );
  },
};
