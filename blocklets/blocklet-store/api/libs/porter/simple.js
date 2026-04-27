/* eslint-disable no-await-in-loop */
const fs = require('fs-extra');
const path = require('path');
const { copyRecursive } = require('../fs');

class SimplePorter {
  /**
   *
   *
   * @param {{
   *  metas: {
   *    src: string,
   *    dest: string,
   *  }[]
   * }} { metas = [] }
   * @return {void}
   * @memberof BlockletSimplePorter
   */
  async batchCopy({ metas = [] }) {
    const metaList = metas.filter(Boolean);
    if (!metaList.length) {
      return;
    }
    for (const meta of metaList) {
      const { src, dest } = meta;
      if (fs.existsSync(src)) {
        fs.ensureDirSync(path.dirname(dest));
        await copyRecursive(src, dest);
      }
    }
  }
}

module.exports = SimplePorter;
