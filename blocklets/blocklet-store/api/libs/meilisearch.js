const pWaitFor = require('p-wait-for');
const pRetry = require('p-retry');
const fs = require('fs');
const shell = require('shelljs');
const stringify = require('json-stable-stringify');
const { events, Events } = require('@blocklet/sdk/lib/config');
const { SearchKitClient } = require('@blocklet/search-kit-js');
const { getComponentWebEndpoint } = require('@blocklet/sdk/lib/component');

const Blocklet = require('../db/blocklet');
const MeilisearchError = require('../db/meilisearch-error');
const logger = require('./logger');
const { INDEX_SETTINGS, INDEX_NAME, MAX_RETRY_COUNT, MS_BINARY_NAME, MS_BINARY_PATH } = require('./constant');
const env = require('./env');

const host = getComponentWebEndpoint('z8iZorY6mvb5tZrxXTqhBmwu89xjEEazrgT3t');

class MeiliSearchClient extends SearchKitClient {
  async init() {
    // ms 通过 primaryKey 保证数据的唯一性，不会出现重复数据；
    await this.importDB();
    // 设置过滤项、排序项、可以被搜索的字段
    await this.updateSettings();
  }

  async clear() {
    logger.info('Start clear meilisearch data ');
    // 删除文档
    const delDocTask = await this.index(INDEX_NAME).deleteAllDocuments();
    await this.waitForTask(delDocTask.taskUid);
    // 删除索引
    const delIndexTask = await this.deleteIndex(INDEX_NAME);
    await this.waitForTask(delIndexTask.taskUid);
    logger.info('Meilisearch clear data successfully ');
  }

  async importDB() {
    logger.info('Start importing data to meilisearch ');
    const blocklets = await Blocklet.getAllBlocklets({});
    blocklets.forEach((blocklet) => {
      if (!blocklet.payment || blocklet.payment.price.length === 0) {
        blocklet.payment = { price: [{ value: 0 }] };
      }
      if (blocklet.author) {
        delete blocklet.author;
      }
      if (blocklet.owner?.email) {
        delete blocklet.owner.email;
      }
    });
    const task = await this.index(INDEX_NAME).addDocuments(blocklets, { primaryKey: 'id' });
    await this.waitForTask(task.taskUid);
    logger.info('Imported data to meilisearch successfully ');
  }

  async updateSettings(settings = INDEX_SETTINGS) {
    logger.info('Start meilisearch updateSettings');
    const task = await this.index(INDEX_NAME).updateSettings(settings);
    await this.waitForTask(task.taskUid);
    logger.info('Meilisearch updateSettings successfully');
  }

  async getBlocklets(params = {}) {
    const { pagination, query } = params;
    const { keyword, sortDirection, sortBy } = params.queryOptions;
    const sort = `${sortBy || 'stats.downloads'}:${sortDirection || 'desc'}`;
    const result = await this.index('blocklets').search(keyword, {
      filter: this.getBlockletFilterParams(query),
      sort: [sort],
      limit: pagination.pageSize,
      offset: pagination.page * pagination.pageSize - pagination.pageSize,
      // 返回到搜索结果中根据搜索关键字需要高亮的字段
      attributesToHighlight: ['title', 'name', 'description'],
      highlightPreTag: '<span class="ms-highlight">',
      highlightPostTag: '</span>',
    });

    const officialAccounts = (env.preferences.officialAccounts || []).map((account) => account.did);

    // 移除 email 信息
    result.hits = result.hits.map((meta) => {
      if (meta.owner?.email) {
        delete meta.owner.email;
      }
      if (meta.author) {
        delete meta.author;
      }

      if (officialAccounts.includes(meta.owner.did)) {
        meta.isOfficial = true;
      }
      return meta;
    });
    return result;
  }

  async getMultipleBlocklets(params = {}) {
    const { pagination, query } = params;
    const { keywords, sortDirection, sortBy } = params.queryOptions;
    const sort = `${sortBy || 'stats.downloads'}:${sortDirection || 'desc'}`;

    const result = await this.multiSearch({
      federation: {
        limit: pagination.pageSize,
        offset: pagination.page * pagination.pageSize - pagination.pageSize,
      },
      queries: [
        ...keywords.map((keyword) => ({
          indexUid: 'blocklets',
          q: keyword,
          filter: this.getBlockletFilterParams(query),
          sort: [sort],
          // 返回到搜索结果中根据搜索关键字需要高亮的字段
          attributesToHighlight: ['title', 'name', 'description'],
          highlightPreTag: '<span class="ms-highlight">',
          highlightPostTag: '</span>',
        })),
      ],
    });
    const officialAccounts = (env.preferences.officialAccounts || []).map((account) => account.did);

    // 移除 email 信息
    result.hits = result.hits.map((meta) => {
      if (meta.owner?.email) {
        delete meta.owner.email;
      }
      if (meta.author) {
        delete meta.author;
      }

      if (officialAccounts.includes(meta.owner.did)) {
        meta.isOfficial = true;
      }
      return meta;
    });
    return result;
  }

  getBlockletFilterParams(query = {}) {
    const {
      category = '',
      price = '',
      owner = '',
      resourceType = '',
      resourceDid = '',
      didList = '',
      noDidList = '',
      createdAt = '',
      showResources,
      isOfficial = '',
    } = query;
    const result = [];
    const officialAccounts = (env.preferences.officialAccounts || []).map((account) => account.did).join(',');

    if (`${showResources}` === 'false') {
      result.push('group EXISTS OR engine.interpreter = "blocklet"');
    }

    if (`${isOfficial}` === 'true') {
      result.push(`ownerDid IN [${officialAccounts}]`);
    }

    if (didList) {
      result.push(`did IN [${didList}]`);
    }
    if (noDidList) {
      result.push(`did NOT IN [${noDidList}]`);
    }

    if (createdAt) {
      result.push(`createdAt >= "${new Date(createdAt).getTime()}"`);
    }

    if (price) {
      const conditions = price === 'payment' ? '!=' : '=';
      result.push(`payment.price.value ${conditions} 0`);
    }
    if (category) {
      result.push(`category.id = ${category}`);
    }
    if (owner) {
      result.push(`owner.did = ${owner}`);
    }
    if (resourceDid) {
      result.push(`resource.bundles.did = ${resourceDid}`);
    }
    if (resourceType) {
      result.push(`resource.bundles.type = ${resourceType}`);
      // TODO: @zhanghan 2024-05-28 将来需要使用别的字段来控制资源是否能被搜索到
      // result.push('resource.bundles.public = true');
    }
    return result;
  }

  async updateBlocklet(id, doc) {
    const isUpdate = await this.isBlockletExist(id);
    if (isUpdate) {
      const run = async () => {
        const task = await this.index(INDEX_NAME).updateDocuments([
          {
            id,
            ...doc,
          },
        ]);
        await this.waitForTask(task.taskUid);
        return true;
      };
      await this.retryTask(run, { id, action: 'updateBlocklet' });
    }
  }

  async deleteBlocklet(id) {
    let blocklet = null;
    try {
      blocklet = await this.index(INDEX_NAME).getDocument(id);
    } catch (error) {
      logger.info('No need to delete blocklet from meilisearch', id);
    }
    if (blocklet) {
      const run = async () => {
        const task = await this.index(INDEX_NAME).deleteDocument(id);
        await this.waitForTask(task.taskUid);
        return true;
      };
      await this.retryTask(run, { id, action: 'deleteBlocklet' });
    }
  }

  async addBlocklet(id) {
    const where = this.getWhere(id);
    const isUpdate = await this.isBlockletExist(id);
    if (isUpdate) {
      const run = async () => {
        const [blocklet] = await Blocklet.getAllBlocklets({
          where,
        });

        if (!blocklet.payment || blocklet.payment.price.length === 0) {
          blocklet.payment = { price: [{ value: 0 }] };
        }

        if (blocklet.resource?.bundles?.length) {
          blocklet.resource = { bundles: blocklet.resource.bundles };
        }

        if (blocklet.author) {
          delete blocklet.author;
        }
        if (blocklet.owner?.email) {
          delete blocklet.owner.email;
        }

        const task = await this.index(INDEX_NAME).addDocuments([blocklet]);
        await this.waitForTask(task.taskUid);
        return true;
      };
      await this.retryTask(run, { id, action: 'addBlocklet' });
    }
  }

  /**
   * 校验是否更新 ms 中的 blocklet
   */
  async isBlockletExist(id) {
    const where = this.getWhere(id);
    const blocklet = await Blocklet.findOne(where);
    return !!blocklet;
  }

  /**
   * 轮询 task 的状态
   * @param {*} taskUid
   * @param {*} options
   */
  async waitForTask(taskUid, options = {}) {
    if (taskUid !== 0 && !taskUid) throw new Error('params taskUid is required');

    await pWaitFor(
      async () => {
        const result = await this.getTask(taskUid);
        if (result?.status === 'succeeded') {
          logger.info('task succeeded');
          return true;
        }
        // 当任务状态为 failed 时结束轮询
        if (result?.status === 'failed') {
          logger.error('task failed', result.error);
          throw new Error(result.error.message);
        }
        return false;
      },
      { timeout: 1000 * 3, interval: 300, ...options }
    );
  }

  /**
   * 轮询 meilisearch 是否启动
   * @param {*} options
   */
  async waitForMeilisearch(options = {}) {
    const meilisearchExist = this.findExistingBinary();
    logger.info('meilisearchExist', meilisearchExist);
    await pWaitFor(
      async () => {
        logger.info('pWaitFor meilisearch running', host);
        let result = null;
        try {
          result = await this.isHealthy();
        } catch (error) {
          logger.info('meilisearch is not running', error);
        }
        return result;
      },
      { interval: meilisearchExist ? 1000 : 3000, timeout: meilisearchExist ? 1000 * 30 : 1000 * 300, ...options }
    );
  }

  /**
   * 尝试重新执行 task
   * @param {*} run
   * @param {*} options
   */
  async retryTask(run, options = {}) {
    try {
      await pRetry(run, {
        retries: MAX_RETRY_COUNT,
      });
    } catch (error) {
      logger.error(error);
      await MeilisearchError.insert({
        blockletId: options.id,
        message: error.message,
        action: options.action,
      });
    }
  }

  async isIndexExist(indexName = INDEX_NAME) {
    let index = null;
    try {
      index = await this.index(INDEX_NAME).getRawInfo();
    } catch (error) {
      logger.info(`Index ${indexName} does not exist`);
    }
    return !!index;
  }

  findExistingBinary() {
    const result = shell.exec(`which ${MS_BINARY_NAME}`, { silent: true });
    if (result.stdout && fs.existsSync(result.stdout.trim())) {
      return result.stdout.trim();
    }
    return fs.existsSync(MS_BINARY_PATH);
  }

  getWhere(id) {
    return {
      $and: [
        {
          id,
          currentVersion: { $exists: true },
        },
        {
          currentVersion: { $ne: null },
          status: Blocklet.STATUS.NORMAL,
          permission: { $ne: Blocklet.PERMISSIONS.PRIVATE },
        },
      ],
    };
  }

  async verifyIndexSettings() {
    const isIndexExist = await this.isIndexExist(INDEX_NAME);
    // 如果不存在索引 则重新 init
    if (!isIndexExist) {
      await this.init();
    } else {
      const settings = await this.index(INDEX_NAME).getSettings();
      if (stringify(settings) !== stringify(INDEX_SETTINGS)) {
        await this.updateSettings(INDEX_SETTINGS);
      }
    }
  }
}

const meiliSearchClient = new MeiliSearchClient();

module.exports = meiliSearchClient;

events.on(Events.componentStarted, (components) => {
  const SEARCH_KIT_DID = 'z8iZorY6mvb5tZrxXTqhBmwu89xjEEazrgT3t';
  if (components.find((item) => item.did === SEARCH_KIT_DID)) {
    logger.info('search-kit component started, check index update');
    meiliSearchClient.verifyIndexSettings();
  }
});
