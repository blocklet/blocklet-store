import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { useRef } from 'react';
import { lazyApi } from '../../../libs/api';
import { IBlockletButton } from '../../../type';

import SafeButton from '../../safe-button';
import AuthDialog from '../../auth-dialog';
import { getDisplayName } from '../../../libs/util';
import { useSessionContext } from '../../../contexts/session';
import { getCurrentBlockletStatus } from '../../../libs/utils';

export default function AutoPublishButton({
  ref,
  blocklet,
  onSuccess,
  ...rest
}: IBlockletButton & {
  ref: React.RefObject<unknown | null>;
}) {
  const { t, locale } = useLocaleContext();
  const { session } = useSessionContext();

  const isAutoPublish = !!blocklet?.delegationToken?.autoPublish;
  const { needReview } = getCurrentBlockletStatus(blocklet);
  const authDialog = useRef<{ open: (data: any) => void }>(null);

  const deleteAutoPublish = async () => {
    await lazyApi.delete(`/api/developer/blocklets/${blocklet.id}/delegation/autoPublish`, {
      data: {
        locale,
        did: blocklet.did,
      },
    });
    onSuccess?.();
  };

  const createAutoPublish = () => {
    authDialog.current!.open({
      action: 'enable-auto-publish',
      params: {
        did: blocklet.did,
        id: blocklet.id,
        developerDid: session?.user?.did,
      },
      messages: {
        title: t('auth.enableAutoPublish'),
        scan: t('auth.enableAutoPublishScan', { name: getDisplayName(blocklet.meta) }),
        confirm: t('auth.confirm'),
      },
      onSuccessAuth: async () => {
        await onSuccess?.();
      },
      countdownForSuccess: 5,
      autoConnect: true,
    });
  };

  let title = '';
  if (needReview) {
    title = isAutoPublish ? t('blocklet.disableReviewAutoPublishTip') : t('blocklet.enableReviewAutoPublishTip');
  } else {
    title = isAutoPublish ? t('blocklet.disableAutoPublishTip') : t('blocklet.enableAutoPublishTip');
  }

  return (
    <>
      <SafeButton
        {...rest}
        ref={ref}
        title={title}
        onClick={() => {
          if (isAutoPublish) {
            deleteAutoPublish();
          } else {
            createAutoPublish();
          }
        }}>
        {isAutoPublish ? t('blocklet.disableAutoPublish') : t('blocklet.enableAutoPublish')}
      </SafeButton>
      <AuthDialog
        ref={authDialog}
        // @ts-ignore
        success={
          <p style={{ fontWeight: 'bold' }}>
            {t('auth.enableAutoPublishSuccessTip', { name: getDisplayName(blocklet.meta) })}
          </p>
        }
      />
    </>
  );
}
