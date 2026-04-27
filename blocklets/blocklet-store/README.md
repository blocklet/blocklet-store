# Blocklet Store

Blocklet Store is the main marketplace application in this repository. It provides Blocklet discovery, publishing, purchase verification, version history, comments, admin tools, and MCP search endpoints.

## Repository Policy

This package is published as part of a public source repository for transparency, self-hosting, auditing, and reference use.

Public Issues, Pull Requests, and Discussions are not accepted. Security reports must follow the private reporting process in the repository-level `SECURITY.md`.

## Public API

- `GET /api/store.json`: Store information, planned to be replaced by `__blocklet__.js`.
- `GET /api/v2/blocklets.json`: Search blocklets with pagination.
- `GET /api/blocklets/{did}/blocklet.json`: Get blocklet details.
- `GET /api/nft/display`: Purchase NFT display.
- `GET /api/nft/status`: Purchase NFT status.
- `GET /api/payment/signature`: Generate a signature for a verified purchase.
- `GET /api/payment/download-token`: Generate a download token for a verified purchase.
- `POST /mcp`: MCP JSON-RPC endpoint.

## Run and Debug Locally

```bash
npm i -g @blocklet/cli
git clone https://github.com/blocklet/blocklet-store.git
cd blocklet-store
make init

cd blocklets/blocklet-store
cp .env.example .env
blocklet server init --mode debug
blocklet server start
blocklet dev
```

## Run Tests

```bash
npm run coverage:prepare
npm run coverage
npm run coverage:e2e
```

## Debug E2E Tests

```bash
npm run coverage:prepare
npm run coverage:start
npm run cypress-e2e
```

## FAQ

### NFT Factory Address is illegal when uploading paid blocklets?

```bash
Uploading payment-demo-blocklet@1.6.0... Fail
Upload failed with error: [400] NFT factory address is illegal
```

Check the `BLOCKLET_APP_URL` value in Blocklet Server. It must match the store URL connected by the uploading Blocklet. For example, if the store is connected through `https://store.blocklet.dev`, then `BLOCKLET_APP_URL` must use the same base URL.

### How do I become a certified developer on a local store?

1. Restart the local store.
2. Log in to the local store.
3. Apply to become a developer at `/developer/join`.
4. Receive the developer passport in the local flow.

## License

Licensed under the Apache License, Version 2.0. See the repository-level `LICENSE` file.
