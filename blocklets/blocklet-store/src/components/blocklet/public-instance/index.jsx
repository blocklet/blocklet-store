import { useContext, useCallback, useEffect } from 'react';
import { useRequest } from 'ahooks';
import { useParams } from 'react-router-dom';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import { debounce } from 'lodash-es';
import RefreshIcon from '@mui/icons-material/Refresh';
import Datatable from '@arcblock/ux/lib/Datatable';
import Toast from '@arcblock/ux/lib/Toast';

import ShowOwner from './show-owner';
import api from '../../../libs/api';
import TabContainer from '../../styled/tab-container';

function PublicInstance() {
  const { did } = useParams();
  const { t, locale } = useContext(LocaleContext);

  const getBlockletPurchase = useCallback(async () => {
    const { data } = await api.get(`/api/blocklets/${did}/instances`);
    return data;
  }, [did]);

  const getDomain = (url) => {
    if (url) return new URL(url).hostname;
    return '';
  };

  const { data = [], error, refresh, loading } = useRequest(getBlockletPurchase);

  useEffect(() => {
    const errorMessage = error?.message;
    if (errorMessage) {
      Toast.error(errorMessage);
    }
  }, [error]);

  return (
    <TabContainer>
      <Datatable
        title={t('blockletDetail.instance.title')}
        data={data}
        loading={loading}
        locale={locale}
        customButtons={[
          {
            icon: <RefreshIcon />,
            title: t('common.refresh'),
            onClick: debounce(() => refresh(), 300),
          },
        ]}
        options={{
          search: false,
          print: false,
          download: false,
          sortOrder: { name: 'time', direction: 'desc' },
          fixedHeader: true,
          fixedSelectColumn: true,
        }}
        columns={[
          {
            label: t('blockletDetail.instance.address'),
            name: 'appUrl',
            options: {
              sort: false,
              filter: false,
              viewColumns: false,
              // eslint-disable-next-line react/no-unstable-nested-components
              customBodyRenderLite: (dataIndex) => (
                <a href={data[dataIndex]?.appUrl} target="_blank" rel="noreferrer">
                  {getDomain(data[dataIndex]?.appUrl)}
                </a>
              ),
            },
          },
          {
            label: t('blockletDetail.instance.blockletOwner'),
            name: 'ownerDid',
            options: {
              sort: false,
              filter: false,
              // eslint-disable-next-line react/no-unstable-nested-components
              customBodyRenderLite: (dataIndex) => <ShowOwner ownerDid={data[dataIndex]?.ownerDid} />,
            },
          },
        ]}
      />
    </TabContainer>
  );
}
PublicInstance.propTypes = {};

export default PublicInstance;
