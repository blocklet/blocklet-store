import { joinURL, parseURL } from 'ufo';
import semver from 'semver';
import { IBlocklet, IBlockletMeta } from '../type';
import { formatLogoPath, getUrlPrefix } from './util';
import { EReviewType, EVersionStatus } from '../constants';

export const getCurrentBlockletStatus = (
  blocklet: IBlocklet,
  version: string = blocklet.specifiedVersion?.version || blocklet.meta.version
) => {
  const reviewVersion = blocklet.reviewVersion?.version;
  const currentVersion = blocklet.currentVersion?.version;

  let specifiedVersionInfo = blocklet.specifiedVersion || blocklet.latestVersion;
  if (version && !blocklet.specifiedVersion && version === blocklet.reviewVersion?.version) {
    specifiedVersionInfo = blocklet.reviewVersion;
  } else if (version && !blocklet.specifiedVersion && version === blocklet.currentVersion?.version) {
    specifiedVersionInfo = blocklet.currentVersion;
  }

  const hasReviewHistory = !!specifiedVersionInfo.pendingAt;
  const reviewStatus = specifiedVersionInfo.status;

  // 1. 开启审核模式 & 首次发版（当前版本为空）
  // 2. 开启审核模式 & 当前状态为审核通过
  // 3. 开启审核模式 & 不是首次发版 & 当前状态不是审核通过 & Blocklet 每个版本都需要审核
  const needReview =
    window.blocklet?.preferences.needReview &&
    (!currentVersion || reviewStatus === EVersionStatus.APPROVED || blocklet.reviewType !== EReviewType.FIRST);

  const isPendingReview = needReview && reviewStatus === EVersionStatus.PENDING_REVIEW;
  const isApproved = reviewStatus === EVersionStatus.APPROVED;
  const isRejected = reviewStatus === EVersionStatus.REJECTED;
  const isPublished = reviewStatus === EVersionStatus.PUBLISHED;
  const isCancelled = reviewStatus === EVersionStatus.CANCELLED;
  const isInReview = needReview && reviewStatus === EVersionStatus.IN_REVIEW;
  const isBlocked = blocklet.status === 'blocked';

  let isDraft = false;
  if (needReview) {
    isDraft = !reviewStatus || reviewStatus === EVersionStatus.DRAFT;
  } else {
    isDraft = ![EVersionStatus.REJECTED, EVersionStatus.PUBLISHED, EVersionStatus.CANCELLED].includes(
      reviewStatus || EVersionStatus.DRAFT
    );
  }

  const canPublish = (!needReview && isDraft) || isApproved;

  const useReviewSrc =
    [
      EVersionStatus.PENDING_REVIEW,
      EVersionStatus.IN_REVIEW,
      EVersionStatus.APPROVED,
      EVersionStatus.REJECTED,
    ].includes(reviewStatus) &&
    semver.lte(version, reviewVersion!) &&
    (currentVersion ? semver.gt(version, currentVersion) : true);

  const useDraftSrc = !useReviewSrc && (currentVersion ? semver.gt(version, currentVersion) : true);

  // 如果无需审核且为草稿，则取草稿状态（特别情况，关闭了审核，但之前正在review中）
  let status = reviewStatus;
  if (!needReview && isDraft) {
    status = EVersionStatus.DRAFT;
  }

  return {
    version,
    reviewStatus,
    status,
    hasReviewHistory,
    specifiedVersionInfo,
    isDraft,
    useDraftSrc,
    useReviewSrc,
    needReview,
    canPublish,
    isPendingReview,
    isInReview,
    isPublished,
    isApproved,
    isRejected,
    isBlocked,
    isCancelled,
  };
};

const { host } = parseURL(window.location.href);
export const getBlockletLogoAndPrefix = (meta: IBlockletMeta, useDraftSrc?: boolean, useReviewSrc?: boolean) => {
  let logoUrl = '';

  const urlInfo = parseURL(meta.dist?.tarball);
  const prefix =
    urlInfo.host && host !== urlInfo.host
      ? joinURL(`${urlInfo.protocol}//${urlInfo.host}`, urlInfo.pathname.replace(/\/api.+$/g, ''))
      : getUrlPrefix().prefix;

  if (meta.logo) {
    logoUrl = joinURL(
      prefix,
      formatLogoPath({ did: meta.did, asset: meta.logo, version: meta.version, useDraftSrc, useReviewSrc })
    );
  }
  return { logoUrl, prefix };
};
