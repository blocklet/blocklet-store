import { useContext, useRef, useCallback } from 'react';
import { debounce } from 'lodash-es';
import Toast from '@arcblock/ux/lib/Toast';
import { useMemoizedFn, useReactive } from 'ahooks';
import Button from '@arcblock/ux/lib/Button';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import RefreshIcon from '@mui/icons-material/Refresh';
import Copyable from '@arcblock/did-connect-react/lib/Address';

import Table from '../../../components/styled/table';
import AdminLayout from '../../../components/layout/admin-layout';
import api, { lazyApi } from '../../../libs/api';
import CategoryDialog from '../../../components/category/category-dialog';
import ConfirmDialog from '../../../components/confirm-dialog';
import TableActions from '../../../components/category/table-action';
import DisplayUpdate from '../../../components/category/display-update';
import DisplayLocales from '../../../components/category/display-name';

function CategoryList() {
  const formDialogRef = useRef(null);
  const confirmDialog = useRef(null);
  const tableRef = useRef(null);
  const { t } = useContext(LocaleContext);

  const innerState = useReactive({ list: [] });

  const getDataList = async (params = {}) => {
    const { data } = await lazyApi.get('/api/console/categories', { params });
    innerState.list = data.dataList || [];
    return { data: data.dataList || [], total: data.total };
  };

  const refreshPage = useMemoizedFn(async (force) => {
    await tableRef.current.refresh(force);
  });
  const notifyConfirm = useMemoizedFn(({ message, method, url, ...confirmProps }) => {
    confirmDialog.current.open({
      ...confirmProps,
      async onConfirm() {
        try {
          await api[method](url);
          Toast.success(message);
          await refreshPage();
        } catch (err) {
          const { error } = err.response.data;
          Toast.error(error);
        } finally {
          confirmDialog.current.close();
        }
      },
    });
  });

  const handleDelete = ({ _id: id }) => {
    notifyConfirm({
      url: `/api/console/categories/${id}/delete`,
      method: 'delete',
      title: t('common.delete'),
      content: t('common.deleteDesc'),
      message: t('form.deleteSuccess'),
      confirmText: t('common.delete'),
      confirmColor: 'error',
    });
  };
  const handleDefaultCreate = useCallback(() => {
    notifyConfirm({
      url: '/api/console/categories/default',
      method: 'post',
      title: t('category.defaultCreate'),
      content: t('category.defaultCreateContent'),
      message: t('common.createSuccess'),
    });
  }, [t, notifyConfirm]);

  const openCreateDialog = useCallback(() => {
    formDialogRef.current.open({
      onConfirm: async (params) => {
        await api.post('/api/console/categories', params);
        await refreshPage();
      },
    });
  }, [refreshPage]);
  const openEditDialog = useCallback(
    (rowData) => {
      const { _id: id } = rowData;
      formDialogRef.current.edit(rowData, async (params) => {
        await api.put(`/api/console/categories/${id}`, params);
        await refreshPage();
      });
    },
    [refreshPage]
  );

  const customButtons = [
    {
      icon: <RefreshIcon />,
      title: t('common.refresh'),
      onClick: debounce(() => refreshPage(true), 300),
    },
    innerState.list.length === 0 ? (
      <Button
        size="small"
        variant="contained"
        color="primary"
        onClick={handleDefaultCreate}
        data-cy="category-create-default">
        {t('category.defaultCreate')}
      </Button>
    ) : (
      <Button size="small" variant="contained" color="primary" onClick={openCreateDialog} data-cy="category-create">
        {t('common.create')}
      </Button>
    ),
  ];

  return (
    <AdminLayout>
      <Table
        ref={tableRef}
        title={t('common.categories')}
        getData={getDataList}
        customButtons={customButtons}
        options={{
          serverSide: true,
          filter: false,
          searchPlaceholder: t('common.search', { name: t('category.placeholder') }),
          sortOrder: { name: 'createdAt', direction: 'desc' },
        }}
        columns={[
          {
            label: t('common.name'),
            name: 'locales.en',
            options: {
              viewColumns: false,
              sort: false,
              // eslint-disable-next-line react/no-unstable-nested-components
              customCellRender(rowData) {
                return <DisplayLocales locales={rowData.locales} />;
              },
            },
          },
          {
            label: 'ID',
            name: '_id',
            options: {
              filter: false,
              sort: false,
              // eslint-disable-next-line react/no-unstable-nested-components
              customCellRender: (rowData) => {
                return <Copyable compact>{rowData._id}</Copyable>;
              },
            },
          },
          {
            label: t('common.updatedAt'),
            name: 'updatedAt',
            options: {
              filter: false,
              // eslint-disable-next-line react/no-unstable-nested-components
              customCellRender: (rowData) => <DisplayUpdate rowData={rowData} />,
            },
          },
          {
            label: t('common.actions'),
            name: 'status',
            options: {
              sort: false,
              filter: false,
              viewColumns: false,
              // eslint-disable-next-line react/no-unstable-nested-components
              customCellRender: (rowData) => (
                <TableActions rowData={rowData} openEditDialog={openEditDialog} onDelete={handleDelete} />
              ),
            },
          },
        ]}
      />
      <CategoryDialog ref={formDialogRef} />
      <ConfirmDialog ref={confirmDialog} />
    </AdminLayout>
  );
}

CategoryList.propTypes = {};
export default CategoryList;
