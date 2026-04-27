import { useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Address from '@arcblock/ux/lib/Address';
import DID from '@arcblock/ux/lib/DID';
import { debounce } from 'lodash-es';
import RefreshIcon from '@mui/icons-material/Refresh';

import Table from '../styled/table';
import api from '../../libs/api';
import ShowTime from '../show-time';

function BlockletPurchase() {
  const { did } = useParams();
  const tableRef = useRef(null);
  const { t, locale } = useLocaleContext();

  const getBlockletPurchase = useCallback(
    async (params = {}) => {
      const { data } = await api.get(`/api/blocklets/${did}/purchases`, { params });
      return {
        data: data.transactions || [],
        total: data.page.total,
      };
    },
    [did]
  );
  async function refreshPage(force) {
    // FIXME: tableRef.current 有时候会返回null, 需要排查错误
    await tableRef.current?.refresh(force);
  }
  return (
    <Table
      persistence={false}
      ref={tableRef}
      title={t('blocklet.purchaseList')}
      getData={getBlockletPurchase}
      customButtons={[
        {
          icon: <RefreshIcon />,
          title: t('common.refresh'),
          onClick: debounce(() => refreshPage(true), 300),
        },
      ]}
      options={{
        search: false,
        serverSide: true,
        filter: false,
        sortOrder: { name: 'time', direction: 'desc' },
      }}
      columns={[
        {
          label: t('common.hash'),
          name: 'hash',
          options: {
            sort: false,
            viewColumns: false,
            // eslint-disable-next-line react/no-unstable-nested-components
            customCellRender: (rowData) => (
              <Address showDidLogo={false} compact>
                {rowData.hash}
              </Address>
            ),
          },
        },
        {
          label: t('common.receiver'),
          name: 'receiver',
          options: {
            sort: false,
            // eslint-disable-next-line react/no-unstable-nested-components
            customCellRender: (rowData) => <DID showQrcode compact did={rowData.receiver} locale={locale} />,
          },
        },
        {
          label: t('blockletDetail.purchasedAt'),
          name: 'time',
          options: {
            // eslint-disable-next-line react/no-unstable-nested-components
            customCellRender: (rowData) => <ShowTime date={rowData.time} />,
          },
        },
      ]}
    />
  );
}

BlockletPurchase.propTypes = {};
export default BlockletPurchase;
