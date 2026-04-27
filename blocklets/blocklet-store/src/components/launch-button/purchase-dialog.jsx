import Toast from '@arcblock/ux/lib/Toast';
import { CheckoutForm, PaymentProvider } from '@blocklet/payment-react';
import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import Dialog from '@arcblock/ux/lib/Dialog';
import IconPurchase from '@mui/icons-material/ShoppingCart';
import IconVerify from '@mui/icons-material/VerifiedUser';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useMemoizedFn, useReactive } from 'ahooks';

import Button from '@arcblock/ux/lib/Button';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';

import { useSessionContext } from '../../contexts/session';
import { useProtectLogin } from '../../hooks/protect';
import api from '../../libs/api';
import { getLaunchAddress } from '../../libs/util';

const Transition = function Transition({ ref = null, ...props }) {
  return <Slide direction="up" ref={ref} {...props} />;
};

Transition.propTypes = {
  ref: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
};

function PurchaseDialog({ meta, onCancel }) {
  const { t, locale } = useLocaleContext() || {};
  const { session, connectApi } = useSessionContext();
  const location = useLocation();
  const dataTmp = {
    action: '',
    step: 1,
    loading: false,
    transactions: [],
  };
  const state = useReactive({ ...dataTmp });
  const theme = useTheme();
  const { isProtected: hasLogin } = useProtectLogin();
  const launchAddress = getLaunchAddress(meta.did, location, locale);

  const onSelect = (act) => {
    if (act === state.action) {
      return;
    }
    state.action = act;
  };

  const onNext = () => {
    if (!state.action) {
      return;
    }
    state.step = 2;
    if (state.action === 'verify') {
      window.location.href = launchAddress;
    }
  };

  const handleClose = (e, reason) => {
    if (reason === 'backdropClick') return;
    onCancel();
  };
  const queryPaymentInfo = useMemoizedFn(async () => {
    state.loading = true;
    try {
      const params = { nftFactory: meta.nftFactory, userDid: session.user.did };
      const { data: totalTx } = await api.get('/api/blocklets/purchased', { params });
      if (totalTx > 0) {
        state.action = 'verify';
      }
    } catch (err) {
      const { error } = err.response.data;
      Toast.error(error);
      handleClose();
    } finally {
      state.loading = false;
    }
  });

  const options = [
    {
      action: 'purchase',
      title: t('purchase.purchase.title'),
      description: t('purchase.purchase.description'),
    },
    {
      action: 'verify',
      title: t('purchase.verify.title'),
      description: t('purchase.verify.description'),
    },
  ];
  useEffect(() => {
    if (hasLogin) {
      queryPaymentInfo();
    }
  }, [hasLogin, queryPaymentInfo]);

  let content = null;
  if (state.loading) {
    content = (
      <Box
        sx={{
          minHeight: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <CircularProgress />
      </Box>
    );
  } else {
    content = (
      <List>
        {options.map((x) => (
          <ListItem
            button
            key={x.action}
            selected={state.action === x.action}
            onClick={() => onSelect(x.action)}
            data-cy={`purchase-${x.action}`}>
            <ListItemIcon style={{ minWidth: 48 }}>
              {x.action === 'purchase' ? (
                <IconPurchase
                  style={{ color: state.action === 'purchase' ? theme.palette.primary.main : '#AAA', fontSize: 32 }}
                />
              ) : (
                <IconVerify
                  style={{ color: state.action === 'verify' ? theme.palette.primary.main : '#AAA', fontSize: 32 }}
                />
              )}
            </ListItemIcon>
            <ListItemText primary={x.title} secondary={x.description} />
          </ListItem>
        ))}
      </List>
    );
  }

  if (state.action === 'purchase' && state.step === 2) {
    return (
      <Dialog
        title={t('purchase.title')}
        Transition={Transition}
        disableEscapeKeyDown
        open
        fullWidth
        maxWidth="md"
        onClose={handleClose}>
        <Box sx={{ padding: 4, paddingTop: 0 }}>
          <PaymentProvider session={session} connect={connectApi}>
            <CheckoutForm
              theme={theme}
              id={meta?.pricing?.linkId}
              extraParams={{
                blockletDid: meta.did,
                version: meta.currentVersion?.version || '',
              }}
              mode="inline"
            />
          </PaymentProvider>
        </Box>
      </Dialog>
    );
  }

  return (
    <Dialog title={t('purchase.title')} disableEscapeKeyDown open fullWidth onClose={handleClose}>
      <div style={{ marginBottom: 16 }}>
        {content}
        <Button
          disabled={!state.action}
          fullWidth
          variant="contained"
          data-cy="purchase-next"
          color="primary"
          style={{ marginTop: 16 }}
          onClick={onNext}>
          {!state.action ? t('common.pleaseSelect') : t('common.next')}
        </Button>
      </div>
    </Dialog>
  );
}

PurchaseDialog.propTypes = {
  meta: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default PurchaseDialog;
