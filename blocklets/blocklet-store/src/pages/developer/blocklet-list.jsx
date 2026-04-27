import { useCallback, useContext, useRef, useState } from 'react';
import { debounce } from 'lodash-es';
import Toast from '@arcblock/ux/lib/Toast';
import RefreshIcon from '@mui/icons-material/Refresh';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@arcblock/ux/lib/Button';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';

import AddBlockletDialog from '../../components/developer/add-blocklet-dialog';
import BlockletListBase from '../../components/blocklet/blocklet-table/blocklet-list-base';

import AdminLayout from '../../components/layout/admin-layout';
import { formatError } from '../../libs/util';
import api from '../../libs/api';

function BlockletList() {
  const [loading, setLoading] = useState(false);
  const addBlockletDialogRef = useRef(null);

  const tableRef = useRef(null);
  const { t } = useContext(LocaleContext);

  async function refreshPage(force) {
    await tableRef.current.refresh(force);
  }

  const openCreateDialog = useCallback(() => {
    addBlockletDialogRef.current.open({
      onConfirm: async () => {
        try {
          await refreshPage();
        } catch (error) {
          Toast.error(formatError(error));
        }
      },
    });
  }, []);

  const onUpload = async () => {
    const file = await new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/zip';
      input.onchange = (e) => {
        const blob = e.target.files?.[0];
        if (blob) {
          resolve(blob);
        }
      };
      input.click();
    });
    try {
      setLoading(true);
      const form = new FormData();
      form.append('blocklet-release', file);
      await api.post('/api/blocklets/upload', form).then((res) => res.data);
      Toast.success(t('developer.uploadSuccess'));
      setLoading(false);
      refreshPage(true);
    } catch (error) {
      setLoading(false);
      const list = (error.response?.data?.error || error.response?.data?.message || error.message).split('\n');
      Toast.error(
        <div>
          {list.map((item) => (
            <div key={item}>{item}</div>
          ))}
        </div>
      );
      throw error;
    }
  };

  const customButtons = [
    {
      icon: <RefreshIcon />,
      title: t('common.refresh'),
      onClick: debounce(() => refreshPage(true), 300),
    },
    <Button
      disabled={loading}
      size="small"
      variant="outlined"
      color="primary"
      onClick={onUpload}
      style={{ marginRight: 8 }}>
      {loading && <CircularProgress size={14} mr={0.5} />} {t('common.upload')}
    </Button>,
    <Button disabled={loading} size="small" variant="contained" color="primary" onClick={openCreateDialog}>
      {t('common.add')}
    </Button>,
  ];

  return (
    <AdminLayout>
      <BlockletListBase ref={tableRef} customButtons={customButtons} />
      <AddBlockletDialog ref={addBlockletDialogRef} />
    </AdminLayout>
  );
}
BlockletList.propTypes = {};
export default BlockletList;
