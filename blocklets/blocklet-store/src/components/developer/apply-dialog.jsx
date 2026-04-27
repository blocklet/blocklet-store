import Button from '@arcblock/ux/lib/Button';
import Dialog from '@arcblock/ux/lib/Dialog';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import Toast from '@arcblock/ux/lib/Toast';
import TextField from '@mui/material/TextField';
import { useReactive } from 'ahooks';
import PropTypes from 'prop-types';
import { useCallback, useContext, useImperativeHandle } from 'react';
import { Controller, useForm } from 'react-hook-form';

import api from '../../libs/api';

function ApplyDialog({
  ref = null,
  onConfirm = (cb = () => {}) => {
    cb();
  },
}) {
  const dataTmpl = {
    open: false,
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
      setValue('remark', data.remark || '');
    },
    close: handleClose,
  }));

  async function onApply(formData) {
    const { data } = await api.post('/api/developer/applies', formData);
    return data;
  }
  async function onSubmit(formvalues) {
    try {
      const res = await onApply(formvalues);
      Toast.success(t('common.success'));
      onConfirm(res);
      handleClose();
    } catch (err) {
      const { error } = err.response.data;
      Toast.error(error);
    }
  }

  function validRemark(raw) {
    const value = raw.trim();
    if (!value) return t('form.required', { name: t('form.remark') });
    if (value.length > 100) {
      return t('form.noLongerThan', {
        name: t('form.remark'),
        number: 100,
      });
    }

    return true;
  }

  return (
    <Dialog
      title={t('developer.apply.title')}
      fullWidth
      open={state.open}
      onClose={handleClose}
      actions={
        <Button onClick={handleSubmit(onSubmit)} color="primary" autoFocus variant="contained" data-cy="apply-confirm">
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
              multiline
              rows={3}
              variant="outlined"
              margin="normal"
              placeholder={t('developer.apply.reason')}
              label={t('form.remark')}
              data-cy="apply-reason"
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

ApplyDialog.propTypes = {
  ref: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
  onConfirm: PropTypes.func,
};

export default ApplyDialog;
