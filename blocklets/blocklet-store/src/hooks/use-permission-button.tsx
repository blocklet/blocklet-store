import { Box } from '@mui/material';
import { useRef } from 'react';
import AddComponentButton from '../components/buttons/add-component-button';
import BlockButton from '../components/buttons/admin/block-button';
import CategoryButton from '../components/buttons/admin/category-button';
import ReviewTypeButton from '../components/buttons/admin/review-type-button';
import StartReviewButton from '../components/buttons/admin/start-review-button';
import CopyDidButton from '../components/buttons/copy-did-button';
import CopyInstallUrlButton from '../components/buttons/copy-install-url-button';
import AutoPublishButton from '../components/buttons/developer/auto-publish-button';
import EditBlockletButton from '../components/buttons/developer/edit-blocklet-button';
import PublishButton from '../components/buttons/developer/publish-button';
import RequestReviewButton from '../components/buttons/developer/request-review-button';
import LaunchButton from '../components/buttons/launch-button';
import ReviewButton from '../components/buttons/review-button';
import OrgsButton from '../components/buttons/orgs-button';
import { checkCanLaunch } from '../libs/util';
import { getCurrentBlockletStatus } from '../libs/utils';
import { IBlockletButton } from '../type';
import { useProtectMine } from './protect';
import CancelReviewButton from '../components/buttons/developer/cancel-review-button';
import useUser from './user';

export enum EButtons {
  LAUNCH = 'launch',
  PUBLISH = 'publish',
  REQUEST_REVIEW = 'requestReview',
  START_REVIEW = 'startReview',
  REVIEW = 'review',
  EDIT = 'edit',
  CATEGORY = 'category',
  AUTO_PUBLISH = 'autoPublish',
  CANCEL_REVIEW = 'cancelReview',
  BLOCK = 'block',
  REVIEW_TYPE = 'reviewType',
  ADD_COMPONENT = 'addComponent',
  COPY_INSTALL_URL = 'copyInstallUrl',
  COPY_DID = 'copyDid',
  ORG_MIGRATION = 'orgMigration',
}

export default function usePermissionButton(
  { blocklet, ...rest }: IBlockletButton,
  {
    showButtons = Object.values(EButtons),
    skipCount = 0,
    pickCount = 0,
  }: {
    showButtons?: EButtons[];
    skipCount?: number;
    pickCount?: number;
  } = {}
) {
  const { isProtected: isMine } = useProtectMine(blocklet.ownerDid);
  const { hasAdmin, hasOwner, isOrgOwner, org } = useUser();
  const isAdmin = hasAdmin || hasOwner;
  const { isBlocked, isPendingReview, canPublish, isDraft, needReview, hasReviewHistory, isInReview, isApproved } =
    getCurrentBlockletStatus(blocklet);

  const launchBtnRef = useRef<HTMLButtonElement & { content: string; onClick: () => void }>(null);
  const publishBtnRef = useRef<HTMLButtonElement & { content: string; onClick: () => void }>(null);
  const requestReviewBtnRef = useRef<HTMLButtonElement & { content: string; onClick: () => void }>(null);
  const cancelReviewBtnRef = useRef<HTMLButtonElement & { content: string; onClick: () => void }>(null);
  const startReviewBtnRef = useRef<HTMLButtonElement & { content: string; onClick: () => void }>(null);
  const reviewBtnRef = useRef<HTMLButtonElement & { content: string; onClick: () => void }>(null);
  const addComponentBtnRef = useRef<HTMLButtonElement & { content: string; onClick: () => void }>(null);
  const copyInstallUrlBtnRef = useRef<HTMLButtonElement & { content: string; onClick: () => void }>(null);
  const copyDidBtnRef = useRef<HTMLButtonElement & { content: string; onClick: () => void }>(null);
  const categoryBtnRef = useRef<HTMLButtonElement & { content: string; onClick: () => void }>(null);
  const reviewTypeBtnRef = useRef<HTMLButtonElement & { content: string; onClick: () => void }>(null);
  const blockBtnRef = useRef<HTMLButtonElement & { content: string; onClick: () => void }>(null);
  const editBtnRef = useRef<HTMLButtonElement & { content: string; onClick: () => void }>(null);
  const autoPublishBtnRef = useRef<HTMLButtonElement & { content: string; onClick: () => void }>(null);
  const changeOrgBtnRef = useRef<HTMLButtonElement & { content: string; onClick: () => void }>(null);
  const buttonList: {
    key: EButtons;
    isSimple: boolean;
    ref: React.RefObject<(HTMLButtonElement & { content: string; onClick: () => void }) | null>;
    component: React.ReactNode;
  }[] = [];

  if (showButtons.includes(EButtons.LAUNCH)) {
    const disabled = isBlocked || (!blocklet.currentVersion && !isAdmin);
    buttonList.push({
      key: EButtons.LAUNCH,
      ref: launchBtnRef,
      isSimple: true,
      component: (
        <LaunchButton
          {...rest}
          ref={launchBtnRef}
          variant="contained"
          sx={{ px: 3 }}
          disabled={disabled}
          blocklet={blocklet.meta}
        />
      ),
    });
  }

  if (isMine) {
    if (showButtons.includes(EButtons.PUBLISH) && canPublish) {
      buttonList.push({
        key: EButtons.PUBLISH,
        isSimple: false,
        ref: publishBtnRef,
        component: <PublishButton {...rest} ref={publishBtnRef} blocklet={blocklet} />,
      });
    }
    if (showButtons.includes(EButtons.REQUEST_REVIEW) && needReview && isDraft) {
      buttonList.push({
        key: EButtons.REQUEST_REVIEW,
        isSimple: false,
        ref: requestReviewBtnRef,
        component: <RequestReviewButton {...rest} ref={requestReviewBtnRef} blocklet={blocklet} />,
      });
    }
  }

  if (isAdmin) {
    if (showButtons.includes(EButtons.START_REVIEW) && needReview && isPendingReview) {
      buttonList.push({
        key: EButtons.START_REVIEW,
        isSimple: false,
        ref: startReviewBtnRef,
        component: <StartReviewButton {...rest} ref={startReviewBtnRef} blocklet={blocklet} />,
      });
    }
  }

  if (showButtons.includes(EButtons.REVIEW) && (isMine || isAdmin) && hasReviewHistory) {
    buttonList.push({
      key: EButtons.REVIEW,
      isSimple: false,
      ref: reviewBtnRef,
      component: <ReviewButton {...rest} ref={reviewBtnRef} blocklet={blocklet} />,
    });
  }

  if (
    showButtons.includes(EButtons.CANCEL_REVIEW) &&
    isMine &&
    needReview &&
    (isPendingReview || isInReview || isApproved)
  ) {
    buttonList.push({
      key: EButtons.CANCEL_REVIEW,
      isSimple: false,
      ref: cancelReviewBtnRef,
      component: <CancelReviewButton {...rest} ref={cancelReviewBtnRef} blocklet={blocklet} />,
    });
  }

  if (isAdmin) {
    if (showButtons.includes(EButtons.CATEGORY)) {
      buttonList.push({
        key: EButtons.CATEGORY,
        isSimple: false,
        ref: categoryBtnRef,
        component: <CategoryButton {...rest} ref={categoryBtnRef} blocklet={blocklet} />,
      });
    }

    if (showButtons.includes(EButtons.BLOCK)) {
      buttonList.push({
        key: EButtons.BLOCK,
        isSimple: false,
        ref: blockBtnRef,
        component: <BlockButton {...rest} ref={blockBtnRef} blocklet={blocklet} />,
      });
    }

    if (showButtons.includes(EButtons.REVIEW_TYPE)) {
      buttonList.push({
        key: EButtons.REVIEW_TYPE,
        isSimple: false,
        ref: reviewTypeBtnRef,
        component: <ReviewTypeButton {...rest} ref={reviewTypeBtnRef} blocklet={blocklet} />,
      });
    }
  }

  if (isMine) {
    if (showButtons.includes(EButtons.EDIT)) {
      buttonList.push({
        key: EButtons.EDIT,
        isSimple: false,
        ref: editBtnRef,
        component: <EditBlockletButton {...rest} ref={editBtnRef} blocklet={blocklet} />,
      });
    }

    if (showButtons.includes(EButtons.AUTO_PUBLISH)) {
      buttonList.push({
        key: EButtons.AUTO_PUBLISH,
        isSimple: false,
        ref: autoPublishBtnRef,
        component: <AutoPublishButton {...rest} ref={autoPublishBtnRef} blocklet={blocklet} />,
      });
    }
  }

  if (showButtons.includes(EButtons.ADD_COMPONENT) && blocklet.meta.capabilities?.component) {
    buttonList.push({
      key: EButtons.ADD_COMPONENT,
      isSimple: true,
      ref: addComponentBtnRef,
      component: <AddComponentButton {...rest} ref={addComponentBtnRef} blocklet={blocklet} />,
    });
  }

  if (showButtons.includes(EButtons.COPY_INSTALL_URL) && checkCanLaunch(blocklet.meta)) {
    buttonList.push({
      key: EButtons.COPY_INSTALL_URL,
      isSimple: false,
      ref: copyInstallUrlBtnRef,
      component: <CopyInstallUrlButton {...rest} ref={copyInstallUrlBtnRef} blocklet={blocklet} />,
    });
  }

  if (showButtons.includes(EButtons.COPY_DID)) {
    buttonList.push({
      key: EButtons.COPY_DID,
      isSimple: false,
      ref: copyDidBtnRef,
      component: <CopyDidButton {...rest} ref={copyDidBtnRef} blocklet={blocklet} />,
    });
  }

  if (org && isOrgOwner && showButtons.includes(EButtons.ORG_MIGRATION) && blocklet.inOrg) {
    buttonList.push({
      key: EButtons.ORG_MIGRATION,
      isSimple: false,
      ref: changeOrgBtnRef,
      component: <OrgsButton {...rest} org={org} ref={changeOrgBtnRef} blocklet={blocklet} />,
    });
  }

  return {
    buttons: buttonList.slice(skipCount, pickCount || undefined),
    buttonInstants: (
      <Box
        sx={{
          display: 'none',
        }}>
        {buttonList
          .slice(skipCount, pickCount || undefined)
          .map((button) => (button.isSimple ? null : <Box key={button.key}>{button.component}</Box>))}
      </Box>
    ),
  };
}
