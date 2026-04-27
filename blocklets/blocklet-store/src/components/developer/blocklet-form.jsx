import { useContext, useImperativeHandle, useMemo, useRef } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import PropTypes from 'prop-types';
import Toast from '@arcblock/ux/lib/Toast';
import { Controller, useForm } from 'react-hook-form';
import { validateName } from '@blocklet/meta/lib/name';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';

import api from '../../libs/api';
import { debounceValidate } from '../../libs/util';
import AuthDialog from '../auth-dialog';

const PUBLIC = 'Public';
const PRIVATE = 'Private';

function BlockletForm({ ref = null, ...props }) {
  const { t, locale } = useContext(LocaleContext);
  const { state } = props;
  const permissionsList = useMemo(() => {
    return [
      {
        label: t('blocklet.public'),
        tips: t('blocklet.publicDesc'),
        value: PUBLIC,
      },
      {
        label: t('blocklet.private'),
        tips: t('blocklet.privateDesc'),
        value: PRIVATE,
      },
    ];
  }, [t]);
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
      remark: '',
      permission: PUBLIC,
    },
  });
  const authDialog = useRef(null);

  const editSubmit = async (formValues) => {
    try {
      state.loading = true;
      await state.onConfirm(formValues);
      Toast.success(t('form.submitSuccess'));
    } catch (err) {
      const { error } = err.response.data;
      Toast.error(error);
    } finally {
      state.loading = false;
      state.open = false;
    }
  };

  function getDid(monikers) {
    return new Promise((resolve) => {
      authDialog.current.open({
        action: 'gen-key-pair',
        messages: {
          title: t('auth.createBlocklet'),
          scan: t('auth.createBlockletScan'),
          confirm: t('auth.confirm'),
        },
        params: {
          monikers,
        },
        onSuccessAuth: (response) => {
          const [{ address, publicKey }] = response.config;
          resolve({ address, publicKey });
        },
        countdownForSuccess: 3,
      });
    });
  }
  const addSubmit = async (formValues) => {
    const { address } = await getDid(formValues.name);

    try {
      state.loading = true;
      await api.post(
        '/api/developer/blocklets',
        {
          ...formValues,
          did: address,
        },
        {
          headers: {
            'x-locale': locale,
          },
        }
      );
    } catch (err) {
      const { error } = err.response.data;
      state.open = false;
      Toast.error(error);
    } finally {
      state.name = formValues.name;
      state.did = address;
      state.loading = false;
    }
  };

  // 新增 和 编辑时执行不同的 Submit 函数
  const onSubmit = async (formValues) => {
    if (state.isEdit) {
      await editSubmit(formValues);
      return;
    }
    await addSubmit(formValues);
  };

  useImperativeHandle(ref, () => ({
    onSubmit: handleSubmit(onSubmit),
    edit: ({ meta = {}, remark = '', permission } = {}) => {
      reset();
      setValue('name', meta?.name);
      setValue('remark', remark);
      setValue('permission', permission);
    },
  }));

  // 必须使用 useMemo 将函数进行缓存，否则页面 rerender 会造成函数重新赋值，这样会丢失 debounce 的效果
  const checkNameNotExist = useMemo(() => {
    return debounceValidate(async (name, cancel = false) => {
      if (cancel) return true;
      const { data } = await api.get('/api/developer/blocklets/isNameExist', { params: { name } });
      return !data.result;
    });
  }, []);
  async function validName(raw) {
    const value = raw?.trim();
    // edit mode don't need check name validate
    if (state.isEdit) {
      return true;
    }
    if (!value) {
      if (!state.isEdit) await checkNameNotExist(value, true);
      return t('form.required', { name: t('form.name') });
    }
    try {
      validateName(value);
    } catch (error) {
      return error.message;
    }
    if (!state.isEdit && !(await checkNameNotExist(value))) {
      return t('form.exist', { name: t('form.name') });
    }

    return true;
  }
  function validRemark(raw) {
    const value = raw?.trim();
    if (!value) return true;
    if (value.length > 100) {
      return t('form.noLongerThan', {
        name: t('form.remark'),
        number: 100,
      });
    }

    return true;
  }
  return (
    <>
      <form noValidate autoComplete="off">
        <Controller
          name="name"
          control={control}
          rules={{ validate: validName }}
          render={({ field }) => (
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              placeholder={t('form.namePlaceholder', { name: 'Blocklet' })}
              label={t('form.name')}
              disabled={state.isEdit}
              error={!!errors?.name?.message}
              helperText={errors?.name?.message || ' '}
              {...field}
            />
          )}
        />
        <Controller
          name="permission"
          control={control}
          render={({ field }) => (
            <TextField
              fullWidth
              variant="outlined"
              select
              margin="normal"
              label={t('blocklet.permission')}
              disabled={state.loading}
              error={!!errors?.name?.message}
              helperText={permissionsList.find((item) => item.value === field.value)?.tips || ' '}
              {...field}>
              {permissionsList.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          name="remark"
          control={control}
          rules={{ validate: validRemark }}
          render={({ field }) => (
            <TextField
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              margin="normal"
              placeholder={t('form.remarkPlaceholder', { name: 'Blocklet' })}
              label={t('form.remark')}
              error={!!errors?.remark?.message}
              helperText={errors?.remark?.message || ' '}
              {...field}
            />
          )}
        />
      </form>
      <AuthDialog ref={authDialog} />
    </>
  );
}
BlockletForm.propTypes = {
  ref: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
  state: PropTypes.object.isRequired,
};
export default BlockletForm;
