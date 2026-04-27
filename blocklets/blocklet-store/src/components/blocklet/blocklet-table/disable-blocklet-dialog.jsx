import { useContext, useImperativeHandle, useCallback } from 'react';
import { useLockFn, useReactive } from 'ahooks';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import { useForm, Controller } from 'react-hook-form';
import PropTypes from 'prop-types';
import Toast from '@arcblock/ux/lib/Toast';
import Dialog from '@arcblock/ux/lib/Dialog';
import Button from '@arcblock/ux/lib/Button';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';

import api from '../../../libs/api';

function DisableBlockletDialog({ ref = null }) {
  const dataTmp = {
    open: false,
    loading: false,
    id: null,
    // eslint-disable-next-line require-await
    onConfirm: async () => undefined,
  };
  const { t, locale } = useContext(LocaleContext);

  const state = useReactive(dataTmp);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({ mode: 'onChange', defaultValues: { blockReason: '' } });

  const handleClose = useCallback(() => {
    state.open = false;
  }, [state]);

  useImperativeHandle(ref, () => ({
    open: (data = {}) => {
      Object.assign(state, dataTmp, data, { open: true });
      reset();
    },
    close: handleClose,
  }));

  async function handleBlock(formData) {
    const { data } = await api.put(`/api/console/blocklets/${state.id}/block`, { ...formData, locale });
    return data;
  }

  function validReason(raw) {
    const value = raw.trim();
    if (!value) return t('form.required', { name: t('form.blockReason') });
    if (value.length > 255) {
      return t('form.noLongerThan', {
        name: t('form.blockReason'),
        number: 255,
      });
    }

    return true;
  }

  const onSubmit = useLockFn(async (formValues) => {
    try {
      state.loading = true;
      await handleBlock(formValues);
      await state.onConfirm();
      Toast.success(t('common.success'));
    } catch (err) {
      const { error } = err?.response?.data ?? { error: 'unknow error' };
      Toast.error(error);
    } finally {
      state.loading = false;
      handleClose();
    }
  });

  return (
    <Dialog
      title={t('blocklet.disableAction')}
      fullWidth
      open={state.open}
      onClose={handleClose}
      actions={
        <Button
          loading={state.loading}
          onClick={handleSubmit(onSubmit)}
          color="error"
          autoFocus
          variant="contained"
          data-cy="disable-blocklet-submit">
          {t('common.block')}
        </Button>
      }>
      {t('blocklet.disableDesc')}
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="blockReason"
          control={control}
          rules={{ validate: validReason }}
          render={({ field }) => (
            <TextField
              fullWidth
              multiline
              minRows={2}
              variant="outlined"
              margin="normal"
              placeholder={t('form.blockReasonPlaceholder')}
              label={t('form.blockReason')}
              data-cy="disable-blocklet-reason"
              error={!!errors?.blockReason?.message}
              helperText={errors?.blockReason?.message || ''}
              {...field}
            />
          )}
        />
        {window.blocklet.preferences.permissionMode === 'staking' && (
          <Controller
            name="slashStaking"
            control={control}
            render={({ field }) => <FormControlLabel control={<Checkbox {...field} />} label={t('form.blockSlash')} />}
          />
        )}
      </form>
    </Dialog>
  );
}
DisableBlockletDialog.propTypes = {
  ref: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
};

export default DisableBlockletDialog;
