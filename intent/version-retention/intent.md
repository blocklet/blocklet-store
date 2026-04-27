# Blocklet Version Data Retention Specification

## 1. Overview

- **Product positioning**: Blocklet Store 的运维能力增强 — 自动清理历史版本文件以回收磁盘空间
- **Core concept**: 定时清理过期的已发布版本 tarball 和非终态版本文件，保留 DB 记录用于审计，清理后的版本从 API 列表中隐藏
- **Priority**: Medium — 非紧急但随运行时间增长会成为问题
- **Target user**: Blocklet Store 管理员（通过 blocklet preferences 配置）
- **Project scope**: 仅涉及 `blocklets/blocklet-store/` 应用内的后端逻辑，无前端 UI 变更

## 2. Architecture

### 2.1 存储结构现状

每个 blocklet 的版本文件存储在两个位置：

```
{dataDir}/blocklets/{did}/{version}/
  ├── blocklet.json          ← 版本元数据 (~100-500 KB)
  └── {name}-{version}.tgz   ← 编译后的 tarball (5-100 MB) ← 主要清理目标

{dataDir}/assets/{did}/
  ├── draft/                  ← 草稿静态文件（README, screenshots, logo）
  ├── review/                 ← 审核中静态文件
  ├── temp/                   ← 发布时的临时备份
  ├── blocklet.md, README.md  ← 当前版本的静态文件（非版本化，发布时覆盖）
  └── screenshots/, logo      ← 当前版本的截图和 logo
```

**关键发现**: 静态资源（README、screenshots、logo）在磁盘上 **不是按版本存储的**，每次发布时会用新版本覆盖旧版本。因此清理目标主要是：
1. `blocklets/{did}/{version}/` 目录（tarball + blocklet.json）— **空间大头**
2. 孤儿 `assets/{did}/draft/` 和 `assets/{did}/review/` 目录 — 状态已终结但文件未清理

### 2.2 组件设计

```
┌─────────────────────────────────────────────────┐
│               api/crons/index.js                 │
│  (现有 Cron 调度器, 使用 @abtnode/cron)           │
│  + 新增 version-retention job                    │
└───────────────────┬─────────────────────────────┘
                    │ 每天凌晨 3:00 触发
                    ▼
┌─────────────────────────────────────────────────┐
│          api/crons/version-retention.js          │
│                                                  │
│  1. 读取 retention 配置 (preferences)             │
│  2. 检查 dryRun 模式                              │
│  3. 遍历所有 blocklets                            │
│  4. 跳过付费 blocklet (nftFactory)                │
│  5. 按规则筛选可清理版本                           │
│  6. dryRun: 仅记录日志 / 正常: 删文件+更新 DB     │
│  7. 输出汇总日志                                  │
└───────────────────┬─────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   ┌─────────┐ ┌─────────┐ ┌──────────┐
   │ Version │ │ Blocklet│ │ 磁盘文件  │
   │  Table  │ │  Table  │ │ blocklets/│
   │(purgedAt)│ │(nftFact)│ │ assets/  │
   └─────────┘ └─────────┘ └──────────┘
```

### 2.3 配置读取

通过 `Config.env.preferences` 读取（与现有 `needReview`, `maxBundleSize` 等配置一致）：

```javascript
const retention = {
  enabled: Config.env.preferences.retentionEnabled ?? false,
  dryRun: Config.env.preferences.retentionDryRun ?? true,
  keepPublishedVersions: Number(Config.env.preferences.retentionKeepVersions ?? 90),
  keepMinDays: Number(Config.env.preferences.retentionKeepMinDays ?? 180),
  staleDraftDays: Number(Config.env.preferences.retentionStaleDraftDays ?? 90),
};
```

## 3. Detailed Behavior

### 3.1 Dry Run 模式

`retentionDryRun` 默认为 `true`。在 dryRun 模式下：

- **不删除** 任何磁盘文件
- **不更新** DB 中的 `purgedAt` 字段
- **会执行** 完整的筛选逻辑，并将所有 **将要执行** 的操作写入日志

日志格式：

```
[DRY RUN] Would purge published version: did=z8ia..., version=1.2.3, publishedAt=2025-01-01, dir=/data/blocklets/z8ia.../1.2.3
[DRY RUN] Would purge stale DRAFT: did=z8ia..., version=1.3.0, uploadedAt=2025-06-01
[DRY RUN] Summary: would purge 42 tarballs, 3 drafts, estimated space: ~2.1 GB
```

**推荐上线流程**：
1. 设置 `retentionEnabled = true`, `retentionDryRun = true`
2. 等待一次 cron 运行（或重启后观察日志）
3. 确认日志中的清理范围符合预期
4. 设置 `retentionDryRun = false` 开始真正清理

### 3.2 清理规则

#### 规则 A: 已发布版本 tarball 清理

对每个 blocklet（跳过有 `meta.nftFactory` 的付费 blocklet）：

1. 查询所有 `status = PUBLISHED` 且 `purgedAt IS NULL` 的版本，按 `publishedAt DESC` 排序
2. 标记为 **受保护** 的版本（不清理）：
   - `blocklet.currentVersion.version` 对应的版本（永远保护）
   - 排序后的前 `keepPublishedVersions` 个版本
   - `publishedAt` 距今不满 `keepMinDays` 天的版本
3. 其余版本为可清理版本，执行清理（或 dryRun 记录）

#### 规则 B: 非终态版本清理

| 版本状态 | 清理条件 | 操作 |
|----------|----------|------|
| `DRAFT` | `uploadedAt` 距今超过 `staleDraftDays` 天 | 删 tarball 目录 + draft 静态文件 |
| `REJECTED` | `rejectedAt` 距今超过 `staleDraftDays` 天 | 删 tarball 目录 |
| `CANCELLED` | `canceledAt` 距今超过 `staleDraftDays` 天 | 删 tarball 目录 |

**注意**: `PENDING_REVIEW` / `IN_REVIEW` 状态的版本 **不由 retention job 处理**。超时审核属于工作流管理，不是磁盘清理的职责。

### 3.3 Dry Run 下的空间估算

dryRun 模式下，对每个即将清理的版本目录调用 `getDirSize()` 累加，在汇总日志中输出预估可释放空间：

```javascript
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
```

### 3.4 单次清理操作流程

```javascript
async function purgeVersion(did, version, { dryRun }) {
  const versionDir = getBlockletDir(did, version.version);
  const exists = fs.existsSync(versionDir);

  if (dryRun) {
    const size = exists ? getDirSize(versionDir) : 0;
    logger.info(`[DRY RUN] Would purge: did=${did}, version=${version.version}, size=${formatBytes(size)}`);
    return size;
  }

  // 1. 删除磁盘文件
  if (exists) {
    fs.removeSync(versionDir);
  }

  // 2. 更新 DB 记录
  await BlockletVersion.update(
    { did, version: version.version },
    { $set: { purgedAt: new Date().toISOString() } }
  );

  return 0;
}
```

**关键**: 先删文件后更新 DB。即使 DB 更新失败，下次运行会因为文件已不存在而自动跳过（幂等）。DB 记录中的 `purgedAt` 仅用于标记和过滤，不影响安全性。

### 3.5 错误处理

- 单个版本清理失败：记录错误日志，继续处理下一个版本（不中断整个 job）
- 文件不存在：视为已清理，跳过并确保 DB 标记正确
- DB 更新失败：下次 job 运行时会重试（因为 purgedAt 仍为 null）
- Job 整体超时：无强制超时，依赖 cron 下次调度

### 3.6 版本列表 API 变更

`GET /blocklets/:did/versions` 端点过滤掉已清理的版本：

```javascript
// 现有代码 (api/routes/blocklet.js:307-313)
let versions = await BlockletVersion.find(where);
versions = versions.filter((version) => semver.lte(version.version, currentVersion));

// 新增过滤
versions = versions.filter((version) => !version.purgedAt);
```

### 3.7 Tarball 下载端点变更

`GET /blocklets/:did/:version?/:tarball(*.tgz)` 端点检查 purged 状态：

```javascript
// 在现有文件路径解析之前添加检查
const versionRecord = await BlockletVersion.findOne({ did, version });
if (versionRecord?.purgedAt) {
  return res.status(410).json({
    error: 'VERSION_PURGED',
    message: 'This version is no longer available for download',
    latestVersion: blocklet.currentVersion?.version,
  });
}
```

### 3.8 批量版本查询端点变更

`GET /blocklets/versions/batch` — 同样过滤 `purgedAt`，缓存 key 无需变化（缓存 TTL 3 小时，清理后自然过期）。

## 4. Data Schema Changes

### 4.1 Version Model 新增字段

文件: `api/db/models/version.js`

```javascript
purgedAt: {
  type: DataTypes.DATE,
  allowNull: true,
  defaultValue: null,
}
```

### 4.2 Migration

文件: `api/db/migrations/{date}-add-version-purged-at.js`

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('versions', 'purgedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addIndex('versions', ['purgedAt']);
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('versions', 'purgedAt');
  },
};
```

### 4.3 Preferences Schema 新增

文件: `blocklet.prefs.json` — 在现有 FormTab 中新增 "Data Retention" TabPane：

| 字段名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `retentionEnabled` | boolean | `false` | 是否启用版本清理 |
| `retentionDryRun` | boolean | `true` | dry run 模式（仅记录日志不实际删除） |
| `retentionKeepVersions` | number | `90` | 每个 blocklet 保留最近 N 个已发布版本 |
| `retentionKeepMinDays` | number | `180` | 发布未满 N 天的版本不清理 |
| `retentionStaleDraftDays` | number | `90` | DRAFT/REJECTED/CANCELLED 过期天数 |

## 5. Implementation Guide

### 5.1 新增文件

```
api/crons/version-retention.js     ← 核心清理逻辑
api/db/migrations/YYYY-MM-DD-add-version-purged-at.js  ← DB migration
```

### 5.2 修改文件

```
api/db/models/version.js           ← 新增 purgedAt 字段
api/crons/index.js                 ← 注册新 cron job
api/routes/blocklet.js             ← versions 端点过滤 purgedAt
blocklet.prefs.json                ← 新增 Data Retention tab 配置项
```

### 5.3 Cron Job 注册

文件: `api/crons/index.js`

```javascript
const { runRetentionJob } = require('./version-retention');

// 在 jobs 数组中新增：
{
  name: 'version.retention',
  time: '0 0 3 * * *',  // 每天凌晨 3:00
  fn: runRetentionJob,
  options: { runOnInit: false },
}
```

### 5.4 完整清理 Job 伪代码

```javascript
const path = require('path');
const Config = require('@blocklet/sdk/lib/config');
const semver = require('semver');
const fs = require('fs-extra');
const dayjs = require('dayjs');

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

  const stats = { purgedTarballs: 0, purgedDrafts: 0, errors: 0, reclaimableBytes: 0 };

  logger.info(`Version retention job started${dryRun ? ' [DRY RUN]' : ''}`, {
    keepVersions,
    keepMinDays,
    staleDraftDays,
  });

  const blocklets = await Blocklet.findAll();

  for (const blocklet of blocklets) {
    try {
      // 跳过付费 blocklet
      if (blocklet.meta?.nftFactory) continue;

      // 规则 A: 清理旧的已发布版本
      await purgeOldPublished(blocklet, { keepVersions, keepMinDays }, opts, stats);

      // 规则 B: 清理过期的非终态版本
      await purgeStaleDrafts(blocklet, staleDraftDays, opts, stats);
    } catch (error) {
      stats.errors++;
      logger.error(`Retention job error for blocklet ${blocklet.did}`, { error: error.message });
    }
  }

  const prefix = dryRun ? '[DRY RUN] ' : '';
  logger.info(`${prefix}Version retention job completed`, {
    ...stats,
    reclaimableSpace: formatBytes(stats.reclaimableBytes),
  });
}

async function purgeOldPublished(blocklet, config, opts, stats) {
  const versions = await BlockletVersion.execQueryAndSort(
    { did: blocklet.did, status: VERSION_STATUS.PUBLISHED, purgedAt: null },
    { publishedAt: -1 }
  );

  const cutoff = dayjs().subtract(config.keepMinDays, 'day').toDate();
  const currentVer = blocklet.currentVersion?.version;

  for (let i = 0; i < versions.length; i++) {
    const v = versions[i];
    // 保护规则
    if (v.version === currentVer) continue;
    if (i < config.keepVersions) continue;
    if (new Date(v.publishedAt) > cutoff) continue;

    const bytes = await purgeVersion(blocklet.did, v, opts);
    stats.purgedTarballs++;
    stats.reclaimableBytes += bytes;
  }
}

async function purgeStaleDrafts(blocklet, staleDays, opts, stats) {
  const cutoff = dayjs().subtract(staleDays, 'day').toDate();
  const staleStatuses = [
    VERSION_STATUS.DRAFT,
    VERSION_STATUS.REJECTED,
    VERSION_STATUS.CANCELLED,
  ];

  const versions = await BlockletVersion.find({
    did: blocklet.did,
    status: { $in: staleStatuses },
    purgedAt: null,
  });

  for (const v of versions) {
    const refDate = new Date(v.canceledAt || v.rejectedAt || v.uploadedAt);
    if (refDate > cutoff) continue;

    const bytes = await purgeVersion(blocklet.did, v, opts);
    stats.purgedDrafts++;
    stats.reclaimableBytes += bytes;

    // 如果是 DRAFT，同时清理 draft 静态目录
    if (v.status === VERSION_STATUS.DRAFT && v.version === blocklet.draftVersion?.version) {
      const draftDir = path.join(env.assetsDir, blocklet.did, 'draft');
      if (fs.existsSync(draftDir)) {
        if (opts.dryRun) {
          const size = getDirSize(draftDir);
          logger.info(`[DRY RUN] Would purge draft assets: did=${blocklet.did}, size=${formatBytes(size)}`);
          stats.reclaimableBytes += size;
        } else {
          fs.removeSync(draftDir);
        }
      }
    }
  }

}

async function purgeVersion(did, version, opts) {
  const versionDir = getBlockletDir(did, version.version);
  const exists = fs.existsSync(versionDir);

  if (opts.dryRun) {
    const size = exists ? getDirSize(versionDir) : 0;
    logger.info(
      `[DRY RUN] Would purge: did=${did}, version=${version.version}, status=${version.status}, size=${formatBytes(size)}`
    );
    return size;
  }

  if (exists) {
    fs.removeSync(versionDir);
  }

  await BlockletVersion.update(
    { did, version: version.version },
    { $set: { purgedAt: new Date().toISOString() } }
  );

  logger.info(`Purged: did=${did}, version=${version.version}, status=${version.status}`);
  return 0;
}

module.exports = { runRetentionJob };
```

## 6. Decisions Summary

| 决策 | 选择 | 理由 |
|------|------|------|
| 清理后版本在 API 中的可见性 | 从列表中隐藏 | DB 记录保留供审计，前端无需展示不可下载的版本 |
| 触发方式 | 仅定时自动执行 | 简化实现，无需额外 API 端点 |
| 清理范围 | tarball 目录 + 过期 DRAFT 的静态文件 | 静态资源本身不按版本存储，孤儿目录清理留给未来 |
| 管理界面 | 无 UI，仅 preferences 配置 | 最小实现，通过 blocklet preferences 可视化管理 |
| 付费 blocklet | 完全跳过 | NFT 许可证与版本绑定，删除可能导致用户无法下载已购版本 |
| 运行频率 | 每天凌晨 3:00 | 低峰期运行，与现有 cron 模式一致 |
| 日志通知 | 仅应用日志 | 简化实现，管理员可通过日志查看清理记录 |
| 保留版本数默认值 | 90 个 | 保守策略，大多数 blocklet 不会超过此数量 |
| 最小保留天数 | 180 天 | 给用户 6 个月的升级窗口 |
| 非终态过期天数 | 90 天 | DRAFT/REJECTED 保留 3 个月足够开发者处理 |
| 批量控制 | 无限制，一次性清理 | 文件删除操作足够快，无需分批 |
| 默认启用 | 关闭 (false) | 需管理员主动开启，避免意外清理 |
| Dry Run 模式 | 默认开启 (true) | 首次启用时先预览清理范围，确认无误后再真正执行 |

## 7. MVP Scope

### Included

- Version 表新增 `purgedAt` 字段 + migration
- Retention cron job（规则 A + B）
- Dry Run 模式（默认开启，仅记录日志 + 空间估算）
- Preferences 配置项（retentionEnabled, retentionDryRun, retentionKeepVersions, retentionKeepMinDays, retentionStaleDraftDays）
- `GET /:did/versions` 过滤 purgedAt
- `GET /:did/:version?/*.tgz` 下载端点返回 410
- 版本批量查询端点过滤 purgedAt
- 清理日志（含 dry run 空间估算）

### Excluded

- 管理员 UI 仪表盘（空间统计、清理历史）
- 手动触发清理 API
- Per-blocklet 自定义保留策略
- 付费 blocklet 的智能清理（基于下载活跃度）
- Download 表的数据清理
- 通知机制（Slack/邮件）
- 孤儿目录清理（磁盘有文件但 DB 无记录，留给未来一次性脚本）
- 超时审核版本的自动 cancel（属于工作流管理，不是磁盘清理职责）

## 8. Risks

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 误删 currentVersion 的 tarball | 用户无法下载当前版本 | 硬编码保护：currentVersion 永远跳过 |
| 清理后用户试图下载旧版本 | 下载失败 | 返回 410 + latestVersion 引导升级 |
| 付费 blocklet 被意外清理 | 购买用户无法下载 | nftFactory 检查完全跳过付费 blocklet |
| DB 更新失败导致重复删除 | 无影响 | 操作幂等，文件不存在时跳过 |
| 大量版本首次清理时 I/O 压力 | 短暂磁盘 IO 升高 | 凌晨执行，fs.removeSync 足够快 |
| preferences 配置错误（如 keepVersions=0） | 过度清理 | 代码中 `Math.max(1, ...)` 保底 |
| 首次上线不确定清理范围 | 可能误判 | dryRun 默认开启，先预览再执行 |

## 9. Open Items

- 是否需要在 `blocklet.json` 响应中标记版本的 purged 状态？
- 未来是否需要支持付费 blocklet 的清理（结合 download 活跃度）？
