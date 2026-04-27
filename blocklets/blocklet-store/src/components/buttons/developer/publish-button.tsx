import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Toast from '@arcblock/ux/lib/Toast';
import { Button } from '@mui/material';
import { useCallback, useRef } from 'react';
import { useSessionContext } from '../../../contexts/session';
import { lazyApi } from '../../../libs/api';
import { getDisplayName } from '../../../libs/util';
import { getCurrentBlockletStatus } from '../../../libs/utils';
import { IBlockletButton } from '../../../type';
import AuthDialog from '../../auth-dialog';
import SafeButton from '../../safe-button';

export default function PublishButton({
  ref,
  ...props
}: IBlockletButton & {
  ref: React.RefObject<unknown | null>;
}) {
  const { blocklet, disabled, onSuccess, ...rest } = props;
  const { t } = useLocaleContext();
  const { session } = useSessionContext();
  const authDialog = useRef<any>(null);

  const { isBlocked } = getCurrentBlockletStatus(blocklet);

  // 唤起 did-content 之前 校验 blocklet 是否需要付费
  const openPublishDialog = useCallback(async () => {
    const { id: blockletId, meta, did } = blocklet;
    try {
      // 我想知道此次发布blocklet以免费的形式还是付费的形式去发布的,action取值范围为: ['paid-publish-blocklet', 'free-publish-blocklet']
      const { data: action } = await lazyApi.get(`/api/developer/blocklets/verify-nft-factory/${did}`);

      // 弹出扫码界面
      authDialog.current!.open({
        action,
        params: {
          blockletId,
          did,
          version: meta.version,
          developerDid: session?.user?.did,
        },
        messages: {
          title: t('auth.publish'),
          scan: t('auth.publishScan', { name: getDisplayName(meta) }),
          confirm: t('auth.confirm'),
        },
        onSuccessAuth() {
          onSuccess?.();
        },
        countdownForSuccess: 5,
        autoConnect: false,
      });
    } catch (error: any) {
      Toast.error(error?.response?.data?.error);
    }
  }, [t, session, blocklet, onSuccess]);

  return (
    <>
      <SafeButton
        data-cy="publish-button"
        isBlocked={isBlocked}
        title={t('blocklet.publishButton', { version: blocklet.meta.version })}
        disabled={disabled}
        {...rest}
        ref={ref}
        onClick={disabled ? undefined : openPublishDialog}>
        {t('common.publish')}
      </SafeButton>
      <AuthDialog
        ref={authDialog}
        // @ts-ignore
        success={
          <Button variant="contained" color="primary">
            <a target="_blank" href={`/blocklets/${blocklet.meta.did}`} rel="noreferrer">
              {t('auth.publishSuccessTip')}
            </a>
          </Button>
        }
      />
    </>
  );
}
