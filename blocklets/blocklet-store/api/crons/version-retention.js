const path = require('path');
const fs = require('fs-extra');
const dayjs = require('dayjs');
const Config = require('@blocklet/sdk/lib/config');

const Blocklet = require('../db/blocklet');
const BlockletVersion = require('../db/blocklet-version');
const { VERSION_STATUS } = require('../db/constant');
const { getBlockletDir } = require('../libs/utils');
const logger = require('../libs/logger');
const env = require('../libs/env');

function getDirSize(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  let size = 0;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isFile()) {
      size += fs.statSync(fullPath).size;
    } else if (entry.isDirectory()) {
      size += getDirSize(fullPath);
    }
  }
  return size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
}

async function purgeVersion(did, version, opts) {
  const versionDir = getBlockletDir(did, version.version);
  const exists = fs.existsSync(versionDir);
  const size = exists ? getDirSize(versionDir) : 0;
  const prefix = opts.dryRun ? '[DRY RUN] Would purge' : 'Purged';

  if (!opts.dryRun) {
    if (exists) {
      fs.removeSync(versionDir);
    }
    await BlockletVersion.update({ did, version: version.version }, { $set: { purgedAt: new Date().toISOString() } });
  }

  logger.info(`${prefix}: did=${did}, version=${version.version}, status=${version.status}, size=${formatBytes(size)}`);
  return size;
}

async function purgeOldPublished(blocklet, config, opts, stats) {
  const versions = await BlockletVersion.execQueryAndSort(
    { did: blocklet.did, status: VERSION_STATUS.PUBLISHED, purgedAt: null },
    { publishedAt: -1 }
  );

  const cutoff = dayjs().subtract(config.keepMinDays, 'day').toDate();
  const currentVer = blocklet.currentVersion?.version;

  // Filter to only purgeable versions: not currentVersion, beyond keepVersions count, and older than cutoff
  const purgeable = versions.filter(
    (v, i) => v.version !== currentVer && i >= config.keepVersions && new Date(v.publishedAt) <= cutoff
  );

  for (const v of purgeable) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const bytes = await purgeVersion(blocklet.did, v, opts);
      stats.purgedTarballs++;
      stats.totalBytes += bytes;
    } catch (error) {
      stats.errors++;
      logger.error(`Failed to purge published version: did=${blocklet.did}, version=${v.version}`, {
        error: error.message,
      });
    }
  }
}

async function purgeStaleDrafts(blocklet, staleDays, opts, stats) {
  const cutoff = dayjs().subtract(staleDays, 'day').toDate();
  const staleStatuses = [VERSION_STATUS.DRAFT, VERSION_STATUS.REJECTED, VERSION_STATUS.CANCELLED];

  const versions = await BlockletVersion.find({
    did: blocklet.did,
    status: { $in: staleStatuses },
    purgedAt: null,
  });

  const purgeable = versions.filter((v) => {
    const refDate = new Date(v.canceledAt || v.rejectedAt || v.uploadedAt);
    return refDate <= cutoff;
  });

  for (const v of purgeable) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const bytes = await purgeVersion(blocklet.did, v, opts);
      stats.purgedDrafts++;
      stats.totalBytes += bytes;

      // If DRAFT, also clean up draft static directory
      if (v.status === VERSION_STATUS.DRAFT && v.version === blocklet.draftVersion?.version) {
        const draftDir = path.join(env.assetsDir, blocklet.did, 'draft');
        if (fs.existsSync(draftDir)) {
          if (opts.dryRun) {
            const size = getDirSize(draftDir);
            logger.info(`[DRY RUN] Would purge draft assets: did=${blocklet.did}, size=${formatBytes(size)}`);
            stats.totalBytes += size;
          } else {
            fs.removeSync(draftDir);
          }
        }
      }
    } catch (error) {
      stats.errors++;
      logger.error(`Failed to purge stale version: did=${blocklet.did}, version=${v.version}`, {
        error: error.message,
      });
    }
  }
}

async function runRetentionJob() {
  const { preferences } = Config.env;
  if (!preferences.retentionEnabled) {
    return;
  }

  const dryRun = preferences.retentionDryRun ?? true;
  const keepVersions = Math.max(1, Number(preferences.retentionKeepVersions ?? 90));
  const keepMinDays = Number(preferences.retentionKeepMinDays ?? 180);
  const staleDraftDays = Number(preferences.retentionStaleDraftDays ?? 90);
  const opts = { dryRun };

  const stats = { purgedTarballs: 0, purgedDrafts: 0, errors: 0, totalBytes: 0 };

  logger.info(`Version retention job started${dryRun ? ' [DRY RUN]' : ''}`, {
    keepVersions,
    keepMinDays,
    staleDraftDays,
  });

  const blocklets = await Blocklet.find({});

  for (const blocklet of blocklets) {
    if (blocklet.meta?.nftFactory) {
      // Skip paid blocklets
    } else {
      try {
        // eslint-disable-next-line no-await-in-loop
        await purgeOldPublished(blocklet, { keepVersions, keepMinDays }, opts, stats);
        // eslint-disable-next-line no-await-in-loop
        await purgeStaleDrafts(blocklet, staleDraftDays, opts, stats);
      } catch (error) {
        stats.errors++;
        logger.error(`Retention job error for blocklet ${blocklet.did}`, { error: error.message });
      }
    }
  }

  const prefix = dryRun ? '[DRY RUN] ' : '';
  logger.info(`${prefix}Version retention job completed`, {
    ...stats,
    totalSpace: formatBytes(stats.totalBytes),
  });
}

module.exports = { runRetentionJob };
