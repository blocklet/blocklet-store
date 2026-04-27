const { sessionMiddleware } = require('@blocklet/sdk/lib/middlewares/session');
const { service } = require('../libs/auth');
const { checkDeveloperPassport } = require('../libs/utils');

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE = 1;

const ensureUser = (req, res) => {
  return new Promise((resolve, reject) => {
    sessionMiddleware()(req, res, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};

module.exports = {
  authenticate: async (req, res, next) => {
    await ensureUser(req, res, next);
    if (!req.user) {
      return res.status(401).json({ error: 'login required' });
    }
    req.user = {
      ...req.user,
      did: req.headers['x-user-did'],
      name: decodeURIComponent(req.headers['x-user-fullname']),
      role: req.headers['x-user-role'],
    };

    return next();
  },
  ensureUser: async (req, res, next) => {
    await ensureUser(req, res, next);
    return next();
  },
  authAdmin: (req, res, next) => {
    if (!req.user) {
      res.status(403).json({ error: 'Permission denied' });
    }
    // 如果有 org 可以先不校验角色
    const orgId = req.user.org;
    if (orgId) {
      return next();
    }
    if (req.user.did && ['admin', 'owner'].includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ error: 'Permission denied' });
  },
  ensureDeveloperPassport: async (req, res, next) => {
    const { did } = req.user;
    const { user } = await service.getUser(did);
    if (user) {
      if (user.approved === false) {
        res.status(403).json({ error: 'Permission denied' });
        return;
      }
      if (!checkDeveloperPassport(user.passports)) {
        res.status(401).json({
          error: 'Your developer passport have been revoked. Please re-add developer passport to your account!',
        });
        return;
      }
      next();
    } else {
      res.status(403).json({ error: 'Permission denied' });
    }
  },
  paginate: (req, res, next) => {
    let page = Number(req.query.page || DEFAULT_PAGE);
    let pageSize = Number(req.query.pageSize || req.query.page_size || MAX_PAGE_SIZE);

    page = Number.isNaN(page) ? DEFAULT_PAGE : page;
    pageSize = Number.isNaN(pageSize) ? MAX_PAGE_SIZE : pageSize;

    req.pagination = { page, pageSize };

    next();
  },
  queryOption: (req, _res, next) => {
    const { sortBy = '', sortDirection = '', filter = {}, keyword = '', showResources = '' } = req.query;
    const queryOption = {
      sort: {},
      filter: { showResources },
      keyword: '',
      // 兼容GQL
      sortBy,
      sortDirection,
    };
    if (sortBy && sortDirection) {
      let direction;
      if (sortDirection === 'asc') {
        direction = 1;
      } else if (sortDirection === 'desc') {
        direction = -1;
      }
      if (direction) {
        queryOption.sort = {
          [sortBy]: direction,
        };
      }
    }
    if (filter && filter instanceof Object && !Array.isArray(filter)) {
      queryOption.filter = {
        ...queryOption.filter,
        ...filter,
      };
    }
    if (keyword) {
      queryOption.keyword = keyword;
    }
    req.queryOption = queryOption;
    next();
  },
};
