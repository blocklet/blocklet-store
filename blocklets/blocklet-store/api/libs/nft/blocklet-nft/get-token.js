const { client } = require('../../auth');

let tokenCache = null;

const getToken = async () => {
  if (!tokenCache) {
    const result = await client.getForgeState({});
    const { token } = result.state;
    tokenCache = token;
  }
  return tokenCache;
};

module.exports = { getToken };
