import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { EVersionStatus } from '../../../constants';
import { lazyApi } from '../../../libs/api';
import { getCurrentBlockletStatus } from '../../../libs/utils';
import { IBlockletButton } from '../../../type';
import SafeButton from '../../safe-button';

export default function StartReviewButton({
  ref,
  blocklet,
  onSuccess,
  disabled,
  ...rest
}: IBlockletButton & {
  ref: React.RefObject<unknown | null>;
}) {
  const { t } = useLocaleContext();
  const { isBlocked } = getCurrentBlockletStatus(blocklet);

  return (
    <SafeButton
      variant="outlined"
      isBlocked={isBlocked}
      data-cy="request-review"
      color="warning"
      {...rest}
      ref={ref}
      onClick={
        disabled
          ? undefined
          : () =>
              lazyApi
                .put(`/api/console/blocklets/${blocklet.did}/review`, {
                  action: EVersionStatus.IN_REVIEW,
                  version: blocklet.meta.version,
                })
                .then(() => onSuccess?.())
      }>
      {t('button.startReview')}
    </SafeButton>
  );
}
