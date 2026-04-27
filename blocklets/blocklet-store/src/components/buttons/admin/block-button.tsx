import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Toast from '@arcblock/ux/lib/Toast';
import {
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  TextField,
  Typography,
} from '@mui/material';
import { useRef, useState } from 'react';
import { lazyApi } from '../../../libs/api';
import { IBlocklet, IBlockletButton } from '../../../type';
import { CheckButton } from '../../check-group';
import SafeButton from '../../safe-button';

export default function BlockButton({
  ref,
  blocklet,
  onSuccess,
  ...rest
}: IBlockletButton & {
  ref: React.RefObject<unknown | null>;
}) {
  const { t } = useLocaleContext();
  const [openDialog, setOpenDialog] = useState(false);

  const isBlocked = blocklet.status === 'blocked';
  return (
    <>
      <SafeButton {...rest} ref={ref} onClick={() => setOpenDialog(true)}>
        {isBlocked ? t('common.unblock') : t('common.block')}
      </SafeButton>
      {!isBlocked && (
        <BlockDialog
          {...rest}
          blocklet={blocklet}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
          onSuccess={onSuccess}
        />
      )}
      {isBlocked && (
        <UnblockDialog
          {...rest}
          blocklet={blocklet}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
}

function BlockDialog({
  ...props
}: ButtonProps & {
  blocklet: IBlocklet;
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
}) {
  const { blocklet, openDialog, setOpenDialog, onSuccess } = props;
  const { t, locale } = useLocaleContext();
  const [reason, setReason] = useState(blocklet.blockReason || '');
  const [slashStaking, setSlashStaking] = useState(false);
  const preText = useRef(reason);
  if (!preText.current) {
    preText.current = reason.trim();
  }

  const hasError = !reason && !!preText.current;

  return (
    <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
      <DialogTitle>{t('blocklet.disableAction')}</DialogTitle>
      <DialogContent>
        <Typography sx={{ cursor: 'default', mb: 1, fontWeight: 500 }}>{t('blocklet.disableDesc')}</Typography>
        <FormControl fullWidth>
          <TextField
            fullWidth
            multiline
            minRows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            variant="outlined"
            margin="normal"
            placeholder={t('form.blockReasonPlaceholder')}
            label={t('form.blockReason')}
            data-cy="disable-blocklet-reason"
            error={hasError}
            helperText={hasError ? t('form.required', { name: t('form.blockReason') }) : ''}
          />
        </FormControl>
        {window.blocklet?.preferences.permissionMode === 'staking' && (
          <CheckButton checked={slashStaking} onChange={setSlashStaking} label={t('form.blockSlash')} />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <SafeButton variant="outlined" onClick={() => setOpenDialog(false)} autoFocus>
          {t('common.cancel')}
        </SafeButton>
        <SafeButton
          color="error"
          onClick={async () => {
            try {
              await lazyApi.put(`/api/console/blocklets/${blocklet.id}/block`, {
                locale,
                blockReason: reason.trim(),
                slashStaking,
              });
              setOpenDialog(false);
            } catch (err: any) {
              const { error } = err.response?.data ?? { error: err };
              Toast.error(error);
            } finally {
              onSuccess?.();
            }
          }}>
          {t('common.block')}
        </SafeButton>
      </DialogActions>
    </Dialog>
  );
}

function UnblockDialog({
  ...props
}: ButtonProps & {
  blocklet: IBlocklet;
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
}) {
  const { blocklet, openDialog, setOpenDialog, onSuccess } = props;
  const { t, locale } = useLocaleContext();

  return (
    <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
      <DialogTitle>{t('common.enable')}</DialogTitle>
      <DialogContent>
        <Typography sx={{ cursor: 'default', mb: 1, fontWeight: 500 }}>{t('blocklet.enableDesc')}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <SafeButton variant="outlined" onClick={() => setOpenDialog(false)} autoFocus>
          {t('common.cancel')}
        </SafeButton>
        <SafeButton
          color="success"
          onClick={async () => {
            try {
              await lazyApi.put(`/api/console/blocklets/${blocklet.id}/unblock`, {
                locale,
              });
              setOpenDialog(false);
            } catch (err: any) {
              const { error } = err.response?.data ?? { error: err };
              Toast.error(error);
            } finally {
              onSuccess?.();
            }
          }}>
          {t('common.enable')}
        </SafeButton>
      </DialogActions>
    </Dialog>
  );
}
