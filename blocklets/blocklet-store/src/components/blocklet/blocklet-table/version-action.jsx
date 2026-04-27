// /** @jsxImportSource @emotion/react */
import Button from '@arcblock/ux/lib/Button';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import Toast from '@arcblock/ux/lib/Toast';
import Box from '@mui/material/Box';
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import { Autorenew } from 'mdi-material-ui';
import PropTypes from 'prop-types';
import { useCallback, useContext, useRef } from 'react';

import { useSessionContext } from '../../../contexts/session';
import { lazyApi } from '../../../libs/api';
import { getDisplayName } from '../../../libs/util';
import AuthDialog from '../../auth-dialog';
import DraftActions from '../draft-version';
import cssMap from './style';

function VersionAction({ rowData, refreshPage }) {
  const { t } = useContext(LocaleContext);
  const authDialog = useRef(null);
  const { session } = useSessionContext();

  // 唤起 did-content 之前 校验 blocklet 是否需要付费
  const openPublishDialog = useCallback(
    async ({ _id: blockletId, meta, did, draftVersion }) => {
      try {
        // 我想知道此次发布blocklet以免费的形式还是付费的形式去发布的,action取值范围为: ['paid-publish-blocklet', 'free-publish-blocklet']
        const { data: action } = await lazyApi.get(`/api/developer/blocklets/verify-nft-factory/${did}`);

        // 弹出扫码界面
        authDialog.current.open({
          action,
          params: {
            blockletId,
            did,
            version: draftVersion.version,
            developerDid: session?.user?.did,
          },
          messages: {
            title: t('auth.publish'),
            scan: t('auth.publishScan', { name: getDisplayName(meta) }),
            confirm: t('auth.confirm'),
          },
          onSuccessAuth() {
            refreshPage();
          },
          countdownForSuccess: 5,
          autoConnect: false,
        });
      } catch (error) {
        Toast.error(error?.response?.data?.error);
      }
    },
    [refreshPage, t, session]
  );

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}>
        {rowData?.currentVersion && <span>v{rowData.currentVersion.version}</span>}
        {rowData?.draftVersion && <DraftActions data={rowData} onPublish={openPublishDialog} />}
        {rowData?.delegationToken?.autoPublish && (
          <Tooltip title={t('blocklet.autoPublish')} arrow>
            <SvgIcon component={Autorenew} className="left" css={cssMap.icon} />
          </Tooltip>
        )}
      </Box>
      <AuthDialog
        ref={authDialog}
        success={
          <Button variant="contained" color="primary" css={cssMap.publishTips}>
            <a target="_blank" href={`/blocklets/${rowData?.did}`} rel="noreferrer">
              {t('auth.publishSuccessTip')}
            </a>
          </Button>
        }
      />
    </>
  );
}

VersionAction.propTypes = {
  rowData: PropTypes.object.isRequired,
  refreshPage: PropTypes.func.isRequired,
};

function VersionActionAdmin({ rowData }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}>
      {rowData?.currentVersion && <span>v{rowData.currentVersion.version}</span>}
    </Box>
  );
}
VersionActionAdmin.propTypes = {
  rowData: PropTypes.object.isRequired,
};

export { VersionAction, VersionActionAdmin };
