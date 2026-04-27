import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import Toast from '@arcblock/ux/lib/Toast';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import PropTypes from 'prop-types';
import { useContext, useRef } from 'react';
import { useSessionContext } from '../../../contexts/session';
import api from '../../../libs/api';
import { getDisplayName } from '../../../libs/util';
import AuthDialog from '../../auth-dialog';

function EnableAutoPublishAction({ rowData, refreshPage }) {
  const authDialog = useRef(null);
  const { t, locale } = useContext(LocaleContext);

  const { session } = useSessionContext();

  const onChange = async (_event, checked) => {
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

  return (
    <>
      <Box>
        <Switch
          inputProps={{
            'data-cy': 'enable',
          }}
          checked={Boolean(rowData?.delegationToken?.autoPublish)}
          onChange={onChange}
        />
      </Box>
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

EnableAutoPublishAction.propTypes = {
  rowData: PropTypes.object.isRequired,
  refreshPage: PropTypes.func.isRequired,
};

export default EnableAutoPublishAction;
