# Configuration

Use `.env.example` files as templates only. Real `.env` files must not be committed.

## Required Local Variables

```bash
CHAIN_HOST=https://main.abtnetwork.io/api/
COMPONENT_STORE_URL=https://store.blocklet.dev
```

`CHAIN_HOST` points to the chain endpoint used by Blocklet Store. `COMPONENT_STORE_URL` points to the store used to resolve component dependencies in local development.

## Common Optional Variables

```bash
DATABASE_URL=
SENTRY_DSN=
SENTRY_SAMPLE_RATE=0
BLOCKLET_AIGNE_API_URL=
BLOCKLET_AIGNE_API_PROVIDER=
BLOCKLET_AIGNE_API_MODEL=
BLOCKLET_AIGNE_API_CREDENTIAL=
AIGNE_API_CACHE_TTL=10m
AIGNE_INVOKE_CACHE_TTL=1d
```

`DATABASE_URL` overrides the default SQLite database path. `SENTRY_DSN` enables Sentry reporting. AIGNE variables enable optional AI-assisted search and should point to infrastructure you operate.

`BLOCKLET_AIGNE_API_CREDENTIAL` is a JSON string, for example:

```bash
BLOCKLET_AIGNE_API_CREDENTIAL='{"apiKey":"<YOUR_API_KEY>"}'
```

Do not commit real credentials.

## Blocklet Manifest Configuration

The canonical runtime manifest is `blocklets/blocklet-store/blocklet.yml`. Review it before deployment for:

* Required component dependencies.
* Environment variable defaults.
* Navigation and role configuration.
* Lifecycle scripts.
* Capability flags.

## Public Release Hygiene

Before publishing a public source branch, search for:

* Real `.env` files.
* Absolute paths from a developer workstation.
* Internal IP addresses or hostnames.
* Concrete access tokens, API keys, private keys, and webhooks.
* Private staging or production endpoints that are not meant for public reference.
