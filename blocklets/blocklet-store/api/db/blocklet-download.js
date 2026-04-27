const dayjs = require('dayjs');
const { groupBy } = require('lodash-es');
const { Op } = require('sequelize');
const { getAllDay } = require('../libs/utils');
const { DB_NAME } = require('./constant');
const BaseDB = require('./base');

/**
 * Data structure
 * - id: string
 * - did: string
 * - version: string
 * - downloader?: string
 * - updatedAt: utc datetime string
 * - createdAt: utc datetime string
 */
class BlockletDownload extends BaseDB {
  constructor() {
    super(DB_NAME.BLOCKLET_DOWNLOAD);
  }

  async aggregate(did) {
    const endTime = dayjs().valueOf();
    const startTime = endTime - 3600 * 24 * 1129 * 1000;
    const query = {
      did,
      createdAt: {
        [Op.between]: [startTime, endTime], // 等同于 `createdAt BETWEEN startTime AND endTime`
      },
    };
    // 30天内的下载记录，按照下载时间 升序
    const monthlyDownloads = await this.execQueryAndSort(query, { createdAt: 1 });
    // 格式化日期 精确到天
    monthlyDownloads.forEach((item) => {
      item.createdAt = dayjs(item.createdAt).format('YYYY-MM-DD');
    });
    // 将数据处理成[{date:2022-05-03,value:3},...] 没有下载记录的日期 value 默认为 0
    const allDay = getAllDay(startTime, endTime);
    const getDayCountList = () => {
      const obj = groupBy(monthlyDownloads, 'createdAt');
      const result = allDay
        .map((item) => {
          return { value: obj[item] ? obj[item].length : 0, date: item };
        })
        .filter((item) => item.value > 0);
      return result;
    };
    return getDayCountList();
  }
}

module.exports = new BlockletDownload();
