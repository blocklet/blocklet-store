const { fromRandom } = require('@ocap/wallet');
const { toBase58 } = require('@ocap/util');
const { DB_NAME } = require('./constant');
const BaseDB = require('./base');

/**
 * Data structure
 * - id: string  // did of wallet
 * - publicKey: string
 * - secretKey: string // short placeholder of secretKey
 * - userDid: string
 * - remark: string
 * - status: string  revoked, normal
 * - latestUsedAt: Date
 */

class AccessToken extends BaseDB {
  constructor() {
    super(DB_NAME.ACCESS_TOKEN);
  }

  STATUS = {
    NORMAL: 'normal',
    REVOKED: 'revoked',
  };

  async create({ remark, userDid }) {
    validateRemark(remark);
    validateUserDid(userDid);

    const wallet = fromRandom();
    const secretKey = toBase58(wallet.secretKey);
    const data = {
      id: wallet.address,
      publicKey: wallet.publicKey,
      secretKey: `${secretKey.slice(0, 4)}......${secretKey.slice(-4)}`,
      userDid,
      status: this.STATUS.NORMAL,
    };
    if (remark) {
      data.remark = remark;
    }
    const doc = await this.insert(data);
    return {
      ...doc,
      secretKey,
    };
  }

  async checkAccessTokenNormal(accessTokenId) {
    const res = await this.findOne({
      id: accessTokenId,
      status: this.STATUS.NORMAL,
    });
    return !!res;
  }

  async checkUserAccessToken(userDid, accessTokenId) {
    const res = await this.findOne({
      userDid,
      id: accessTokenId,
      status: this.STATUS.NORMAL,
    });
    return !!res;
  }

  async checkOwner(userDid, accessTokenId) {
    const res = await this.findOne({
      userDid,
      id: accessTokenId,
    });
    return !!res;
  }
}

function validateRemark(remark) {
  if (remark && remark.length > 50) {
    throw new Error('Remark length should NOT be more than 50 characters');
  }
}

function validateUserDid(userDid) {
  if (!userDid) {
    throw new Error('user should not be empty');
  }
}

module.exports = new AccessToken();
