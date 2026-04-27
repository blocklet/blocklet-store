import { decodeConnectUrl, parseTokenFromConnectUrl } from '@arcblock/did-connect-react/lib/utils';
import Center from '@arcblock/ux/lib/Center';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import Result from '@arcblock/ux/lib/Result';
import { getMaster } from '@arcblock/ux/lib/Util/federated';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material';
import { useMemoizedFn, useReactive } from 'ahooks';
import { useContext, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionContext } from '../../contexts/session';
import api from '../../libs/api';

import FullPage from '../../components/layout/full-page';

/**
 * 该页面用于配合 `blocklet connect|init` 命令, 以优化 accessToken/store/developerDid 配置流程
 */
export default function GenKeyPair() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { t, locale } = useContext(LocaleContext);
  const { connectApi } = useSessionContext();
  const theme = useTheme();
  const currentState = useReactive({
    ready: false,
    success: false,
    error: null,
    invalidSession: false,
  });
  const master = getMaster();

  // 检查会话状态, 任何导致会话无效的情况都会在 url 附加 invalid 作为 hash (将无效会话状态记录到 url 中)
  const checkSession = () => {
    try {
      const url = new URL(window.location.href);
      if (url.hash.includes('invalid')) {
        currentState.invalidSession = true;
        return;
      }
      const connectUrl = url.searchParams.get('__connect_url__');
      const decoded = decodeConnectUrl(connectUrl);
      const token = parseTokenFromConnectUrl(decoded);
      if (!token) {
        throw new Error();
      }
      currentState.ready = true;
    } catch (e) {
      currentState.invalidSession = true;
      navigate('#invalid', { replace: true });
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => checkSession(), []);

  const handleError = useMemoizedFn((err) => {
    currentState.error = err.message;
    navigate('#invalid', { replace: true });
  });

  const handleSuccess = useMemoizedFn(() => {
    currentState.success = true;
  });

  useEffect(() => {
    if (containerRef.current && currentState.ready) {
      connectApi.open({
        locale,
        containerEl: containerRef.current,
        action: 'gen-key-pair',
        extraParams: {
          sourceAppPid: master?.appPid,
          forceSwitch: true,
        },
        checkFn: api.get,
        saveConnect: false,
        forceConnected: false,
        className: 'connect',
        popup: false,
        messages: {
          title: t('didConnect.genKeyPair.title'),
          scan: t('didConnect.genKeyPair.scan'),
          confirm: t('auth.confirm'),
          success: t('didConnect.genKeyPair.success'),
        },

        onSuccess: handleSuccess,
        onError: handleError,
      });
    }
  }, [connectApi, currentState.ready, handleError, handleSuccess, locale, master?.appPid, t]);

  if (currentState.invalidSession) {
    return (
      <FullPage>
        <Result
          style={{ backgroundColor: 'transparent' }}
          status="error"
          title={t('didConnect.common.invalidSession')}
          description={t('didConnect.common.invalidSessionDesc')}
        />
      </FullPage>
    );
  }

  if (currentState.error) {
    const description = currentState.error;
    return (
      <FullPage>
        <Result
          style={{ backgroundColor: 'transparent' }}
          status="error"
          title={t('didConnect.common.connectionError')}
          description={description}
        />
      </FullPage>
    );
  }

  if (currentState.success) {
    return (
      <FullPage>
        <Result
          style={{ backgroundColor: 'transparent' }}
          status="info"
          icon={<CheckCircleIcon style={{ color: theme.palette.success.main, fontSize: 72 }} />}
          title={t('didConnect.genKeyPair.success')}
          description={t('didConnect.genKeyPair.successDesc')}
        />
      </FullPage>
    );
  }

  if (currentState.ready) {
    return <FullPage key="ready" containerRef={containerRef} />;
  }

  return (
    <Center>
      <CircularProgress />
    </Center>
  );
}
