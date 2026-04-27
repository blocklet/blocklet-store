import { useImperativeHandle, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Box from '@mui/material/Box';
import DID from '@arcblock/ux/lib/DID';
import Table from '../../styled/table';
import { lazyApi } from '../../../libs/api';
import { formatNumber } from '../../../libs/util';
import { getDisplayLocale } from '../../../libs/category';
import Ellipsis from '../../ellipsis';
import ShowTime from '../../show-time';
import ShowPrice from './show-price';
import { TableActions, TableActionsAdmin } from './table-action';
import { VersionActionAdmin, VersionAction } from './version-action';
import ShowTitle from './show-title';
import { useSessionContext } from '../../../contexts/session';

function BlockletListBase({ ref = null, customToolbar = null, isAdminPath = false, customButtons = [] }) {
  const tableRef = useRef(null);
  const { t, locale } = useLocaleContext();
  const { events } = useSessionContext();

  const getBlockletAll = useCallback(
    async (params = {}) => {
      const url = isAdminPath ? '/api/console/blocklets' : '/api/developer/blocklets';
      const { data } = await lazyApi.get(url, { params });
      return { data: data.dataList || [], total: data.total };
    },
    [isAdminPath]
  );
  const refreshPage = async (force) => {
    await tableRef.current.refresh(force);
  };
  useImperativeHandle(ref, () => ({
    async refresh(force) {
      await refreshPage(force);
    },
  }));

  useEffect(() => {
    events.on('switch-did', () => {
      refreshPage(true).catch(console.error);
    });
  }, []); // eslint-disable-line

  return (
    <Table
      ref={tableRef}
      title={isAdminPath ? t('common.blocklets') : t('common.blocklet')}
      getData={getBlockletAll}
      hideColumns={['did', 'stats.downloads', 'updatedAt']}
      customButtons={customButtons}
      options={{
        serverSide: true,
        filter: true,
        searchPlaceholder: t('common.search', { name: t('blockletList.placeholder') }),
        sortOrder: { name: 'createdAt', direction: 'desc' },
        customToolbar: () => customToolbar,
      }}
      columns={[
        {
          label: t('common.name'),
          name: 'meta.name',
          options: {
            viewColumns: false,
            sort: false,
            filter: false,
            // eslint-disable-next-line react/no-unstable-nested-components
            customCellRender(rowData) {
              return <ShowTitle rowData={rowData} isAdmin={isAdminPath} />;
            },
          },
        },
        {
          label: t('blocklet.type'),
          name: 'type',
          options: {
            viewColumns: false,
            sort: false,
            filterOptions: {
              names: ['Resource', 'Blocklet'],
            },
            // eslint-disable-next-line react/no-unstable-nested-components
            customCellRender(rowData) {
              const isResourceType = !!(rowData.draftMeta || rowData.meta)?.resource?.bundles?.length;
              return isResourceType ? t('blocklet.resource') : 'Blocklet';
            },
          },
        },
        {
          label: t('common.category'),
          options: {
            sort: false,
            filter: false,
            // eslint-disable-next-line react/no-unstable-nested-components
            customCellRender(rowData) {
              // category 的翻译种类不是固定，随着商店中配置的语言而变化，这里展示的 category 翻译默认取 locales 中的第一项
              const displayLocale = rowData.category?.locales
                ? getDisplayLocale(rowData.category?.locales, locale)
                : '';
              return displayLocale ? (
                <Box
                  sx={{
                    display: 'flex',
                    whiteSpace: 'nowrap',
                  }}>
                  <Ellipsis value={displayLocale} />
                </Box>
              ) : (
                '-'
              );
            },
          },
        },
        {
          label: t('blocklet.permission'),
          name: 'permission',
          options: {
            sort: false,
            display: 'excluded',
            filterOptions: {
              // Options for customizing the filter
              names: ['Private', 'Public'],
            },
          },
        },
        {
          label: 'DID',
          name: 'did',
          options: {
            sort: false,
            filter: false,
            // eslint-disable-next-line react/no-unstable-nested-components
            customCellRender: (rowData) => {
              return <DID compact did={rowData.did} showQrcode locale={locale} />;
            },
          },
        },
        {
          label: t('blocklet.version'),
          name: 'currentVersion.version',
          options: {
            sort: false,
            filter: false,
            // eslint-disable-next-line react/no-unstable-nested-components
            customCellRender: (rowData) => {
              if (isAdminPath) {
                return <VersionActionAdmin rowData={rowData} />;
              }
              return <VersionAction rowData={rowData} refreshPage={refreshPage} />;
            },
          },
        },
        {
          label: t('blocklet.price'),
          name: 'meta.payment',
          options: {
            filter: false,
            sort: false,
            // eslint-disable-next-line react/no-unstable-nested-components
            customCellRender: (rowData) => <ShowPrice rowData={rowData} isAdmin={isAdminPath} />,
          },
        },
        {
          label: t('common.downloadNum'),
          name: 'stats.downloads',
          options: {
            filter: false,
            // eslint-disable-next-line react/no-unstable-nested-components
            customCellRender: (rowData) => formatNumber(rowData.stats?.downloads),
            setCellProps: () => ({ className: 'righted-tablecell' }),
            setCellHeaderProps: () => ({ className: 'righted-tablehead' }),
          },
        },
        {
          label: t('common.publishedAt'),
          name: 'lastPublishedAt',
          options: {
            filter: false,
            viewColumns: false,
            // eslint-disable-next-line react/no-unstable-nested-components
            customCellRender: (rowData) => <ShowTime date={rowData?.lastPublishedAt} />,
          },
        },
        {
          label: t('common.source'),
          name: 'source',
          options: {
            filter: false,
            // eslint-disable-next-line react/no-unstable-nested-components
            customCellRender: (rowData) => rowData?.source ?? 'CLI',
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
          label: t('common.updatedAt'),
          name: 'updatedAt',
          options: {
            filter: false,
            // eslint-disable-next-line react/no-unstable-nested-components
            customCellRender: (rowData) => <ShowTime date={rowData.updatedAt} />,
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
            filter: false,
            viewColumns: false,
            // eslint-disable-next-line react/no-unstable-nested-components
            customCellRender: (rowData) => {
              if (isAdminPath) return <TableActionsAdmin rowData={rowData} refreshPage={refreshPage} />;
              return <TableActions rowData={rowData} refreshPage={refreshPage} />;
            },
          },
        },
      ].filter(Boolean)}
    />
  );
}

BlockletListBase.propTypes = {
  ref: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
  customToolbar: PropTypes.node,
  isAdminPath: PropTypes.bool,
  customButtons: PropTypes.array,
};

export default BlockletListBase;
