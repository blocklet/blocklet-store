import { decodeConnectUrl, parseTokenFromConnectUrl } from '@arcblock/did-connect-react/lib/utils';
import Center from '@arcblock/ux/lib/Center';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import Result from '@arcblock/ux/lib/Result';
import { getMaster } from '@arcblock/ux/lib/Util/federated';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material';
import { useMemoizedFn, useReactive } from 'ahooks';
import DOMPurify from 'dompurify';
import { useContext, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FullPage from '../../components/layout/full-page';
import { useSessionContext } from '../../contexts/session';
import useWindowClose from '../../hooks/use-window-close';
import api from '../../libs/api';

function ConnectTips() {
  const { t } = useContext(LocaleContext);

  const { permissionMode, passportStakeAmount, publishStakeAmount } = window.blocklet?.preferences || {};

  const notes = [];
  if (permissionMode === 'staking') {
    notes.push(t('didConnect.connectStudio.passportStaking', { amount: passportStakeAmount }));
    notes.push(t('didConnect.connectStudio.blockletStaking', { amount: publishStakeAmount }));
  } else {
    notes.push(t('didConnect.connectStudio.passportInvite', { amount: passportStakeAmount }));
    notes.push(t('didConnect.connectStudio.blockletInvite', { amount: publishStakeAmount }));
  }
  notes.push(
    t('didConnect.connectStudio.agreeToPolicy', {
      terms: `<a href="https://www.arcblock.io/content/docs/blocklet-store/en/developer-policies" target="_blank">${t(
        'terms.program'
      ).toLowerCase()}</a>`,
    })
  );

  return (
    <Alert icon={false} severity="info" variant="outlined">
      <Typography sx={{ color: 'InfoText' }} gutterBottom>
        {t('didConnect.connectStudio.notes')}
      </Typography>
      <Typography component="ul" sx={{ m: 0, p: 0, paddingInlineStart: '18px' }}>
        {notes.map((x, i) => (
          <Typography
            // eslint-disable-next-line react/no-array-index-key
            key={`notes-${i}`}
            component="li"
            sx={{ fontSize: '0.9rem' }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(x) }}
          />
        ))}
      </Typography>
    </Alert>
  );
}

export default function ConnectStudio() {
  const navigate = useNavigate();
  const windowClose = useWindowClose();
  const containerRef = useRef(null);
  const { t, locale } = useContext(LocaleContext);
  const { connectApi } = useSessionContext();
  const theme = useTheme();
  const [params] = useSearchParams();
  const currentState = useReactive({
    ready: false,
    success: false,
    error: null,
    invalidSession: false,
  });
  const master = getMaster();

  const monikers = useMemo(() => {
    const connectUrl = new URL(window.location.href).searchParams.get('__connect_url__');
    const decoded = decodeConnectUrl(connectUrl);
    const connectUrlObj = new URL(decoded);
    return connectUrlObj.searchParams.get('monikers');
  }, []);

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

  useEffect(() => {
    if (containerRef.current && currentState.ready) {
      connectApi.open({
        locale,
        containerEl: containerRef.current,
        action: 'gen-key-pair',
        extraParams: {
          sourceAppPid: master?.appPid,
          forceSwitch: true,
          monikers,
        },
        checkFn: api.get,
        saveConnect: false,
        forceConnected: false,
        className: 'connect',
        extraContent: <ConnectTips />,
        popup: false,
        messages: {
          title: t('didConnect.connectStudio.title'),
          scan: t('didConnect.connectStudio.scan'),
          confirm: t('auth.confirm'),
          success: t('didConnect.connectStudio.success'),
        },

        onSuccess: handleSuccess,
        onError: handleError,
      });
    }
  }, [connectApi, currentState.ready, handleError, handleSuccess, locale, master?.appPid, t, monikers]);

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
    if (params.has('closeOnSuccess')) {
      windowClose();
    }
    return (
      <FullPage>
        <Result
          style={{ backgroundColor: 'transparent' }}
          status="info"
          icon={<CheckCircleIcon style={{ color: theme.palette.success.main, fontSize: 72 }} />}
          title={t('didConnect.connectStudio.success')}
          description={t('didConnect.connectStudio.successDesc')}
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
