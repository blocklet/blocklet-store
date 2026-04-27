import { useContext } from 'react';
import { useReactive } from 'ahooks';
import Dialog from '@arcblock/ux/lib/Dialog';
import Button from '@arcblock/ux/lib/Button';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import Toast from '@arcblock/ux/lib/Toast';

import PricingForm, { FREE } from './pricing-form';
import api from '../../libs/api';

function PricingDialog({ rowData, open, onClose, onConfirm }) {
  const { t } = useContext(LocaleContext);
  const state = useReactive({ loading: false });
  const defaultPaymentType = rowData?.meta?.pricing?.paymentType || FREE;
  const defaultPrice = rowData?.meta?.pricing?.price || '0';
  const formState = useForm({
    mode: 'onChange',
    defaultValues: {
      price: defaultPrice,
      paymentType: defaultPaymentType,
    },
  });

  const handleSubmit = async () => {
    const { price, paymentType } = formState.watch();
    try {
      state.loading = true;
      try {
        await api.post('/api/pricing', {
          price,
          paymentType,
          blockletId: rowData._id,
        });
        onConfirm();
        Toast.success(t('form.submitSuccess'));
      } catch (err) {
        Toast.error(err?.response?.data?.error || err.message);
      }
    } catch (err) {
      const { error } = err.response.data;
      Toast.error(error);
    } finally {
      state.loading = false;
      state.open = false;
    }
  };

  return (
    <Dialog
      title={t('blocklet.pricingTo', { name: rowData?.meta?.title })}
      fullWidth
      open={open}
      onClose={onClose}
      actions={
        <Button
          type="submit"
          loading={state.loading}
          onClick={handleSubmit}
          color="primary"
          autoFocus
          variant="contained">
          {t('common.confirm')}
        </Button>
      }>
      {!!open && (
        <PricingForm
          defaultPaymentType={defaultPaymentType}
          defaultPrice={defaultPrice}
          loading={state.loading}
          ownerDid={rowData.owner.did}
          formState={formState}
        />
      )}
    </Dialog>
  );
}

PricingDialog.propTypes = {
  rowData: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default PricingDialog;
