import { Confirm } from '@arcblock/ux/lib/Dialog';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import Typography from '@mui/material/Typography';
import { useReactive } from 'ahooks';
import PropTypes from 'prop-types';
import { useCallback, useContext, useImperativeHandle } from 'react';

function ConfirmDialog({ ref = null, customizedContent = null }) {
  const { t } = useContext(LocaleContext);

  const defaultProps = {
    open: false,
    loading: false,
    title: '',
    content: '',
    confirmText: t('common.confirm'),
    confirmColor: 'primary',
    showCancelButton: true,
    // eslint-disable-next-line require-await
    onConfirm: async () => undefined,
    // eslint-disable-next-line require-await
    onClose: async () => undefined,
  };

  const state = useReactive(defaultProps);

  const handleConfirm = useCallback(async () => {
    state.loading = true;
    await state.onConfirm();
    state.open = false;
    state.loading = false;
  }, [state]);
  const handleClose = useCallback(async () => {
    await state.onClose();
    state.open = false;
  }, [state]);

  useImperativeHandle(ref, () => ({
    open: (data = {}) => {
      Object.assign(state, defaultProps, data, {
        open: true,
        loading: false,
      });
    },
    close: handleClose,
  }));

  return (
    <Confirm
      open={state.open}
      title={state.title}
      onConfirm={handleConfirm}
      onCancel={handleClose}
      showCancelButton={state.showCancelButton}
      confirmButton={{
        text: state.confirmText,
        props: {
          loading: state.loading,
          color: state.confirmColor,
          variant: 'contained',
          'data-cy': 'confirm',
        },
      }}
      cancelButton={{ text: t('common.cancel'), props: { 'data-cy': 'cancel-button' } }}>
      {customizedContent || <Typography>{state.content}</Typography>}
    </Confirm>
  );
}

ConfirmDialog.propTypes = {
  ref: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
  customizedContent: PropTypes.element,
};

export default ConfirmDialog;
