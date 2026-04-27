require('express-async-errors');
const cors = require('cors');
const path = require('path');
const express = require('express');
const { fallback } = require('@blocklet/sdk/lib/middlewares/fallback');
const { sitemap } = require('@blocklet/sdk/lib/middlewares/sitemap');
const { csrf } = require('@blocklet/sdk/lib/middlewares/csrf');
const Component = require('@blocklet/sdk/lib/component');
const Config = require('@blocklet/sdk/lib/config');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const { isValid } = require('@arcblock/did');
const { xss } = require('@blocklet/xss');
const { cdn } = require('@blocklet/sdk/lib/middlewares/cdn');

const cookieParser = require('cookie-parser');
const routes = require('../routes');
const { dataDir } = require('../libs/env');
const { ASSETS_PATH_PREFIX, DRAFT_ASSETS_PATH_PREFIX } = require('../libs/constant');
const authRoutes = require('../routes/auth');
const env = require('../libs/env');
const Blocklet = require('../db/blocklet');
const BlockletCategory = require('../db/blocklet-category');
const { setupAccessLogger } = require('../libs/logger');
const logger = require('../libs/logger');
const { setupMcpRoutes } = require('../mcp');

const ROOT_DIR = process.env.BLOCKLET_APP_DIR;

// Create and config express application
const app = express();

app.use(cdn());

setupAccessLogger(app);

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: false }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({
        // to trace all requests to the default router
        app,
      }),
    ],

    tracesSampleRate: env.SENTRY_SAMPLE_RATE,
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
  app.use(Sentry.Handlers.errorHandler());
}

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(csrf());
app.use(xss({ allowedKeys: ['content'] }));

app.get(
  '/sitemap.xml',
  sitemap(async (addEntry) => {
    const blocklets = await Blocklet.execQueryAndSort(Blocklet.ALL_BLOCKLETS_WHERE, { createdAt: -1 }, { did: 1 });
    blocklets.forEach((x) => {
      addEntry({
        url: Component.getUrl(`/blocklets/${x.did}`),
      });
    });
    const categories = await BlockletCategory.execQueryAndSort({}, { createdAt: -1 }, { name: 1 });
    categories.forEach((x) => {
      addEntry({
        url: Component.getUrl(`/search?category=${x.id}`),
      });
    });
  })
);

app.use(express.static(path.join(ROOT_DIR, 'public'), { maxAge: '365d', index: false }));
app.use(ASSETS_PATH_PREFIX, express.static(path.join(dataDir, 'assets'), { maxAge: '365d', index: false }));
app.use(DRAFT_ASSETS_PATH_PREFIX, express.static(path.join(dataDir, 'draft-assets'), { maxAge: '1d', index: false }));

const router = express.Router();
authRoutes.init(router);
app.use(router);
app.use('/api', routes);

setupMcpRoutes(app);

const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  const staticDir = path.resolve(process.env.BLOCKLET_APP_DIR, 'dist');
  app.use(express.static(staticDir, { maxAge: '365d', index: false }));
  app.use(
    fallback('index.html', {
      root: staticDir,
      getPageData: async (req) => {
        const [group, did] = req.path.split('/').filter(Boolean);
        if (group === 'blocklets' && did && isValid(did)) {
          const blocklet = await Blocklet.findOne({ did });
          if (blocklet) {
            const tmp = new URL('/.well-known/service/blocklet/og.png', Config.env.appUrl);
            tmp.searchParams.set('template', 'cover');
            tmp.searchParams.set('title', blocklet.meta.title);
            tmp.searchParams.set('description', blocklet.meta.description);
            tmp.searchParams.set('v', blocklet.meta.version);
            if (blocklet.meta.screenshots?.length) {
              tmp.searchParams.set(
                'cover',
                Component.getUrl(`/assets/${did}/screenshots/${blocklet.meta.screenshots[0]}`)
              );
              tmp.searchParams.set(
                'logo',
                Component.getUrl(`/assets/${did}/${blocklet.meta.logo}?v=${blocklet.meta.version}`)
              );
            } else {
              tmp.searchParams.set(
                'cover',
                Component.getUrl(`/assets/${did}/${blocklet.meta.logo}?v=${blocklet.meta.version}`)
              );
            }
            return {
              title: blocklet.meta.title,
              description: blocklet.meta.description,
              ogImage: tmp.href,
            };
          }

          return {};
        }

        return {};
      },
    })
  );
}

if (isProduction) {
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  // eslint-disable-next-line
  app.use((error, req, res, next) => {
    logger.error(error, req.originalUrl, 500, req.headers['x-real-ip']);
    res.status(500).json({ error: error.message });
  });
}

exports.server = app;
