# Blocklet Store

**Enterprise-grade decentralized marketplace for Blocklet applications**

[![Version](https://img.shields.io/badge/version-0.18.19-blue.svg)](https://github.com/blocklet/blocklet-store/releases)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Powered by Blocklet](https://img.shields.io/badge/Powered%20by-Blocklet-green.svg)](https://www.blocklet.io)

## Overview

Blocklet Store is a decentralized marketplace for discovering, distributing, purchasing, and managing Blocklet applications. It is built on ArcBlock's DID infrastructure and Blocklet Platform, with support for verified publishers, version history, payment verification, search, comments, and self-hosted deployment.

This repository is published for transparency, self-hosting, auditing, and reference use. It is licensed under the Apache License, Version 2.0.

## Repository Policy

This repository is published for transparency, self-hosting, auditing, and reference use.

We do not accept public Issues, Pull Requests, or Discussions in this repository. Please do not use GitHub Issues or Pull Requests to request support, submit patches, or report security vulnerabilities.

For security reports, see [SECURITY.md](./SECURITY.md).

## Features

- Marketplace search and browsing with category, price, owner, official, and compatibility filters.
- DID-based account, developer, and ownership flows.
- Blocklet detail pages, version history, ratings, comments, and download flows.
- NFT/payment verification for paid applications.
- Admin tools for categories, blocklets, access tokens, preferences, and publisher workflows.
- Optional AI-assisted search keyword expansion through AIGNE Hub.
- MCP endpoint for AI agents to search marketplace content.
- Self-hosted deployment on Blocklet Platform.

## Quick Start

### Prerequisites

- Node.js >= 20.7.0. Node.js 20.x and 22.22.2 have been verified.
- pnpm >= 9.0.0
- `@blocklet/cli`

Node.js 22 may compile native dependencies such as `leveldown`, `sqlite3`, and `canvas` from source. If your default Python is 3.14, set `npm_config_python` to Python 3.11 before running `make init`:

```bash
npm_config_python=/path/to/python3.11 make init
```

### Local Development

```bash
git clone https://github.com/blocklet/blocklet-store.git
cd blocklet-store
make init

cd blocklets/blocklet-store
cp .env.example .env
blocklet server init -f
blocklet server start
blocklet dev
```

For component development, run Storybook from the repository root:

```bash
pnpm run storybook
```

## Configuration

Start from [`.env.example`](./.env.example) or [`blocklets/blocklet-store/.env.example`](./blocklets/blocklet-store/.env.example). The minimum local variables are:

```bash
CHAIN_HOST=https://main.abtnetwork.io/api/
COMPONENT_STORE_URL=https://store.blocklet.dev
```

See [docs/configuration.md](./docs/configuration.md) for the full configuration notes.

## Deployment

Blocklet Store is deployed as a Blocklet application. A self-hosted deployment needs Blocklet Server, a chain endpoint, the required component dependencies declared in [`blocklets/blocklet-store/blocklet.yml`](./blocklets/blocklet-store/blocklet.yml), and optional external services such as Sentry or an AI provider.

See [docs/deployment.md](./docs/deployment.md) for self-hosting steps and public release boundaries.

## API Reference

Common public endpoints:

- `GET /api/v2/blocklets.json` - Search marketplace content with pagination.
- `GET /api/blocklets/{did}/blocklet.json` - Get application details.
- `GET /api/nft/display` - Purchase verification interface.
- `GET /api/payment/download-token` - Generate secure download access.

## AI and MCP Support

AI-powered search is optional and uses your own AIGNE Hub installation and provider credentials. No AI provider key is required for basic marketplace operation.

The MCP server exposes marketplace search through JSON-RPC:

```bash
curl -sS -X POST "$STORE_URL/mcp" \
  -H "Content-Type: application/json" \
  -H "x-blocklet-server-version: 1.0.0" \
  -H "x-blocklet-store-version: 1.0.0" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'
```

See [`blocklets/blocklet-store/api/mcp/README.md`](./blocklets/blocklet-store/api/mcp/README.md) for MCP details.

## Documentation

- [Architecture](./docs/architecture.md)
- [Configuration](./docs/configuration.md)
- [Deployment](./docs/deployment.md)
- [Blocklet Store package](./blocklets/blocklet-store/README.md)
- [Store Kit](./blocklets/store-kit/README.md)
- [List package](./packages/list/README.md)

## Support

Do not use GitHub Issues, Pull Requests, or Discussions for support or vulnerability reports. For product and deployment support, use your normal ArcBlock or Blocklet support channel. For security reports, see [SECURITY.md](./SECURITY.md).

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](./LICENSE) for details.
