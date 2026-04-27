import semver from 'semver';
import { EConditionType, EFilterKeys, ESortKeys, EVersionStatus, EWaitActions } from '../../constants';
import { IBlocklet } from '../../type';

export function isPendingReview(blocklet: IBlocklet) {
  const { reviewVersion } = blocklet;
  if (
    reviewVersion &&
    [EVersionStatus.PENDING_REVIEW, EVersionStatus.IN_REVIEW].includes(
      reviewVersion.status as typeof EVersionStatus.PENDING_REVIEW
    )
  ) {
    return true;
  }
  return false;
}

/**
 * Determines the pending actions for a blocklet based on its version statuses.
 *
 * @remarks
 * This function evaluates the current, review, and latest versions of a blocklet
 * to determine what actions are required.
 *
 * @param blocklet - The blocklet to analyze for pending actions
 * @returns An array of wait actions that need to be performed
 *
 * @returns Actions can include:
 * - `UPGRADE`: When no current version exists or a newer version is available
 * - `PUBLISH`: When a review version is approved and ready for publication
 */
export function getWaitActions(blocklet: IBlocklet) {
  const { reviewVersion, latestVersion, currentVersion } = blocklet;

  const actions: EWaitActions[] = [];

  // 从未发布过，需要发布操作
  if (!currentVersion && (!reviewVersion || reviewVersion.status === EVersionStatus.DRAFT)) {
    actions.push(EWaitActions.UPGRADE);
  }

  // 审核通过，需要发布操作
  if (reviewVersion && reviewVersion.status === EVersionStatus.APPROVED) {
    actions.push(EWaitActions.PUBLISH);
  }

  // 最新版本大于当前审核中版本或当前版本
  if (
    currentVersion?.version &&
    (reviewVersion?.version
      ? semver.gt(latestVersion.version, reviewVersion.version)
      : semver.gt(latestVersion.version, currentVersion.version))
  ) {
    actions.push(EWaitActions.UPGRADE);
  }

  return actions;
}

/**
 * Sorts two blocklets based on a specified sorting criterion.
 *
 * @remarks
 * This function supports sorting blocklets by various attributes such as downloads, last published date,
 * creation date, update date, and source. The sorting can be performed in ascending or descending order.
 *
 * @param sort - An object specifying the sorting configuration
 * @param sort.name - The key to sort by (downloads, last published date, created date, updated date, or source)
 * @param sort.direction - The sort direction ('asc' or 'desc')
 * @param blockletA - The first blocklet to compare
 * @param blockletB - The second blocklet to compare
 * @returns A numerical value indicating the sort order (-1, 0, or 1)
 *
 * @beta
 */
export function sortBlocklet(sort: { name: string; direction: string }, blockletA: IBlocklet, blockletB: IBlocklet) {
  const flag = sort.direction === 'desc' ? 1 : -1;
  if (sort.name === ESortKeys.DOWNLOADS) {
    const downloadsA = blockletA.meta?.stats?.downloads || 0;
    const downloadsB = blockletB.meta?.stats?.downloads || 0;
    return flag * (downloadsB - downloadsA);
  }
  if (sort.name === ESortKeys.LAST_PUBLISHED_AT) {
    if (!blockletA.lastPublishedAt && !blockletB.lastPublishedAt) {
      return flag * (new Date(blockletB.updatedAt).getTime() - new Date(blockletA.updatedAt).getTime());
    }
    if (!blockletB.lastPublishedAt) {
      return flag * -1;
    }
    if (!blockletA.lastPublishedAt) {
      return flag;
    }
    return flag * (new Date(blockletB.lastPublishedAt).getTime() - new Date(blockletA.lastPublishedAt).getTime());
  }
  if (sort.name === ESortKeys.CREATED_AT) {
    return flag * (new Date(blockletB.createdAt).getTime() - new Date(blockletA.createdAt).getTime());
  }
  if (sort.name === ESortKeys.UPDATED_AT) {
    return flag * (new Date(blockletB.updatedAt).getTime() - new Date(blockletA.updatedAt).getTime());
  }
  if (sort.name === ESortKeys.SOURCE) {
    const sourceA = blockletA.source;
    const sourceB = blockletB.source;
    if (!sourceA && !sourceB) {
      return flag * (new Date(blockletB.updatedAt).getTime() - new Date(blockletA.updatedAt).getTime());
    }
    if (!sourceA) {
      return flag * 1;
    }
    if (!sourceB) {
      return flag * -1;
    }
    return flag * sourceB.localeCompare(sourceA);
  }
  return 0;
}

export function getSortGroups(t: (key: string) => string) {
  return [
    {
      key: ESortKeys.UPDATED_AT,
      title: t('common.updatedAt'),
    },
    {
      key: ESortKeys.LAST_PUBLISHED_AT,
      title: t('common.lastPublishedAt'),
    },
    {
      key: ESortKeys.CREATED_AT,
      title: t('common.createdAt'),
    },
    {
      key: ESortKeys.DOWNLOADS,
      title: t('common.downloadNum'),
    },
    {
      key: ESortKeys.SOURCE,
      title: t('common.source'),
    },
  ];
}

/**
 * Generates filter groups for blocklet management with localized labels.
 *
 * @remarks
 * Creates a comprehensive set of filter options for blocklets, supporting various filtering criteria.
 * Uses a translation function to provide localized labels for each filter group and item.
 *
 * @param t - A translation function that converts translation keys to localized strings
 * @returns An array of filter groups with keys, titles, and filterable items
 *
 * @example
 * ```typescript
 * const filters = getFilterGroups(translationFunction);
 * // Returns filter groups with localized labels for condition types, review status, etc.
 * ```
 */
export function getFilterGroups(t: (key: string) => string) {
  return [
    {
      key: EFilterKeys.CONDITION_TYPE,
      title: t('common.conditionType'),
      supportCancel: false,
      items: [
        {
          label: t('common.or'),
          value: EConditionType.OR,
        },
        {
          label: t('common.and'),
          value: EConditionType.AND,
        },
      ],
    },
    {
      key: EFilterKeys.REVIEW_STATUS,
      title: t('blocklet.reviewStatus'),
      isCheckboxGroup: true,
      items: [
        {
          label: t('blocklet.draft'),
          value: EVersionStatus.DRAFT,
        },
        {
          label: t('blocklet.pending'),
          value: EVersionStatus.PENDING_REVIEW,
        },
        {
          label: t('blocklet.inReview'),
          value: EVersionStatus.IN_REVIEW,
        },
        {
          label: t('blocklet.approved'),
          value: EVersionStatus.APPROVED,
        },
        {
          label: t('blocklet.rejected'),
          value: EVersionStatus.REJECTED,
        },
        {
          label: t('blocklet.published'),
          value: EVersionStatus.PUBLISHED,
        },
      ],
    },
    {
      key: EFilterKeys.TYPE,
      title: t('blocklet.type'),
      items: [
        {
          label: 'Blocklet',
          value: 'Blocklet',
        },
        {
          label: t('blocklet.resource'),
          value: 'Resource',
        },
      ],
    },
    {
      key: EFilterKeys.PERMISSION,
      title: t('blocklet.permission'),
      items: [
        {
          label: t('blocklet.public'),
          value: 'Public',
        },
        {
          label: t('blocklet.private'),
          value: 'Private',
        },
      ],
    },
    {
      key: EFilterKeys.STATUS,
      title: t('common.status'),
      items: [
        {
          label: t('common.blocked'),
          value: 'blocked',
        },
        {
          label: t('common.normal'),
          value: 'normal',
        },
      ],
    },
    {
      key: EFilterKeys.UPGRADABLE,
      title: t('blocklet.upgradable'),
      items: [
        {
          label: t('common.yes'),
          tips: `${t('blocklet.upgradable')}: ${t('common.yes')}`,
          value: 'true',
        },
        {
          label: t('common.no'),
          tips: `${t('blocklet.upgradable')}: ${t('common.no')}`,
          value: 'false',
        },
      ],
    },
    {
      key: EFilterKeys.AUTO_PUBLISH,
      title: t('blocklet.autoPublish'),
      items: [
        {
          label: t('common.yes'),
          tips: `${t('blocklet.autoPublish')}: ${t('common.yes')}`,
          value: 'true',
        },
        {
          label: t('common.no'),
          tips: `${t('blocklet.autoPublish')}: ${t('common.no')}`,
          value: 'false',
        },
      ],
    },
  ];
}
