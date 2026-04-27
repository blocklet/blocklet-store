const express = require('express');
const { where, Op, literal } = require('sequelize');
const { Joi } = require('@arcblock/validator');

const BlockletCategory = require('../../db/blocklet-category');
const { authAdmin, paginate, queryOption } = require('../../middlewares');

const router = express.Router();

const checkLocale = (req, res, next) => {
  const schema = Joi.object({
    // 动态验证 对象中的数据类型
    locales: Joi.object().pattern(/^/, Joi.alternatives().try(Joi.string().required().max(40))),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json(error.message);
  }
  return next();
};

router.get('', authAdmin, paginate, queryOption, async (req, res) => {
  const { sort, keyword } = req.queryOption;
  const formatKeyword = keyword.toLowerCase();
  // 如果指定的 sort 不是 createdAt，则将 createdAt 设置为第二排序规则
  if (!sort.createdAt) {
    sort.createdAt = -1;
  }

  /**
   * 模糊搜索： id
   * sort： createdAt、updatedAt
   */
  let condition = {};
  if (keyword) {
    condition = {
      [Op.or]: [
        where(literal('json_extract(locales , "$.en")'), { [Op.like]: `%${formatKeyword}%` }),
        where(literal('json_extract(locales , "$.zh")'), { [Op.like]: `%${formatKeyword}%` }),
        where(literal('id'), { [Op.like]: `%${formatKeyword}%` }),
      ],
    };
  }

  const { list: dataList, total } = await BlockletCategory.paginate({
    condition,
    sort,
    page: req.pagination.page,
    size: req.pagination.pageSize,
  });
  res.json({ dataList, total });
});

// 检查 locales 是否重复
router.get('/isLocaleExist', async (req, res) => {
  const { localeBy, localeValue } = req.query;
  const result = await BlockletCategory.isLocaleExist(localeBy, localeValue);
  res.json({ result });
});

router.post('', authAdmin, checkLocale, async (req, res) => {
  const { locales } = req.body;

  const data = {
    locales,
  };
  const result = await BlockletCategory.insert(data);
  res.json(result);
});
router.put('/:id', authAdmin, checkLocale, async (req, res) => {
  const { id } = req.params;
  const { locales } = req.body;

  const result = await BlockletCategory.update({ id }, { $set: { locales } });
  res.json(result);
});

router.delete('/:id/delete', authAdmin, async (req, res) => {
  const { id } = req.params;
  const result = await BlockletCategory.remove({ id });
  res.json(result);
});
// 当不存在分类时 允许用户创建默认分类
router.post('/default', authAdmin, async (req, res) => {
  const categoryList = await BlockletCategory.find();
  if (categoryList.length === 0) {
    const defaultCategoryList = [
      { locales: { en: 'All', zh: '全部' } },
      { locales: { en: 'Blog', zh: '博客' } },
      { locales: { en: 'Shopping', zh: '购物' } },
      { locales: { en: 'Web Development', zh: 'Web开发' } },
      { locales: { en: 'Communication', zh: '通讯' } },
      { locales: { en: 'Productivity', zh: '生产力' } },
      { locales: { en: 'Search tools', zh: '搜索工具' } },
      { locales: { en: 'Sports', zh: '运动' } },
      { locales: { en: 'Accessibility', zh: '无障碍' } },
      { locales: { en: 'News', zh: '新闻' } },
      { locales: { en: 'Fun', zh: '娱乐' } },
      { locales: { en: 'Photos', zh: '照片' } },
    ];
    const result = await BlockletCategory.insert(defaultCategoryList);
    res.json(result);
    return;
  }
  res.status(403).json({ error: 'Create default category failed, category list is not empty ' });
});

module.exports = router;
