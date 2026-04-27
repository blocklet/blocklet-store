# Version Retention Implementation Plan

## Status: IMPLEMENTED

All phases completed. Implementation matches intent.md specification.

## Files Created

| File | Purpose |
|------|---------|
| `api/db/migrations/2025-02-10-add-version-purged-at.js` | Migration: add `purgedAt` column + index to versions table |
| `api/crons/version-retention.js` | Core retention job: Rule A (old published), Rule B (stale drafts), dryRun mode |

## Files Modified

| File | Change |
|------|--------|
| `api/db/models/version.js` | Added `purgedAt` field (DataTypes.DATE, nullable) |
| `api/crons/index.js` | Registered `version.retention` cron job (daily 3:00 AM) |
| `api/routes/blocklet.js` | Added `purgedAt` filter to `/:did/versions`, `/versions/batch`; added 410 response for purged tarball downloads |
| `blocklet.prefs.json` | Added "Data Retention" tab with 5 preferences |

## Implementation Details

### Phase 1: Data Layer
- Migration uses `describeTable` guard for idempotency (same pattern as existing migrations)
- `purgedAt` index added for query performance

### Phase 2: Core Logic
- `version-retention.js` implements:
  - `runRetentionJob()` - main entry, reads preferences, iterates blocklets
  - `purgeOldPublished()` - Rule A with 3 protection checks (currentVersion, keepVersions, keepMinDays)
  - `purgeStaleDrafts()` - Rule B for DRAFT/REJECTED/CANCELLED
  - `purgeVersion()` - atomic purge: delete files first, then update DB
  - `getDirSize()` / `formatBytes()` - space estimation for dryRun
- Error handling: per-version try/catch, never aborts the whole job

### Phase 3: API Integration
- `/:did/versions` - added `purgedAt: null` to query filter
- `/:did/:version?/*.tgz` - check `purgedAt` before download, return 410 with `latestVersion`
- `/versions/batch` - added `purgedAt: null` to where clause

### Phase 4: Configuration
- Formily `blocklet.prefs.json` new "Data Retention" TabPane
- All sub-fields conditionally visible when `retentionEnabled = true`
- Defaults: enabled=false, dryRun=true, keepVersions=90, keepMinDays=180, staleDraftDays=90
