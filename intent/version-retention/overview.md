# Blocklet Version Retention: 自动清理历史版本文件节省磁盘空间

## 一句话说明

通过定时任务自动删除过期的 blocklet 历史版本 tarball 文件，保留 DB 记录用于审计追溯。

## Why?

Blocklet Store 永久保存每个 blocklet 的所有历史版本文件（tarball 5-100 MB/版本），随运行时间增长磁盘占用持续膨胀。一个有 36 个历史版本的 blocklet 可能占用 1.8-3.6 GB，100 个 blocklet 的 store 可达 60+ GB。需要自动化的清理机制在保证安全的前提下回收空间。

## Core Experience

```
管理员在 Blocklet Preferences 中开启 Data Retention
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
   首次: dryRun=true      确认后: dryRun=false
   仅输出日志+空间估算    真正执行清理
         │                     │
         └──────────┬──────────┘
                    ▼
          每天凌晨 3:00 自动运行
                    │
     ┌────────────────────────────┐
     ▼                          ▼
  已发布版本 (规则 A)      非终态版本 (规则 B)
  保留最近 90 个            DRAFT/REJECTED/CANCELLED
  + 180 天内的              90 天后清理
  跳过付费 blocklet
     │                          │
     ▼                          ▼
  删除 tarball 目录, 更新 DB (purgedAt)
                    │
                    ▼
  版本列表 API 自动隐藏已清理版本
  下载端点返回 410 + 指引最新版本
```

## Architecture

```
┌───────────────────────────────────────┐
│         @abtnode/cron (现有)           │
│                                       │
│  ┌─ developer.stake.revoked (现有)    │
│  └─ version.retention (新增)   ◄──────┤── 每天 3:00 AM
└───────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│     version-retention.js (新增)       │
│                                       │
│  读取 preferences → 检查 dryRun       │
│  → 遍历 blocklets → 按规则筛选       │
│  → dryRun? 记日志 : 删文件+更新 DB   │
└───────────┬───────────┬───────────────┘
            │           │
     ┌──────┘           └──────┐
     ▼                         ▼
┌──────────┐            ┌──────────────┐
│ versions │            │ 磁盘          │
│ (SQLite) │            │ blocklets/   │
│ +purgedAt│            │ assets/      │
└──────────┘            └──────────────┘
```

## Key Decisions

| 问题 | 选择 | 理由 |
|------|------|------|
| 清理后版本可见性 | 从列表隐藏 | 不可下载的版本展示无意义 |
| 触发方式 | 仅定时 | 简单可靠，无需额外 API |
| 付费 blocklet | 完全跳过 | NFT 许可与版本绑定，不能冒险 |
| 管理界面 | Preferences 配置 | 最小实现 |
| 默认启用 | 关闭 | 安全第一，管理员主动开启 |
| Dry Run | 默认开启 | 先看日志确认范围，再真正清理 |
| 保留数量默认 | 90 个版本 | 保守策略 |
| 最小保留时间 | 180 天 | 给用户充足升级窗口 |

## Scope

**In (MVP)**:
- Version 表 `purgedAt` 字段 + migration
- Cron job 清理逻辑（2 条规则）
- Dry Run 模式（默认开启，日志 + 空间估算）
- Preferences 配置项（5 个）
- API 端点适配（versions 过滤 + download 410）

**Out**:
- 管理仪表盘 UI
- 手动触发 API
- Per-blocklet 自定义策略
- 付费 blocklet 智能清理
- Download 表清理
- 孤儿目录清理
- 超时审核自动 cancel

## Risk + Mitigation

| 风险 | 缓解 |
|------|------|
| 误删当前版本 | 硬编码保护 currentVersion |
| 付费版本被清理 | nftFactory 检查跳过 |
| 配置错误导致过度清理 | `Math.max(1, ...)` 保底 |
| 首次上线不确定清理范围 | dryRun 默认开启，先预览再执行 |
| 首次大量清理 IO 压力 | 凌晨执行，文件删除够快 |

## 推荐上线流程

1. 部署代码（migration 自动运行）
2. 设置 `retentionEnabled = true`（dryRun 默认 true）
3. 等待凌晨 cron 运行，查看日志确认清理范围
4. 确认无误后设置 `retentionDryRun = false`
5. 次日观察实际清理效果

## Next Steps

1. 实现 migration + Version model 变更
2. 实现 version-retention.js cron job（含 dryRun）
3. 修改 API 端点添加 purgedAt 过滤
4. 更新 blocklet.prefs.json 添加 retention tab
5. 测试环境 dryRun 验证
6. 测试环境真正清理验证
7. 生产环境上线
