import { useContext, useMemo, useRef, useState } from 'react';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import Toast from '@arcblock/ux/lib/Toast';
import { Pencil, HelpCircleOutline, Autorenew, AutorenewOff, CubeOffOutline, CubeOutline } from 'mdi-material-ui';
import PaidIcon from '@mui/icons-material/Paid';
import PropTypes from 'prop-types';

import { isNoneBlocklet, getDisplayName } from '../../../libs/util';
import api from '../../../libs/api';
import ConfirmDialog from '../../confirm-dialog';
import EditBlockletDialog from '../../developer/edit-blocklet-dialog';
import GetHelpDialog from '../../developer/get-help-dialog';
import BlockletCategoryDialog from '../blocklet-category-dialog';
import DisableBlockletDialog from './disable-blocklet-dialog';
import AuthDialog from '../../auth-dialog';
import RowActions from '../../row-actions';
import { useSessionContext } from '../../../contexts/session';
import PricingDialog from '../../developer/pricing-dialog';

function TableActionsAdmin({ rowData, refreshPage }) {
  const { t, locale } = useContext(LocaleContext);

  const confirmDialog = useRef(null);
  const categoryDialog = useRef(null);
  const disableBlockletDialog = useRef(null);

  const isEnabled = useMemo(() => rowData.status === 'normal', [rowData.status]);

  function handleBlock({ _id: id }) {
    disableBlockletDialog.current.open({
      id,
      async onConfirm() {
        await refreshPage();
      },
    });
  }

  function handleUnblock({ _id: id }) {
    confirmDialog.current.open({
      title: t('common.enable'),
      content: t('blocklet.enableDesc'),
      async onConfirm() {
        try {
          await api.put(`/api/console/blocklets/${id}/unblock`, { locale });
          await refreshPage();
          Toast.success(t('common.success'));
        } catch (err) {
          const { error } = err.response?.data ?? { error: err };
          Toast.error(error);
        } finally {
          confirmDialog.current?.close();
        }
      },
    });
  }
  function openCategoryDialog() {
    const { _id: id } = rowData;
    categoryDialog.current.edit(rowData, async ({ category }) => {
      await api.put(`/api/console/blocklets/${id}/category`, { category });
      await refreshPage();
    });
  }
  const changeStatus = (value) => {
    if (value) {
      handleUnblock(rowData);
    } else {
      handleBlock(rowData);
    }
  };
  const actions = [
    {
      name: 'blocklet-edit',
      text: t('common.edit'),
      icon: Pencil,
      handler: (handleClose) => {
        handleClose();
        openCategoryDialog(rowData);
      },
      props: { 'data-cy': 'blocklet-edit', disabled: rowData.status === 'blocked' },
    },
  ];
  if (isEnabled) {
    actions.push({
      name: 'blocklet-disable',
      text: t('blocklet.disableAction'),
      icon: CubeOffOutline,
      handler: (handleClose) => {
        handleClose();
        changeStatus(false);
      },
      props: { 'data-cy': 'blocklet-disable' },
    });
  } else {
    actions.push({
      name: 'blocklet-enable',
      text: t('blocklet.enableAction'),
      icon: CubeOutline,
      handler: (handleClose) => {
        handleClose();
        changeStatus(true);
      },
      props: { 'data-cy': 'blocklet-enable' },
    });
  }

  return (
    <>
      <RowActions actions={actions} />
      <ConfirmDialog ref={confirmDialog} />
      <BlockletCategoryDialog ref={categoryDialog} />
      <DisableBlockletDialog ref={disableBlockletDialog} />
    </>
  );
}
TableActionsAdmin.propTypes = {
  rowData: PropTypes.object.isRequired,
  refreshPage: PropTypes.func.isRequired,
};

function TableActions({ rowData, refreshPage }) {
  const { t, locale } = useContext(LocaleContext);

  const editBlockletDialogRef = useRef(null);
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  const getHelpDialogRef = useRef(null);
  const authDialog = useRef(null);
  const { session } = useSessionContext();

  const changeAutoPublish = async (checked) => {
    if (checked) {
      authDialog.current.open({
        action: 'enable-auto-publish',
        params: {
          did: rowData?.did,
          id: rowData?._id,
          developerDid: session?.user?.did,
        },
        messages: {
          title: t('auth.enableAutoPublish'),
          scan: t('auth.enableAutoPublishScan', { name: getDisplayName(rowData?.meta) }),
          confirm: t('auth.confirm'),
        },
        onSuccessAuth: async () => {
          await refreshPage();
        },
        countdownForSuccess: 5,
        autoConnect: true,
      });
    } else {
      await api.delete(`/api/developer/blocklets/${rowData._id}/delegation/autoPublish`, {
        data: {
          locale,
          did: rowData?.did,
        },
      });
      await refreshPage();
      Toast.success(t('common.success'));
    }
  };

  const protectBlocked = (data, fn = () => {}) => {
    if (data.status !== 'blocked') return fn(data);
    Toast.error(t('blocklet.hasBeenBlocked'));
    return () => {};
  };
  const openEditDialog = () => {
    const { _id: id } = rowData;
    editBlockletDialogRef.current.edit(rowData, async ({ remark, permission }) => {
      await api.put(`/api/developer/blocklets/${id}`, { remark, permission });
      await refreshPage();
    });
  };
  const openHelpDialog = () => {
    getHelpDialogRef.current.open({ name: rowData?.meta.name, did: rowData?.did });
  };
  const handleOpenPricingDialog = () => {
    setShowPricingDialog(true);
  };
  const handleClosePricingDialog = () => {
    setShowPricingDialog(false);
  };
  const handleConfirmPricingDialog = async () => {
    await refreshPage();
    setShowPricingDialog(false);
  };
  const actions = [
    {
      name: 'blocklet-edit',
      text: t('common.edit'),
      icon: Pencil,
      handler: (handleClose) => {
        handleClose();
        protectBlocked(rowData, openEditDialog);
      },
      props: { 'data-cy': 'blocklet-edit' },
    },
  ];
  if (window.blocklet?.preferences?.allowPaidBlocklets) {
    actions.push({
      name: 'blocklet-price-edit',
      text: t('blocklet.pricing'),
      icon: PaidIcon,
      handler: (handleClose) => {
        handleClose();
        handleOpenPricingDialog();
      },
      props: { 'data-cy': 'blocklet-price-edit', disabled: rowData.status === 'blocked' },
    });
  }

  if (rowData?.delegationToken?.autoPublish) {
    actions.push({
      name: 'autoPublish-enable',
      text: t('blocklet.disableAutoPublish'),
      icon: AutorenewOff,
      handler: (handleClose) => {
        handleClose();
        changeAutoPublish(false);
      },
      props: { 'data-cy': 'autoPublish-enable' },
    });
  } else {
    actions.push({
      name: 'autoPublish-disable',
      text: t('blocklet.enableAutoPublish'),
      icon: Autorenew,
      handler: (handleClose) => {
        handleClose();
        changeAutoPublish(true);
      },
      props: { 'data-cy': 'autoPublish-disable' },
    });
  }
  if (isNoneBlocklet(rowData)) {
    actions.push({
      name: 'form-solution',
      text: t('form.solution'),
      icon: HelpCircleOutline,
      handler: (handleClose) => {
        handleClose();
        openHelpDialog(rowData);
      },
    });
  }
  return (
    <>
      <RowActions actions={actions} />
      <EditBlockletDialog ref={editBlockletDialogRef} />
      {/* 过度使用 Refs 是 react 的一种反模式(anti-patterns), 所以后续的 dialog 不继续沿用 Refs 的风格: https://legacy.reactjs.org/docs/refs-and-the-dom.html */}
      <PricingDialog
        key={rowData?._id}
        rowData={rowData}
        open={showPricingDialog}
        onClose={handleClosePricingDialog}
        onConfirm={handleConfirmPricingDialog}
      />
      <GetHelpDialog ref={getHelpDialogRef} />
      <AuthDialog
        ref={authDialog}
        success={
          <p style={{ fontWeight: 'bold' }}>
            {t('auth.enableAutoPublishSuccessTip', { name: getDisplayName(rowData?.meta) })}
          </p>
        }
      />
    </>
  );
}
TableActions.propTypes = {
  rowData: PropTypes.object.isRequired,
  refreshPage: PropTypes.func.isRequired,
};
export { TableActions, TableActionsAdmin };
