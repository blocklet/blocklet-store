import { useRef, useContext } from 'react';
import { debounce } from 'lodash-es';
import RefreshIcon from '@mui/icons-material/Refresh';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';

import BlockletListBase from '../../components/blocklet/blocklet-table/blocklet-list-base';
import AdminLayout from '../../components/layout/admin-layout';

function BlockletList() {
  const tableRef = useRef(null);
  const { t } = useContext(LocaleContext);

  async function refreshPage(force) {
    await tableRef.current.refresh(force);
  }
  return (
    <AdminLayout>
      <BlockletListBase
        ref={tableRef}
        isAdminPath
        customButtons={[
          {
            icon: <RefreshIcon />,
            title: t('common.refresh'),
            onClick: debounce(() => refreshPage(true), 300),
          },
        ]}
      />
    </AdminLayout>
  );
}

BlockletList.propTypes = {};
export default BlockletList;
