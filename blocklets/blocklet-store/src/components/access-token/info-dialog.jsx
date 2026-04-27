import { useContext, useImperativeHandle, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useReactive } from 'ahooks';
import Dialog from '@arcblock/ux/lib/Dialog';
import Button from '@arcblock/ux/lib/Button';

import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import AccessTokenInfo from './info';

function AccessTokenInfoDialog({ ref = null, onConfirm = () => {} }) {
  const dataTmp = {
    open: false,
    read: false,
    hideAccessToken: true,
    saveTokenTip: true,
    showSecretKey: true,
    id: '',
    secretKey: '',
    loading: false,
  };
  const state = useReactive(dataTmp);

  const handleClose = useCallback(() => {
    state.open = false;
  }, [state]);
  const handleConfirm = useCallback(async () => {
    state.loading = true;
    await onConfirm();
    state.open = false;
  }, [onConfirm, state]);

  useImperativeHandle(ref, () => ({
    open: (data) => {
      Object.assign(state, dataTmp, data, { open: true });
    },
    close: handleClose,
  }));

  const { t } = useContext(LocaleContext);

  return (
    <Dialog
      title={t('common.createSuccess')}
      fullWidth
      open={state.open}
      disableEscapeKeyDown
      onClose={handleClose}
      showCloseButton={false}
      actions={
        <Button
          loading={state.loading}
          disabled={!state.read}
          onClick={handleConfirm}
          color="primary"
          autoFocus
          data-cy="confirm"
          variant="contained">
          {t('common.confirm')}
        </Button>
      }>
      <AccessTokenInfo state={state} />
    </Dialog>
  );
}

AccessTokenInfoDialog.propTypes = {
  ref: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
  onConfirm: PropTypes.func,
};

export default AccessTokenInfoDialog;
