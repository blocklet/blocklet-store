import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Toast from '@arcblock/ux/lib/Toast';
import { Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useState } from 'react';
import { lazyApi } from '../../../libs/api';
import { IBlockletButton } from '../../../type';
import SafeButton from '../../safe-button';
import { EVersionStatus } from '../../../constants';

export default function CancelReviewButton({
  ref,
  blocklet,
  onSuccess,
  ...rest
}: IBlockletButton & {
  ref: React.RefObject<unknown | null>;
}) {
  const { t } = useLocaleContext();
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <>
      <SafeButton {...rest} ref={ref} onClick={() => setOpenDialog(true)}>
        {t('button.cancelReview')}
      </SafeButton>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{t('button.cancelReview')}</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <Typography>{t('blocklet.cancelReviewDesc')}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <SafeButton variant="outlined" onClick={() => setOpenDialog(false)} autoFocus>
            {t('common.cancel')}
          </SafeButton>
          <SafeButton
            color="error"
            disabled={
              !blocklet.reviewVersion ||
              ![EVersionStatus.PENDING_REVIEW, EVersionStatus.IN_REVIEW, EVersionStatus.APPROVED].includes(
                blocklet.reviewVersion.status
              )
            }
            onClick={async () => {
              try {
                await lazyApi.put(`/api/developer/blocklets/${blocklet.did}/cancel-review`, {
                  version: blocklet.reviewVersion?.version,
                });
                setOpenDialog(false);
              } catch (err: any) {
                const { error } = err.response?.data ?? { error: err };
                Toast.error(error);
              } finally {
                onSuccess?.();
              }
            }}>
            {t('common.confirm')}
          </SafeButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
