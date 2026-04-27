import DidAddress from '@arcblock/ux/lib/DID';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { Controller } from 'react-hook-form';

import { calcPercent } from '@blocklet/util';
import PricingTreeNode from './pricing-tree-node';

export const FREE = 'free';
const PAID_ONE_TIME = 'paid-one-time';

function PricingForm({ formState, defaultPaymentType, defaultPrice, ownerDid, loading }) {
  const { t } = useContext(LocaleContext);
  const paymentTypes = [
    { value: FREE, label: t('blocklet.freePayment') },
    { value: PAID_ONE_TIME, label: t('blocklet.oneTimePayment') },
  ];
  const {
    control,
    watch,
    formState: { errors },
  } = formState;
  const watchPaymentType = watch('paymentType', defaultPaymentType);
  const watchPrice = Number(watch('price', defaultPrice)) || 0;

  function validPrice(raw) {
    const value = Number(raw.trim());
    if (Number.isNaN(value)) {
      return t('form.invalidNumber');
    }
    if (value === 0) {
      return t('form.noLongerThan', {
        name: t('form.remark'),
        number: 0,
      });
    }
    return true;
  }

  return (
    <form noValidate autoComplete="off">
      <Controller
        name="paymentType"
        control={control}
        render={({ field }) => (
          <TextField
            fullWidth
            variant="outlined"
            select
            margin="normal"
            label={t('blocklet.paymentType')}
            disabled={loading}
            error={!!errors?.name?.message}
            {...field}>
            {paymentTypes.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      {watchPaymentType !== FREE && (
        <>
          <Controller
            name="price"
            control={control}
            rules={{ validate: validPrice }}
            render={({ field }) => (
              <TextField
                fullWidth
                variant="outlined"
                margin="normal"
                placeholder={`${t('blocklet.price')}, ABT`}
                label={`${t('blocklet.price')}, ABT`}
                error={!!errors?.name?.message}
                // helperText={errors?.name?.message || ' '}
                {...field}
              />
            )}
          />
          <PricingTreeNode
            data={[
              {
                children: [
                  {
                    label: (
                      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
                        <Chip size="small" color="primary" label={`70%: ${calcPercent(watchPrice, '70')} ABT`} />
                        <DidAddress compact responsive={false} did={ownerDid} showQrcode />
                      </Box>
                    ),
                  },
                  {
                    label: (
                      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
                        <Chip
                          size="small"
                          color="primary"
                          disabled
                          label={`30%: ${calcPercent(watchPrice, '30')} ABT`}
                        />
                        <DidAddress compact responsive={false} did={window.blocklet?.appId} showQrcode />
                      </Box>
                    ),
                  },
                ],
              },
            ]}
          />
        </>
      )}
    </form>
  );
}

PricingForm.propTypes = {
  formState: PropTypes.object.isRequired,
  defaultPaymentType: PropTypes.string.isRequired,
  defaultPrice: PropTypes.string.isRequired,
  ownerDid: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default PricingForm;
