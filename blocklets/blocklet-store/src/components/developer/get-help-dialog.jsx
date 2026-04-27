import { useCallback, useContext, useImperativeHandle } from 'react';
import { useReactive } from 'ahooks';
import Dialog from '@arcblock/ux/lib/Dialog';
import Button from '@arcblock/ux/lib/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import PropTypes from 'prop-types';
import { NoneBlocklet, ExistBlocklet } from './what-next';

function GetHelpDialog({ ref = null }) {
  const dataTmp = {
    open: false,
    name: '',
  };

  const { t } = useContext(LocaleContext);
  const state = useReactive({ ...dataTmp });

  const handleClose = useCallback(() => {
    state.open = false;
  }, [state]);
  const handleSubmit = useCallback(() => {
    handleClose();
  }, [handleClose]);

  useImperativeHandle(ref, () => ({
    open: (data = {}) => {
      Object.assign(state, dataTmp, { ...data, open: true });
    },
  }));

  return (
    <Dialog
      title={t('form.solution')}
      fullWidth
      open={state.open}
      onClose={handleClose}
      actions={
        <Button onClick={handleSubmit} color="primary" autoFocus variant="contained">
          {t('common.confirm')}
        </Button>
      }>
      <Box>
        <Typography variant="h6" gutterBottom>
          {t('blocklet.helpWithNoneBlocklet')}
        </Typography>
        <NoneBlocklet name={state.name} did={state.did} />
        <Typography variant="h6" gutterBottom style={{ marginTop: '16px' }}>
          {t('blocklet.helpWithBlocklet')}
        </Typography>
        <ExistBlocklet />
      </Box>
    </Dialog>
  );
}

GetHelpDialog.propTypes = {
  ref: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
};

export default GetHelpDialog;
