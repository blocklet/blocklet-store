import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Toast from '@arcblock/ux/lib/Toast';
import { Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useState } from 'react';
import { lazyApi } from '../../../libs/api';
import { IBlockletButton } from '../../../type';
import { CheckButton } from '../../check-group';
import SafeButton from '../../safe-button';
import { EReviewType } from '../../../constants';

export default function ReviewTypeButton({
  ref,
  blocklet,
  onSuccess,
  ...rest
}: IBlockletButton & {
  ref: React.RefObject<unknown | null>;
}) {
  const { t } = useLocaleContext();
  const [openDialog, setOpenDialog] = useState(false);
  const [reviewType, setReviewType] = useState(blocklet.reviewType || EReviewType.EACH);

  return (
    <>
      <SafeButton {...rest} ref={ref} onClick={() => setOpenDialog(true)}>
        {t('blocklet.setReviewType')}
      </SafeButton>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{t('blocklet.setReviewType')}</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <Typography sx={{ cursor: 'default', mb: 0.5, fontWeight: 500 }}>
            Blocklet {t('blocklet.reviewType')}
          </Typography>
          <CheckButton
            fontSize={15}
            isRadio
            sx={{ display: 'block', width: 'fit-content' }}
            label={t('blocklet.reviewFirstVersion')}
            checked={reviewType === EReviewType.FIRST}
            onChange={() => setReviewType(EReviewType.FIRST)}
          />
          <CheckButton
            fontSize={15}
            isRadio
            sx={{ display: 'block', width: 'fit-content' }}
            label={t('blocklet.reviewEveryVersion')}
            checked={reviewType === EReviewType.EACH}
            onChange={() => setReviewType(EReviewType.EACH)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <SafeButton variant="outlined" onClick={() => setOpenDialog(false)} autoFocus>
            {t('common.cancel')}
          </SafeButton>
          <SafeButton
            color="success"
            disabled={reviewType === blocklet.reviewType}
            onClick={async () => {
              try {
                await lazyApi.put(`/api/console/blocklets/${blocklet.id}/category`, {
                  category: blocklet.meta.category?.id,
                  reviewType,
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
