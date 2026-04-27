import Button from '@arcblock/ux/lib/Button';
import Dialog from '@arcblock/ux/lib/Dialog';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import Toast from '@arcblock/ux/lib/Toast';
import TextField from '@mui/material/TextField';
import { useLockFn, useReactive } from 'ahooks';
import PropTypes from 'prop-types';
import { useCallback, useContext, useImperativeHandle } from 'react';
import { Controller, useForm } from 'react-hook-form';

import api from '../../libs/api';

function AccessTokenFormDialog({
  ref = null,
  onConfirm = (cb = () => {}) => {
    cb();
  },
}) {
  const dataTmpl = {
    open: false,
    loading: false,
  };
  const { t } = useContext(LocaleContext);

  const state = useReactive(dataTmpl);

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ mode: 'onChange', defaultValues: { remark: '' } });

  const handleClose = useCallback(() => {
    state.open = false;
  }, [state]);

  useImperativeHandle(ref, () => ({
    open: (data = {}) => {
      Object.assign(state, dataTmpl, data, { open: true });
      reset();
      setValue('remark', '');
    },
    close: handleClose,
  }));
  async function onApply(formData) {
    const { data } = await api.post('/api/developer/access-tokens', formData);
    return data;
  }

  const onSubmit = useLockFn(async (formvalues) => {
    try {
      state.loading = true;
      const res = await onApply(formvalues);
      Toast.success(t('common.success'));
      onConfirm(res);
    } catch (err) {
      const { error } = err.response.data;
      Toast.error(error);
    } finally {
      state.loading = false;
      handleClose();
    }
  });

  function validRemark(raw) {
    const value = raw.trim();
    if (!value) return t('form.required', { name: t('form.remark') });
    if (value.length > 64) {
      return t('form.noLongerThan', {
        name: t('form.remark'),
        number: 64,
      });
    }

    return true;
  }

  return (
    <Dialog
      title={t('form.create', { name: t('common.accessToken') })}
      fullWidth
      open={state.open}
      onClose={handleClose}
      actions={
        <Button
          loading={state.loading}
          onClick={handleSubmit(onSubmit)}
          color="primary"
          autoFocus
          variant="contained"
          data-cy="access-token-submit">
          {t('common.confirm')}
        </Button>
      }>
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="remark"
          control={control}
          rules={{ validate: validRemark }}
          render={({ field }) => (
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              placeholder={t('form.remarkPlaceholder', { name: t('common.accessToken') })}
              label={t('form.remark')}
              data-cy="access-token-remark"
              error={!!errors?.remark?.message}
              helperText={errors?.remark?.message || ' '}
              {...field}
            />
          )}
        />
      </form>
    </Dialog>
  );
}

AccessTokenFormDialog.propTypes = {
  ref: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
  children: PropTypes.any,
  onConfirm: PropTypes.func,
};

export default AccessTokenFormDialog;
