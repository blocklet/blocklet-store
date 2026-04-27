import Button from '@arcblock/ux/lib/Button';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import Toast from '@arcblock/ux/lib/Toast';
import RefreshIcon from '@mui/icons-material/Refresh';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import { debounce } from 'lodash-es';
import Delete from 'mdi-material-ui/Delete';
import { useCallback, useContext, useRef } from 'react';

import AccessTokenFormDialog from '../../components/access-token/form-dialog';
import AccessTokenInfoDialog from '../../components/access-token/info-dialog';
import ConfirmDialog from '../../components/confirm-dialog';
import AdminLayout from '../../components/layout/admin-layout';
import ShowTime from '../../components/show-time';
import Table from '../../components/styled/table';
import api, { lazyApi } from '../../libs/api';

function AccessToken() {
  const formDialogRef = useRef(null);
  const infoDialogRef = useRef(null);
  const confirmDialog = useRef(null);
  const tableRef = useRef(null);

  const { t } = useContext(LocaleContext);

  const getData = useCallback(async (params = {}) => {
    const { data } = await lazyApi.get('/api/developer/access-tokens/my', { params });
    return { data: data.dataList || [], total: data.total };
  }, []);

  async function refreshPage(force) {
    await tableRef.current.refresh(force);
  }

  const openFormDialog = useCallback(() => {
    formDialogRef.current.open();
  }, []);
  const handleConfirmForm = useCallback((data) => {
    infoDialogRef.current.open(data);
  }, []);
  const handleInfoDialog = useCallback(async () => {
    await refreshPage(true);
  }, []);
  function handleDelete({ _id: id }) {
    confirmDialog.current.open({
      title: t('common.delete'),
      content: t('common.deleteDesc'),
      confirmText: t('common.delete'),
      confirmColor: 'error',
      async onConfirm() {
        try {
          await api.delete(`/api/developer/access-tokens/${id}`);
          await refreshPage();
          Toast.success(t('common.success'));
        } catch (err) {
          const { error } = err.response.data;
          Toast.error(error);
        } finally {
          confirmDialog.current.close();
        }
      },
    });
  }

  const customButtons = [
    {
      icon: <RefreshIcon />,
      title: t('common.refresh'),
      onClick: debounce(() => refreshPage(true), 300),
    },
    <Button size="small" variant="contained" color="primary" onClick={openFormDialog} data-cy="access-token-create">
      {t('common.create')}
    </Button>,
  ];

  return (
    <>
      <AdminLayout>
        <Table
          ref={tableRef}
          getData={getData}
          customButtons={customButtons}
          title={t('common.accessToken')}
          options={{
            serverSide: true,
            filter: true,
            searchPlaceholder: t('common.search', { name: t('common.remark') }),
            sortOrder: { name: 'createdAt', direction: 'desc' },
          }}
          columns={[
            {
              label: t('common.accessToken'),
              name: 'secretKey',
              options: { viewColumns: false, sort: false, filter: false },
            },
            {
              label: t('common.remark'),
              name: 'remark',
              options: {
                sort: false,
                filter: false,
              },
            },
            {
              label: t('common.createdAt'),
              name: 'createdAt',
              options: {
                filter: false,
                // eslint-disable-next-line react/no-unstable-nested-components
                customCellRender: (rowData) => <ShowTime date={rowData.createdAt} />,
              },
            },
            {
              label: t('common.latestUsedAt'),
              name: 'latestUsedAt',
              options: {
                filter: false,
                // eslint-disable-next-line react/no-unstable-nested-components
                customCellRender: (rowData) => rowData.latestUsedAt && <ShowTime date={rowData.latestUsedAt} />,
              },
            },
            {
              label: t('common.status'),
              name: 'status',
              options: {
                sort: false,
                display: 'excluded',
              },
            },
            {
              label: t('common.actions'),
              name: 'status',
              options: {
                sort: false,
                viewColumns: false,
                filter: false,
                // eslint-disable-next-line react/no-unstable-nested-components
                customCellRender: (rowData) => {
                  return (
                    <IconButton
                      title={t('common.delete')}
                      onClick={debounce(() => handleDelete(rowData), 300)}
                      data-cy="access-token-delete"
                      size="large">
                      <SvgIcon component={Delete} />
                    </IconButton>
                  );
                },
              },
            },
          ]}
        />
      </AdminLayout>
      <AccessTokenFormDialog ref={formDialogRef} onConfirm={handleConfirmForm} />
      <AccessTokenInfoDialog ref={infoDialogRef} onConfirm={handleInfoDialog} />
      <ConfirmDialog ref={confirmDialog} />
    </>
  );
}

AccessToken.propTypes = {};
export default AccessToken;
