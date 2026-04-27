const { get, uniq, pick, omit } = require('lodash-es');
const { where: QueryWhere, literal, Op } = require('sequelize');

const BaseDB = require('./base');
const BlockletCategory = require('./blocklet-category');
const logger = require('../libs/logger');
const blockletPricing = require('./blocklet-pricing');
const { createNftFactoryItx } = require('../libs/nft/blocklet-nft/create-factory');
const { service } = require('../libs/auth');
const { DB_NAME, VERSION_STATUS } = require('./constant');
const env = require('../libs/env');

/**
 *
 * @param {*} blocklet
 * @param {*} meta
 * @returns
 */
const attachBlockletStats = (blocklet, meta) => ({
  ...meta,
  stats: {
    downloads: get(blocklet, 'stats.downloads', 0),
  },
  _id: blocklet._id,
  id: blocklet.id,
  category: blocklet.category,
  owner: blocklet.owner,
  ownerDid: blocklet.owner.did,
  pricing: blocklet.pricing,
  payment: blocklet.payment,
  nftFactory: blocklet.nftFactory,
  lastPublishedAt: blocklet.lastPublishedAt,
  createdAt: new Date(blocklet.createdAt).getTime(),
  paymentShares: blocklet.paymentShares || [],
});

class Blocklet extends BaseDB {
  constructor() {
    super(DB_NAME.BLOCKLET);
    this.ensureIndex({ fieldName: 'did', unique: true }, (err) => {
      if (err) {
        console.error('Failed to ensure blocklet unique index', err);
      }
    });
  }

  async isNameExist(name) {
    const findItem = await this.findOne({
      where: QueryWhere(literal('json_extract(meta, "$.name")'), name),
    });
    return !!findItem;
  }

  async isOwner(userDid, id) {
    const findItem = await this.findOne({ id });
    return findItem?.ownerDid === userDid;
  }

  generateBlockletListQuery(filter, keyword) {
    const filters = Object.entries(filter).reduce((acc, [key, value]) => {
      if (value) {
        acc[key] = Array.isArray(value) ? value : [value];
      }
      return acc;
    }, {});
    const {
      status = [],
      type = [],
      permission = [],
      category = [],
      owner = [],
      didList = [],
      reviewStatus = [],
      price = [],
      resourceType = [],
      resourceDid = [],
      showResources = [],
      conditionType = ['AND'],
      upgradable = [],
      autoPublish = [],
      isOfficial = [],
      reviewType = [],
      id: _id = [],
      ...notSupportFilter
    } = filters;

    if (Object.keys(notSupportFilter).length > 0) {
      logger.warn('Found not support filter: ', { filterKeys: Object.keys(notSupportFilter) });
    }

    const formatSearch = keyword?.toLowerCase().trim() || '';

    const queries = [
      // Status 条件
      ...(status.length > 0 ? [{ status: { $in: status } }] : []),
      // Permission 条件
      ...(permission.length > 0
        ? [
            permission.includes(this.PERMISSIONS.PUBLIC)
              ? {
                  $or: [{ permission: this.PERMISSIONS.PUBLIC }, { permission: { $eq: null } }],
                }
              : { permission: this.PERMISSIONS.PRIVATE },
          ]
        : []),
      // Category 条件
      ...(category.length > 0 ? [{ category: { $in: category } }] : []),

      // Price 条件
      ...(price.includes('free')
        ? [
            {
              $or: [
                QueryWhere(literal('json_extract(meta, "$.payment")'), { [Op.is]: null }),
                QueryWhere(literal('json_extract(meta, "$.payment.price")'), {
                  [Op.or]: [{ [Op.is]: null }, { [Op.eq]: '[]' }],
                }),
                QueryWhere(
                  literal(
                    "EXISTS (SELECT 1 FROM json_each(json_extract(meta, '$.payment.price')) WHERE json_each.value->>'$.value' = 0)"
                  ),
                  { [Op.eq]: true }
                ),
              ],
            },
          ]
        : []),
      ...(price.includes('fee')
        ? [
            QueryWhere(
              literal(
                "EXISTS (SELECT 1 FROM json_each(json_extract(meta, '$.payment.price')) WHERE json_each.value->>'$.value' != 0)"
              ),
              { [Op.eq]: true }
            ),
          ]
        : []),

      // Type 条件
      ...(type.length > 0
        ? [
            type.includes('Blocklet')
              ? {
                  $or: [
                    QueryWhere(literal('json_extract(meta, "$.group")'), { [Op.ne]: null }),
                    {
                      $and: [
                        QueryWhere(literal('json_extract(meta, "$.engine")'), { [Op.ne]: null }),
                        QueryWhere(literal('json_extract(meta, "$.engine.interpreter")'), { [Op.eq]: 'blocklet' }),
                      ],
                    },
                  ],
                }
              : {
                  $and: [
                    QueryWhere(literal('json_extract(meta, "$.group")'), { [Op.is]: null }),
                    {
                      $or: [
                        QueryWhere(literal('json_extract(meta, "$.engine")'), { [Op.is]: null }),
                        QueryWhere(literal('json_extract(meta, "$.engine.interpreter")'), { [Op.ne]: 'blocklet' }),
                      ],
                    },
                  ],
                },
          ]
        : []),

      // 是否展示资源
      ...(showResources.includes('false')
        ? [
            {
              $or: [
                QueryWhere(literal('json_extract(meta, "$.engine.interpreter")'), {
                  [Op.eq]: 'blocklet',
                }),
                QueryWhere(literal('json_extract(meta, "$.group")'), {
                  [Op.not]: null,
                }),
              ],
            },
          ]
        : []),

      // Resource 条件
      ...(resourceType.length > 0 || resourceDid.length > 0
        ? [
            QueryWhere(
              literal(
                `EXISTS (
              SELECT 1 FROM json_each(json_extract(meta, "$.resource.bundles")) AS bundle
                WHERE (bundle.value->>'did'  = '${resourceDid[0]}'  OR ${resourceDid[0] ? ` '${resourceDid[0]} '` : 'NULL'} IS NULL)
                  AND (bundle.value->>'type' = '${resourceType[0]}' OR ${resourceType[0] ? `'${resourceType[0]}'` : 'NULL'} IS NULL)
              )`
              ),
              { [Op.eq]: true }
            ),
          ]
        : []),

      // Review Status 条件
      ...(reviewStatus.length > 0
        ? [
            {
              $or: [
                QueryWhere(literal('json_extract(reviewVersion, "$.status")'), {
                  [Op.in]: reviewStatus,
                }),
                ...(reviewStatus.includes(VERSION_STATUS.DRAFT)
                  ? [
                      QueryWhere(literal('json_extract(latestVersion, "$.status")'), {
                        [Op.eq]: VERSION_STATUS.DRAFT,
                      }),
                    ]
                  : []),
                ...(reviewStatus.includes(VERSION_STATUS.PUBLISHED)
                  ? [
                      {
                        currentVersion: {
                          $ne: null,
                        },
                      },
                    ]
                  : []),
              ],
            },
          ]
        : []),

      // 可升级条件
      ...(upgradable.length > 0
        ? [
            {
              $and: [
                { currentVersion: { $ne: null } },
                QueryWhere(
                  literal(
                    `json_extract(latestVersion, "$.version") ${
                      upgradable.includes('true') ? '!=' : '='
                    } json_extract(currentVersion, "$.version")`
                  ),
                  { [Op.eq]: true }
                ),
              ],
            },
          ]
        : []),

      // 自动发布条件
      ...(autoPublish.length > 0
        ? [
            QueryWhere(literal('json_extract(delegationToken, "$.autoPublish")'), {
              [autoPublish.includes('true') ? Op.ne : Op.eq]: null,
            }),
          ]
        : []),

      // 官方条件
      ...(isOfficial.length > 0
        ? [
            {
              ownerDid: {
                [isOfficial.includes('true') ? '$in' : '$notIn']: env.preferences.officialAccounts.map(
                  (account) => account.did
                ),
              },
            },
          ]
        : []),

      // 审核类型条件
      ...(reviewType.length > 0 ? [{ reviewType: reviewType[0] }] : []),
    ];

    return {
      $and: [
        // 过滤无效的 Blocklet，所有 Blocklet 都有 latestVersion
        QueryWhere(literal('json_extract(latestVersion, "$.id")'), { [Op.ne]: null }),
        ...(Object.prototype.hasOwnProperty.call(filter, 'id') ? [{ id: { $in: filter.id } }] : []),

        // Owner 条件
        ...(owner.length > 0 ? [{ ownerDid: { $in: owner } }] : []),

        // DID List 条件
        ...(didList.length > 0 ? [{ did: { $in: didList } }] : []),

        // Keyword 条件
        ...(keyword
          ? [
              {
                $or: [
                  { did: { $like: `%${formatSearch}%` } },
                  { remark: { $like: `%${formatSearch}%` } },
                  QueryWhere(literal('json_extract(meta, "$.title")'), { [Op.like]: `%${formatSearch}%` }),
                  QueryWhere(literal('json_extract(meta, "$.name")'), { [Op.like]: `%${formatSearch}%` }),
                ],
              },
            ]
          : []),
        ...(conditionType.includes('AND')
          ? [{ $and: queries }]
          : [{ $or: queries.length > 0 ? queries : [literal('1=1') /** 默认查询所有 */] }]),
      ],
    };
  }

  async getBlockletList({ where = {}, params = {} }) {
    const { sort, filter = {}, keyword = '' } = params.queryOptions || {};

    const condition = {
      ...where,
      $and: [...(where.$and || []), ...this.generateBlockletListQuery(filter, keyword).$and],
    };
    const { list: blocklets, total } = await this.paginate({
      condition,
      sort,
      page: params.pagination.page,
      size: params.pagination.pageSize,
    });
    const blockletCategoryList = await BlockletCategory.findListById(...blocklets.map((b) => b.category));
    const { users: developerList } = await service.getUsers({ dids: uniq(blocklets.map((b) => b.owner.did)) });
    const pricingList = await blockletPricing.findListByBlockletId(...blocklets.map((b) => b.id));
    const nftFactoryItx = await createNftFactoryItx();
    const officialAccounts = (env.preferences.officialAccounts || []).map((account) => account.did);

    // merge 关联字段
    const dataList = blocklets.map((item) => {
      const category = blockletCategoryList.find((v) => item.category === v?.id);
      const developer = developerList.find((v) => item.owner.did === v.did);
      const pricing = pricingList.find((v) => v.blockletId === item.id);
      if (pricing) {
        blockletPricing.assignMeta(item.meta, pricing);
        blockletPricing.assignMeta(item.draftMeta, pricing);
      }
      if (item.meta && nftFactoryItx) {
        item.meta.nftFactory = nftFactoryItx.address;
      }
      const isOfficial = officialAccounts.includes(item.ownerDid);
      if (isOfficial && item.meta) {
        item.meta.isOfficial = true;
      }

      return {
        ...omit(item, ['author']),
        category,
        owner: { did: item.ownerDid, ...pick(developer, ['fullName', 'avatar']) },
        permission: item.permission || this.PERMISSIONS.PUBLIC,
      };
    });

    return { total, dataList };
  }

  async getAllBlocklets({ where = this.ALL_BLOCKLETS_WHERE }) {
    const blocklets = await this.execQueryAndSort(where, { createdAt: -1 });
    const blockletCategoryList = await BlockletCategory.findListById(...blocklets.map((b) => b.category));
    const { users: developerList } = await service.getUsers({ dids: uniq(blocklets.map((b) => b.owner.did)) });
    const pricingList = await blockletPricing.findListByBlockletId(...blocklets.map((b) => b.id));
    const nftFactoryItx = await createNftFactoryItx();

    const officialAccounts = (env.preferences.officialAccounts || []).map((account) => account.did);
    // merge 关联字段
    const results = blocklets.map((item) => {
      const { meta } = item;
      if (!meta) {
        logger.warn('blocklet is empty', { did: item.did });
        return null;
      }
      const category = blockletCategoryList.find((v) => item.category === v?.id);
      const developer = developerList.find((v) => item.owner.did === v.did);
      const pricing = pricingList.find((v) => v.blockletId === item.id);

      const isOfficial = officialAccounts.includes(item.ownerDid);
      if (isOfficial && item.meta) {
        item.meta.isOfficial = true;
      }

      return attachBlockletStats(
        {
          ...item,
          owner: { did: item.owner.did, ...pick(developer, ['fullName', 'avatar']) },
          category,
          nftFactory: nftFactoryItx.address,
          pricing: blockletPricing.parsePricing(pricing),
          payment: blockletPricing.parsePayment(pricing),
        },
        omit(meta, ['author'])
      );
    });
    return results;
  }

  STATUS = {
    NORMAL: 'normal',
    BLOCKED: 'blocked',
  };

  PERMISSIONS = {
    PUBLIC: 'Public',
    PRIVATE: 'Private',
  };

  SOURCE = {
    WEBSITE: 'WEBSITE',
    STUDIO: 'STUDIO',
    CLI: 'CLI',
  };

  ALL_BLOCKLETS_WHERE = {
    $and: [
      {
        currentVersion: { $exists: true },
      },
      {
        currentVersion: { $ne: null },
        status: this.STATUS.NORMAL,
        permission: { $ne: this.PERMISSIONS.PRIVATE },
      },
    ],
  };
}

module.exports = new Blocklet();
module.exports.attachBlockletStats = attachBlockletStats;
