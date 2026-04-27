const pMap = require('p-map');
const { BaseHandler } = require('./base');
const { queryBlockletsWithMultipleKeywords } = require('../../libs/utils');
const { getSatisfiedBlocklets } = require('../../libs/blocklet');
const blockletVersion = require('../../db/blocklet-version');

/**
 * 搜索 Blocklets 处理器
 */
class SearchBlockletsHandler extends BaseHandler {
  /**
   * 处理搜索 Blocklets 请求
   * @param {Object} args 搜索参数
   * @param {Request} req Express 请求对象
   * @param {Response} res Express 响应对象
   * @returns {Promise<ToolResponse>} 处理结果
   */
  // eslint-disable-next-line no-unused-vars
  async handle(args, req, _res) {
    try {
      // 直接使用中间件设置的属性，与 /v2/blocklets.json 保持一致
      const { serverVersion, storeVersion } = req;
      const results = await queryBlockletsWithMultipleKeywords(req);

      // 处理版本兼容性 - 与 /v2/blocklets.json 完全一致
      // FIXME: 目前无法在搜索过程中对数据按照 requirements 来分页
      // 只能在查询结果中进行数据的清洗
      results.dataList = await getSatisfiedBlocklets(results.dataList, { serverVersion, storeVersion });

      // 特殊需求，通过参数来额外添加 - 与 /v2/blocklets.json 完全一致
      // 1. 获取每个 blocklet 的 version 总数
      if (req.query.versionCount === 'true') {
        await pMap(
          results.dataList,
          async (blocklet) => {
            const versionCount = await blockletVersion.count({ did: blocklet.did.toString() });
            blocklet.versionCount = versionCount;
          },
          { concurrency: 1 }
        );
      }

      // 返回与 /v2/blocklets.json 相同的数据结构
      return this.createSuccessResponse(results, 'Blocklets search completed successfully');
    } catch (error) {
      return this.createErrorResponse('Failed to search blocklets', 500, error);
    }
  }
}

module.exports = { SearchBlockletsHandler };
