import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import Toast from '@arcblock/ux/lib/Toast';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useMemoizedFn } from 'ahooks';
import DOMPurify from 'dompurify';
import { useContext, useEffect, useState } from 'react';
import PageLayout from '../components/layout/page-layout';
import { useDeveloperContext } from '../contexts/developer';
import { useSessionContext } from '../contexts/session';

export default function DeveloperJoin() {
  const { isDeveloper } = useDeveloperContext();
  const { session, events, connectApi } = useSessionContext();
  const [agreed, setAgreed] = useState(false);
  const { t } = useContext(LocaleContext);

  useEffect(() => {
    events.on('login', () => {
      session.refresh();
    });
  }, []); // eslint-disable-line

  const handleConnected = (result) => {
    if (result?.user?.approved === false) {
      Toast.error('Your access to this store has been revoked');
      return;
    }

    connectApi.open({
      action: 'stake-and-join',
      messages: {
        title: t('auth.developerJoin'),
        scan: t('auth.developerJoinScan'),
        confirm: t('auth.confirm'),
      },
      onSuccess: () => {
        window.location.reload();
      },
    });
  };

  // 使用 useCallback 需要关注 deps，可以改成 useMemoizedFn 或者直接不用
  const handleApply = useMemoizedFn(() => {
    if (!agreed) {
      Toast.error('Please agree to the terms and conditions');
      return;
    }
    if (session.user) {
      handleConnected(session);
    } else {
      session.login((__unused1, __unused2, result) => handleConnected(result));
    }
  });

  const handleAgreed = (e) => {
    setAgreed(e.target.checked);
  };

  return (
    <PageLayout>
      <Box
        sx={{
          width: '100%',
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
        }}>
        <Typography
          variant="h4"
          gutterBottom
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(t('auth.developerTitle', { appName: window.blocklet.appName })),
          }}
        />
        <Typography variant="body1" sx={{ mb: 3 }}>
          {t('user.benefits')}
          <Link
            href="https://www.arcblock.io/content/docs/blocklet-developer/en/welcome"
            target="_blank"
            sx={{
              ml: 0.5,
            }}>
            {t('common.more')}
          </Link>
        </Typography>
        <Box
          sx={{ width: '100%', maxWidth: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'start',
              p: 2,
              border: '1px solid lightgray',
              borderRadius: 1,
            }}>
            <Typography variant="h6" gutterBottom>
              {t('terms.all')}
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>
                <Link href="https://www.arcblock.io/en/termsofuse" target="_blank">
                  {t('terms.agreement')}
                </Link>
              </li>
              <li>
                <Link href="https://www.arcblock.io/en/privacy" target="_blank">
                  {t('terms.privacy')}
                </Link>
              </li>
              <li>
                <Link href="https://www.arcblock.io/content/docs/blocklet-store/en/developer-policies" target="_blank">
                  {t('terms.program')}
                </Link>
              </li>
            </ul>
          </Box>
          {!isDeveloper && (
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'start',
                p: 2,
                border: '1px solid lightgray',
                borderRadius: 1,
                mt: 2,
              }}>
              <Typography variant="h6" gutterBottom>
                {t('auth.developerJoinScan', {
                  amount: window.blocklet.preferences.passportStakeAmount,
                  amountLabel: window.blocklet.preferences.passportStakeCurrency || 'ABT',
                })}
              </Typography>
              <FormControlLabel control={<Checkbox onChange={handleAgreed} />} label={t('auth.developerAgree')} />
              <Button variant="contained" disabled={!agreed} onClick={handleApply} sx={{ mt: 1 }}>
                {t('auth.developerJoin')}
              </Button>
            </Box>
          )}
          {isDeveloper && (
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'start',
                p: 2,
                border: '1px solid lightgray',
                borderRadius: 1,
                mt: 2,
              }}>
              <Typography variant="h6" gutterBottom>
                {t('user.alreadyDeveloper')}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {t('user.alreadyDeveloperDesc')}
              </Typography>
              <Button
                component={Link}
                variant="outlined"
                color="primary"
                href="/.well-known/service/lost-passport"
                sx={{ mt: 1 }}>
                {t('lostPassport.title')}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </PageLayout>
  );
}

DeveloperJoin.propTypes = {};
