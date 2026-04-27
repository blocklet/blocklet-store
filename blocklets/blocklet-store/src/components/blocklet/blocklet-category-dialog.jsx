import PropTypes from 'prop-types';
import Button from '@arcblock/ux/lib/Button';
import Dialog from '@arcblock/ux/lib/Dialog';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import Toast from '@arcblock/ux/lib/Toast';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useLockFn, useReactive } from 'ahooks';
import { useCallback, useContext, useImperativeHandle } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { lazyApi } from '../../libs/api';
import { getDisplayLocale } from '../../libs/category';

function BlockletCategoryDialog({ ref = null }) {
  const dataTmp = {
    isEdit: false,
    open: false,
    loading: false,
    categoryList: [],
    onConfirm: () => {},
  };

  const { t, locale } = useContext(LocaleContext);

  const state = useReactive({ ...dataTmp });

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      category: '',
    },
  });

  const handleClose = useCallback(() => {
    state.open = false;
  }, [state]);

  useImperativeHandle(ref, () => ({
    edit: async ({ meta = {}, category = {} } = {}, onConfirm = () => undefined) => {
      Object.assign(state, dataTmp, {
        loading: true,
        open: true,
        isEdit: true,
      });
      const { data } = await lazyApi.get('/api/blocklets/categories');
      Object.assign(state, {
        categoryList: data || [],
        loading: false,
        onConfirm,
      });
      reset();
      setValue('name', meta.name);
      setValue('category', category?._id);
    },
    close: handleClose,
  }));

  const onSubmit = useLockFn(async (formValues) => {
    try {
      state.loading = true;
      await state.onConfirm({ category: formValues.category });
      Toast.success(t('form.submitSuccess'));
    } catch (err) {
      const { error } = err.response.data;
      Toast.error(error);
    } finally {
      state.loading = false;
      handleClose();
    }
  });

  return (
    <Dialog
      data-cy="category-dialog"
      title={state.isEdit ? t('form.edit', { name: 'Blocklet' }) : t('form.create', { name: 'Blocklet' })}
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
          data-cy="confirm">
          {t('common.confirm')}
        </Button>
      }>
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              placeholder={t('form.namePlaceholder', { name: 'Blocklet' })}
              label={t('form.name')}
              disabled
              {...field}
            />
          )}
        />
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <TextField
              data-cy="select-category"
              fullWidth
              variant="outlined"
              select
              margin="normal"
              placeholder={t('form.namePlaceholder', { name: t('form.category') })}
              label={t('form.category')}
              disabled={state.loading}
              error={!!errors?.name?.message}
              {...field}>
              {state.categoryList.map((item) => {
                const displayLocale = getDisplayLocale(item.locales, locale);
                return (
                  <MenuItem data-cy="category-option" key={item._id} value={item._id}>
                    {displayLocale}
                  </MenuItem>
                );
              })}
            </TextField>
          )}
        />
      </form>
    </Dialog>
  );
}

BlockletCategoryDialog.propTypes = {
  ref: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
};

export default BlockletCategoryDialog;
