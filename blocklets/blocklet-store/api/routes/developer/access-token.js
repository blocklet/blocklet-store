const express = require('express');
const { Op } = require('sequelize');

const { ensureDeveloperPassport } = require('../../middlewares');
const AccessToken = require('../../db/access-token');
const { paginate, queryOption } = require('../../middlewares');

const router = express.Router();

router.get('/my', ensureDeveloperPassport, paginate, queryOption, async (req, res) => {
  const { did } = req.user;
  const { sort, filter, keyword } = req.queryOption;
  const formatKeyword = keyword.toLowerCase();
  // 如果指定的 sort 不是 createdAt，则将 createdAt 设置为第二排序规则
  if (!sort.createdAt) {
    sort.createdAt = -1;
  }
  /**
   * 模糊搜索： 备注
   * filter： 状态
   * sort： createdAt、updatedAt
   */
  const status = filter?.status || [];
  const condition = {
    userDid: did,
  };
  if (status.length) {
    condition.status = { $in: status };
  }
  if (formatKeyword) {
    condition.remark = { [Op.like]: `%${formatKeyword}%` };
  }

  const { list: dataList, total } = await AccessToken.paginate({
    condition,
    sort,
    page: req.pagination.page,
    size: req.pagination.pageSize,
  });
  res.json({ dataList, total });
});

router.delete('/:id', ensureDeveloperPassport, async (req, res) => {
  const { id } = req.params;
  const { did } = req.user;
  if (!(await AccessToken.checkOwner(did, id))) {
    res.status(403).json({ error: 'AccessToken is not yours' });
    return;
  }
  const result = await AccessToken.remove({ id });
  res.json(result);
});

// {
//   publicKey: "0x809afaeaf96e8d2485a8f9266c5107747b149851151d1f0730e066d8ec14532e",
//   secretKey: "z5hMR7Q6wa9sFcora6UviKchgWqTcvN67JPJm9ZdC3vYMuHbNYFJWm1xG14R3XpH7BHTg8FrVbbyJe3QJ6MbAU3iM",
//   createdAt: "2021-09-09T04:27:57.270Z",
//   remark: "This is only for test",
//   updatedAt: "2021-09-09T04:27:57.270Z",
//   userDid: "z1ggDrSohnJcaRLC1MRdhaMaw1g8wsbRQxo",
//   id: "C7Smzp86ARClAuSD",
// }
/**
 * @api {post} create Create AccessToken
 * @param {string} remark
 * @returns
 */
router.post('', ensureDeveloperPassport, async (req, res) => {
  const { did } = req.user;
  const { remark = '' } = req.body;
  if (remark.length > 64) {
    res.status(400).json({ error: 'remark length should not exceed 64' });
  }
  const data = await AccessToken.create({
    userDid: did,
    remark,
  });
  res.json(data);
});

module.exports = router;
