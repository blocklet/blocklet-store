import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { CheckoutDonate, DonateProvider, PaymentProvider } from '@blocklet/payment-react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material';
import PropTypes from 'prop-types';
import { useSessionContext } from '../../contexts/session';
import { getDonateSettings } from '../../libs/util';

export default function BlockletPayments({ blocklet }) {
  const { t } = useLocaleContext();
  const { session, connectApi } = useSessionContext();
  const theme = useTheme();

  if (!blocklet.owner?.did) {
    return null;
  }

  return (
    <PaymentProvider session={session} connect={connectApi}>
      <DonateProvider mountLocation="blocklet-store" description="Donate developer of the blocklet" enableDonate>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            mt: { xs: 1, sm: 3 },
          }}>
          <CheckoutDonate theme={theme} settings={getDonateSettings(blocklet, t)} />
        </Box>
      </DonateProvider>
    </PaymentProvider>
  );
}

BlockletPayments.propTypes = {
  blocklet: PropTypes.object.isRequired,
};
