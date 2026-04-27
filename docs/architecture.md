# Architecture

Blocklet Store is a monorepo with one main Blocklet application, supporting Blocklet components, and shared packages.

## Repository Layout

- `blocklets/blocklet-store`: Main marketplace Blocklet application.
- `blocklets/store-kit`: Store UI/component Blocklet.
- `blocklets/cloudfront-shield`: Optional Lambda@Edge package for download-token checks.
- `packages/list`: Shared list and marketplace UI components.
- `packages/util`: Shared utility package.

## Main Application

`blocklets/blocklet-store` contains the browser application, Express API, database models, migrations, hooks, Cypress tests, and MCP server.

The Blocklet manifest is `blocklets/blocklet-store/blocklet.yml`. It declares the web interface, required component dependencies, environment variables, navigation, lifecycle scripts, and Blocklet capabilities.

## Runtime Services

- Blocklet Server hosts the application and injects runtime configuration.
- The API server handles marketplace data, publishing, purchase verification, comments integration, and MCP requests.
- The data layer uses SQLite by default and can use `DATABASE_URL` for external database configuration.
- Meilisearch is declared as a required component for marketplace search.
- Payment Kit and DID Comments are declared as component dependencies for purchase and community features.

## MCP

The MCP server lives in `blocklets/blocklet-store/api/mcp`. It exposes JSON-RPC tools for marketplace search and reuses the same search behavior as the public Blocklet Store APIs.

## Optional Integrations

- Sentry can be enabled with `SENTRY_DSN`.
- AI-assisted search can be enabled with AIGNE Hub settings.
- CloudFront Shield can be built and deployed separately when a self-hosted operator needs CDN-level download-token checks.
