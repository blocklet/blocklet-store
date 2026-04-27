import DidConnect from '@arcblock/did-connect-react/lib/Connect';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Box from '@mui/material/Box';
import { useReactive } from 'ahooks';
import PropTypes from 'prop-types';
import { useEffect, useImperativeHandle } from 'react';
import api from '../libs/api';

/**
 * AuthDialog 组件 - 用于处理身份验证弹窗
 * @param {Object} props - 组件属性
 * @param {React.RefObject} [props.ref] - 组件引用，用于调用 open 和 close 方法
 * @param {React.ReactNode} props.success - 成功时显示的内容
 */
function AuthDialog({ ref = null, ...props }) {
  const { t, locale } = useLocaleContext();
  const defaultProps = {
    open: false,
    action: '',
    content: '',
    autoConnect: true,
    params: {},
    messages: {
      title: t('auth.title'),
      scan: t('auth.scan'),
      confirm: t('auth.confirm'),
    },
    onSuccessAuth: () => undefined,
    onCloseAuth: () => {
      // eslint-disable-next-line no-use-before-define
      state.open = false;
    },
    onErrorAuth: () => undefined,
  };
  const state = useReactive(defaultProps);
  useImperativeHandle(ref, () => ({
    open: (data = {}) => {
      Object.assign(state, defaultProps, data, { open: true, enableCountdownForSuccess: false });

      const originOnSuccessAuth = state.onSuccessAuth;
      state.onSuccessAuth = (...args) => {
        originOnSuccessAuth(...args);
        if (state.countdownForSuccess) {
          state.enableCountdownForSuccess = true;
        }
      };
    },
    close: () => {
      state.open = false;
    },
  }));

  useEffect(() => {
    if (state.countdownForSuccess === 0) {
      ref.current.close();
    } else if (state.countdownForSuccess > 0 && state.enableCountdownForSuccess) {
      setTimeout(() => {
        state.countdownForSuccess--;
      }, 1000);
    }
  }, [ref, state.countdownForSuccess, state.enableCountdownForSuccess]);

  return (
    <DidConnect
      popup
      open={state.open}
      action={state.action}
      checkFn={api.get}
      checkTimeout={5 * 60 * 1000}
      saveConnect={false}
      forceConnected={false}
      autoConnect={state.autoConnect}
      onSuccess={state.onSuccessAuth}
      onError={state.onErrorAuth}
      onClose={state.onCloseAuth}
      messages={{
        ...state.messages,
        success: (
          <Box>
            {props.success}
            <p>{t('auth.countdownTip', { count: state.countdownForSuccess })}</p>
          </Box>
        ),
      }}
      locale={locale}
      extraParams={state.params}
    />
  );
}

AuthDialog.propTypes = {
  ref: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
  success: PropTypes.object.isRequired,
};

export default AuthDialog;
