import Button from '@arcblock/ux/lib/Button';
import Dialog from '@arcblock/ux/lib/Dialog';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Toast from '@arcblock/ux/lib/Toast';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useLockFn, useReactive } from 'ahooks';
import ISO6391 from 'iso-639-1';
import PropTypes from 'prop-types';
import { useCallback, useImperativeHandle, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import api from '../../libs/api';
import { getDisplayLabel, getDisplayPlaceholder, getEditLocales } from '../../libs/category';
import { debounceValidate } from '../../libs/util';

function CategoryDialog({ ref = null }) {
  const dataTmp = {
    isEdit: false,
    open: false,
    loading: false,
    locales: {},
    onConfirm: () => {},
  };

  const { languages } = window.blocklet;
  const { t } = useLocaleContext();

  const state = useReactive({ ...dataTmp });

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
  });

  const handleClose = useCallback(() => {
    state.open = false;
  }, [state]);

  useImperativeHandle(ref, () => ({
    open: ({ onConfirm = () => undefined } = {}) => {
      Object.assign(state, dataTmp, { open: true, onConfirm });
      reset();
    },
    edit: ({ locales = {} } = {}, onConfirm = () => undefined) => {
      const finalLocales = getEditLocales(locales, languages);
      Object.assign(state, dataTmp, {
        locales: finalLocales,
        open: true,
        onConfirm,
        isEdit: true,
      });
      reset();
      Object.keys(finalLocales).forEach((key) => {
        setValue(key, locales[key]);
      });
    },
    close: handleClose,
  }));

  const checkLocaleNotExist = useMemo(
    () =>
      debounceValidate(async ({ localeBy, localeValue } = {}) => {
        const { data } = await api.get('/api/console/categories/isLocaleExist', { params: { localeBy, localeValue } });
        return !data.result;
      }),
    []
  );

  const onSubmit = useLockFn(async (formValues) => {
    try {
      state.loading = true;
      await state.onConfirm({ locales: { ...formValues } });
      Toast.success(t('form.createSuccess'));
    } catch (err) {
      const { error } = err.response.data;
      Toast.error(error);
    } finally {
      state.loading = false;
      handleClose();
    }
  });

  async function validLocale(raw, type) {
    const value = raw.trim();
    const params = { localeBy: type, localeValue: value };
    const isCheckExist = !state.isEdit || state.locales[type] !== raw;
    if (!value) {
      return t('form.required', { name: t('form.name') });
    }
    // 新增时 校验，或者只有 变动了才校验是否重复
    if (isCheckExist && !(await checkLocaleNotExist(params))) {
      return t('form.exist', { name: t('form.name') });
    }

    return true;
  }

  return (
    <Dialog
      title={
        state.isEdit ? t('form.edit', { name: t('form.category') }) : t('form.create', { name: t('form.category') })
      }
      fullWidth
      open={state.open}
      onClose={handleClose}
      actions={
        <Button
          data-cy="confirm"
          loading={state.loading}
          onClick={handleSubmit(onSubmit)}
          color="primary"
          autoFocus
          variant="contained">
          {t('common.confirm')}
        </Button>
      }>
      <Typography variant="subtitle1" gutterBottom>
        {t('category.dialogTips')}
      </Typography>
      <form noValidate autoComplete="off">
        {state.isEdit
          ? Object.keys(state.locales).map((key) => {
              const localeName = ISO6391.getName(key);
              return (
                <Controller
                  name={key}
                  control={control}
                  rules={{
                    maxLength: {
                      value: 40,
                      message: t('form.max', { length: 40 }),
                    },
                    validate: (raw = '') => validLocale(raw, key),
                  }}
                  key={key}
                  render={({ field }) => (
                    <CategoryInput
                      inputProps={{
                        'data-cy': `category-${localeName}-name`,
                      }}
                      field={field}
                      placeholder={getDisplayPlaceholder(localeName)}
                      label={getDisplayLabel(localeName)}
                      error={!!errors[key]?.message}
                      helperText={errors[key]?.message || ' '}
                    />
                  )}
                />
              );
            })
          : languages.map((language) => {
              return (
                <Controller
                  name={language.code}
                  control={control}
                  rules={{
                    maxLength: {
                      value: 40,
                      message: t('form.max', { length: 40 }),
                    },
                    validate: (raw = '') => validLocale(raw, language.code),
                  }}
                  key={language.code}
                  render={({ field }) => (
                    <CategoryInput
                      inputProps={{
                        'data-cy': `category-${language.name}-name`,
                      }}
                      field={field}
                      placeholder={getDisplayPlaceholder(language.name)}
                      label={getDisplayLabel(language.name)}
                      error={!!errors[language.code]?.message}
                      helperText={errors[language.code]?.message || ' '}
                    />
                  )}
                />
              );
            })}
      </form>
    </Dialog>
  );
}

CategoryDialog.propTypes = {
  ref: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
};

function CategoryInput({ field, ...rest }) {
  return <TextField fullWidth multiline minRows={1} variant="outlined" margin="normal" {...rest} {...field} />;
}

CategoryInput.propTypes = {
  field: PropTypes.object.isRequired,
};

export default CategoryDialog;
