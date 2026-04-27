export const REVIEW_BOARD_ID = '6c84fb90-12c4-11e1-840d-7b25c5ee775a';
export const DISCUSS_KIT_DID = 'z8ia1WEiBZ7hxURf6LwH21Wpg99vophFwSJdu';
export const BLOCKLET_STORE_DID = 'z8ia29UsENBg6tLZUKi2HABj38Cw1LmHZocbQ';

export enum EVersionStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
}

export enum EReviewType {
  FIRST = 'FIRST',
  EACH = 'EACH',
}

export enum EConditionType {
  AND = 'AND',
  OR = 'OR',
}

export enum EFilterKeys {
  CONDITION_TYPE = 'conditionType',
  REVIEW_STATUS = 'reviewStatus',
  TYPE = 'type',
  PERMISSION = 'permission',
  STATUS = 'status',
  UPGRADABLE = 'upgradable',
  AUTO_PUBLISH = 'autoPublish',
  REVIEW_TYPE = 'reviewType',
  IS_OFFICIAL = 'isOfficial',
}

export enum EBlockletStatus {
  BLOCKED = 'blocked',
  NORMAL = 'normal',
}

export enum ESortKeys {
  DOWNLOADS = 'stats.downloads',
  LAST_PUBLISHED_AT = 'lastPublishedAt',
  SOURCE = 'source',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export enum EWaitActions {
  REVIEW = 'review',
  PUBLISH = 'publish',
  UPGRADE = 'upgrade',
}

export enum ESortDirection {
  ASC = 'asc',
  DESC = 'desc',
}
