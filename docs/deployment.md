# Deployment

Blocklet Store is deployed as a Blocklet application on Blocklet Server.

Use Node.js 20.x or Node.js 22.22.2+. When using Node.js 22 on a machine where native dependencies must be compiled, set `npm_config_python` to Python 3.11 if your default Python is 3.14.

## Self-Hosted Deployment

1. Install and configure Blocklet Server.
2. Clone this repository.
3. Install dependencies:

```bash
pnpm install --frozen-lockfile
```

4. Configure local environment from the example file:

```bash
cp blocklets/blocklet-store/.env.example blocklets/blocklet-store/.env
```

5. Initialize and start Blocklet Server in the application directory:

```bash
cd blocklets/blocklet-store
blocklet server init -f
blocklet server start
blocklet dev
```

6. For a production bundle, build from the application directory:

```bash
npm run bundle
```

## Required Services

- Blocklet Server.
- Chain endpoint configured by `CHAIN_HOST`.
- Component dependencies declared in `blocklets/blocklet-store/blocklet.yml`.
- Database storage. SQLite is the default local option; configure `DATABASE_URL` for an external database when needed.

## Optional Services

- Sentry for error reporting.
- AIGNE Hub and an AI provider for AI-assisted search.
- CDN or CloudFront integration for deployments that need edge-level download-token verification.

## Public Repository Boundaries

This public source repository does not include internal release automation, production deployment credentials, Slack notifications, NPM tokens, AWS credentials, or private store access tokens.

Move production release automation to a private repository, organization-level reusable workflow, or internal manual release process.
