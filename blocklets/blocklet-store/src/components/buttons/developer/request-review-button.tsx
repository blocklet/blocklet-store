import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { joinURL } from 'ufo';
import { lazyApi } from '../../../libs/api';
import { getCurrentBlockletStatus } from '../../../libs/utils';
import { IBlockletButton } from '../../../type';
import SafeButton from '../../safe-button';

export default function RequestReviewButton({
  ref,
  blocklet,
  disabled,
  onSuccess,
  ...rest
}: IBlockletButton & {
  ref: React.RefObject<unknown | null>;
}) {
  const { t } = useLocaleContext();
  const { isBlocked } = getCurrentBlockletStatus(blocklet);

  const urlInfo = new URL(window.location.href);
  const url = joinURL(urlInfo.origin, 'blocklets', blocklet.did, blocklet.meta.version);

  return (
    <SafeButton
      data-cy="request-review-button"
      isBlocked={isBlocked}
      title={t('button.requestReview')}
      disabled={disabled}
      {...rest}
      ref={ref}
      onClick={
        disabled
          ? undefined
          : () =>
              lazyApi
                .put(`/api/developer/blocklets/${blocklet.did}/request-review`, {
                  version: blocklet.meta.version,
                  url,
                })
                .then(() => onSuccess?.())
      }>
      {t('button.requestReview')}
    </SafeButton>
  );
}
