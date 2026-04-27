import { decodeConnectUrl, parseTokenFromConnectUrl } from '@arcblock/did-connect-react/lib/utils';
import Center from '@arcblock/ux/lib/Center';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import Result from '@arcblock/ux/lib/Result';
import { getMaster } from '@arcblock/ux/lib/Util/federated';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeIcon from '@mui/icons-material/Home';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material';
import { useMemoizedFn, useReactive } from 'ahooks';
import { useContext, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSessionContext } from '../../contexts/session';
import useWindowClose from '../../hooks/use-window-close';
import api from '../../libs/api';

import FullPage from '../../components/layout/full-page';

class NoDeveloperNFTError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'NoDeveloperNFTError';
  }
}

/**
 * 该页面用于配合 `blocklet connect` 命令, 以优化 accessToken/store/developerDid 配置流程
 */
function ConnectCli() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { t, locale } = useContext(LocaleContext);
  const { connectApi } = useSessionContext();
  const [params] = useSearchParams();
  const theme = useTheme();
  const windowClose = useWindowClose();
  const currentState = useReactive({
    ready: false,
    success: false,
    error: null,
    invalidSession: false,
  });

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
    if (err.message === 'You have no legal developerNFT') {
      currentState.error = new NoDeveloperNFTError();
    } else {
      currentState.error = err.message;
    }
    window.opener?.postMessage(
      {
        type: 'connect-store-message',
        error: currentState.error,
      },
      '*'
    );
    navigate('#invalid', { replace: true });
  });

  const handleSuccess = useMemoizedFn(() => {
    window.opener?.postMessage({ type: 'connect-store-message', success: true }, '*');
    currentState.success = true;
  });
  const master = getMaster();
  const source = params.get('source') || 'Blocklet CLI';

  useEffect(() => {
    if (containerRef.current && currentState.ready) {
      connectApi.open({
        locale,
        containerEl: containerRef.current,
        action: 'connect-cli',
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
          title: t('connectCli.title', { source }),
          scan: t('connectCli.scan', { source }),
          confirm: t('auth.confirm'),
          success: t('connectCli.success', { source }),
        },

        onSuccess: handleSuccess,
        onError: handleError,
      });
    }
  }, [connectApi, currentState.ready, handleError, handleSuccess, locale, master?.appPid, t, source]);

  const homeElement = (
    <Button
      variant="outlined"
      color="primary"
      size="small"
      startIcon={<HomeIcon />}
      href="/"
      style={{ borderRadius: 4 }}>
      {t('connectCli.home')}
    </Button>
  );

  if (currentState.invalidSession) {
    return (
      <FullPage>
        <Result
          style={{ backgroundColor: 'transparent' }}
          status="error"
          title={t('connectCli.invalidSession')}
          description={t('connectCli.invalidSessionDesc')}
          extra={homeElement}
        />
      </FullPage>
    );
  }

  if (currentState.error) {
    let description = currentState.error;
    let extra = homeElement;
    if (currentState.error instanceof NoDeveloperNFTError) {
      description = t('connectCli.developerRequired');
      extra = (
        <Box>
          {homeElement}
          <Button
            variant="contained"
            color="primary"
            size="small"
            href="/developer/registration"
            endIcon={<ArrowForwardIcon />}
            style={{ marginLeft: 16, borderRadius: 4 }}>
            {t('connectCli.register')}
          </Button>
        </Box>
      );
    }
    return (
      <FullPage>
        <Result
          style={{ backgroundColor: 'transparent' }}
          status="error"
          title={t('connectCli.connectionError')}
          description={description}
          extra={extra}
        />
      </FullPage>
    );
  }

  if (currentState.success) {
    if (params.has('closeOnSuccess')) {
      windowClose();
    }
    return (
      <FullPage key="success">
        <Result
          style={{ backgroundColor: 'transparent' }}
          status="info"
          icon={<CheckCircleIcon style={{ color: theme.palette.success.main, fontSize: 72 }} />}
          title={t('connectCli.success', { source })}
          description={t('connectCli.successDesc', { source })}
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

export default ConnectCli;
