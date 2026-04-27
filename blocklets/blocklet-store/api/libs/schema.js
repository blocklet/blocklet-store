const { Joi } = require('@arcblock/validator');
const { REVIEW_TYPE } = require('../db/constant');

const wrapSchema = (schema) => (isRequired) => (isRequired ? schema.required() : schema.empty(''));

// 自定义 URL 校验规则
const urlSchema = Joi.string().custom((value, helpers) => {
  try {
    const url = new URL(value);

    // 只允许 http 和 https 协议
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return helpers.message('{{#label}} must use either http or https protocol');
    }

    return value;
  } catch (error) {
    return helpers.message('{{#label}} is not a valid URL');
  }
}, 'URL validation');

const SCHEMA = {
  version: wrapSchema(
    Joi.string()
      .pattern(/^\d+\.\d+\.\d+$/)
      .messages({
        'string.pattern.base': '{{#label}} must like x.x.x',
      })
  ),
  page: wrapSchema(Joi.number().integer().min(1)),
  pageSize: wrapSchema(Joi.number().integer().min(1).max(1500)),
  sortBy: wrapSchema(Joi.string().valid('createdAt', 'stats.downloads', 'updatedAt', 'lastPublishedAt', 'source')),
  meilisearchSortBy: wrapSchema(Joi.string().valid('stats.downloads', 'lastPublishedAt', 'title')),
  sortDirection: wrapSchema(Joi.string().valid('asc', 'desc')),
  locale: wrapSchema(Joi.string().valid('en', 'zh')),
  permission: wrapSchema(Joi.string().valid('Public', 'Private')),
  reviewType: wrapSchema(Joi.string().valid(REVIEW_TYPE.FIRST, REVIEW_TYPE.EACH)),
  keyword: wrapSchema(Joi.string().max(500)),
  category: wrapSchema(Joi.string()),
  showResources: wrapSchema(Joi.boolean()),
  allBlockletCount: wrapSchema(Joi.boolean()),
  url: wrapSchema(urlSchema),
  string: wrapSchema(Joi.string()),
  boolean: wrapSchema(Joi.boolean()),
  did: wrapSchema(
    Joi.string().custom((value, helpers) => {
      if (Joi.DID().validate(value).error) {
        return helpers.message('{{#label}} is not a valid DID');
      }
      return value;
    }, 'DID validation')
  ),
};

/**
 * 检查请求参数
 * @param { Joi | object } schema
 * @returns
 */
const checkUrlQuery = (schema, paramsKey = 'query') => {
  return (req, res, next) => {
    const { error } = (Joi.isSchema(schema) ? schema : Joi.object(schema)).validate(req[paramsKey], {
      convert: true,
      stripUnknown: true,
      abortEarly: false,
      presence: 'optional',
    });
    if (error) {
      res.status(400).json({ error: error.details.map((detail) => detail.message) });
      return;
    }
    next();
  };
};

module.exports = {
  checkUrlQuery,
  SCHEMA,
};
