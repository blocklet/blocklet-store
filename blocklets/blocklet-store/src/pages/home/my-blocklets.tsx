import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Toast from '@arcblock/ux/lib/Toast';
import Refresh from '@iconify-icons/tabler/refresh';
import { Icon } from '@iconify/react';
import { Box, Button, CircularProgress, IconButton, Typography } from '@mui/material';
import { useInfiniteScroll } from 'ahooks';
import { debounce, omit } from 'lodash-es';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { joinURL, withQuery } from 'ufo';
import AddBlockletDialog from '../../components/developer/add-blocklet-dialog';
import Tooltip from '../../components/tooltip';
import { EConditionType, EFilterKeys, EVersionStatus } from '../../constants';
import { useSessionContext } from '../../contexts/session';
import useCustomEvent, { ECustomEvent } from '../../hooks/use-custom-event';
import { useUrlState } from '../../hooks/use-url-state';
import { lazyApi } from '../../libs/api';
import { formatError, getUrlPrefix } from '../../libs/util';
import BlockletCard from './components/blocklet-card';
import Title from './components/title';
import ToolBar from './components/tool-bar';
import { getFilterGroups, getSortGroups, getWaitActions } from './utils';
import { useReviewMessage } from '../../hooks/use-subscription';
import NotFoundTips from '../../components/not-found-tips';

const PAGE_SIZE = 20;

export default function MyBlocklets() {
  const { apiPrefix } = getUrlPrefix();
  const { t } = useLocaleContext();

  const [{ freeText, filters, sort }, { setFilters, setFreeText, setSort }] = useUrlState();

  const {
    data,
    loading,
    noMore,
    loadingMore,
    reload,
    error: requestError,
  } = useInfiniteScroll(
    async (d) => {
      const page = d ? Math.floor(d.list.length / PAGE_SIZE) + 1 : 1;

      const queryFilters = Object.entries(filters).reduce((acc, [key, values]) => {
        if (values && values.length > 0) {
          acc[`filter[${key}]`] = values;
        }
        return acc;
      }, {});

      const result = await lazyApi.get(
        withQuery(joinURL(apiPrefix, '/api/developer/blocklets'), {
          page,
          pageSize: PAGE_SIZE,
          ...queryFilters,
          keyword: freeText,
          sortBy: sort.name,
          sortDirection: sort.direction,
          allBlockletCount: true,
        })
      );

      const list = (result.data.dataList || []).map((blocklet) => {
        const actions = getWaitActions(blocklet);
        return {
          ...blocklet,
          actions,
        };
      });

      return {
        list,
        displayCount: result.data.total,
        total: result.data.totalBlocklet,
        hasMore: list.length === PAGE_SIZE,
      };
    },
    {
      target: document,
      isNoMore: (d) => !d?.hasMore,
      reloadDeps: [freeText, filters, sort],
      threshold: 200,
      manual: false,
    }
  );

  useReviewMessage(reload);

  useEffect(() => {
    if (requestError) {
      Toast.error(formatError(requestError));
    }
  }, [requestError]);

  useCustomEvent(ECustomEvent.BLOCKLET_LIST_REFRESH, reload);

  const hasFilter = Object.keys(filters).some((key) => key !== EFilterKeys.CONDITION_TYPE);
  const list = data?.list || [];

  const { events } = useSessionContext();
  useEffect(() => {
    const refreshHandler = () => reload();
    events.on('switch-did', refreshHandler);
    return () => {
      events.off('switch-did', refreshHandler);
    };
  }, [reload, events]);

  const sortGroups = useMemo(() => getSortGroups(t), [t]);
  const filterGroups = useMemo(() => getFilterGroups(t), [t]);

  const checkedActionFilter =
    filters[EFilterKeys.CONDITION_TYPE]?.includes(EConditionType.OR) &&
    filters[EFilterKeys.REVIEW_STATUS]?.includes(EVersionStatus.DRAFT) &&
    filters[EFilterKeys.REVIEW_STATUS]?.includes(EVersionStatus.APPROVED) &&
    filters[EFilterKeys.UPGRADABLE]?.includes('true');

  const setCheckedActionFilter = (checked: boolean) => {
    if (checked) {
      setFilters({
        [EFilterKeys.CONDITION_TYPE]: [EConditionType.OR],
        [EFilterKeys.REVIEW_STATUS]: [EVersionStatus.DRAFT, EVersionStatus.APPROVED],
        [EFilterKeys.UPGRADABLE]: ['true'],
      });
    } else {
      const reviewStatus = filters[EFilterKeys.REVIEW_STATUS].filter(
        (value) => ![EVersionStatus.DRAFT, EVersionStatus.APPROVED].includes(value as typeof EVersionStatus.APPROVED)
      );
      setFilters({
        ...omit(filters, [EFilterKeys.UPGRADABLE, EFilterKeys.REVIEW_STATUS]),
        ...(reviewStatus.length > 0 ? { [EFilterKeys.REVIEW_STATUS]: reviewStatus } : {}),
      });
    }
  };
  const [uploading, setUploading] = useState(false);
  const addBlockletDialogRef = useRef<{ open: (options: any) => void }>(null);
  const openCreateDialog = useCallback(() => {
    addBlockletDialogRef.current!.open({
      onConfirm: async () => {
        try {
          await reload();
        } catch (error) {
          Toast.error(formatError(error));
        }
      },
    });
  }, [reload]);

  const onUpload = async () => {
    try {
      const file = await new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/zip';
        input.onchange = (e) => {
          const blob = (e.target as HTMLInputElement).files?.[0];
          if (blob) {
            resolve(blob);
          }
        };
        input.click();
      });
      setUploading(true);
      const form = new FormData();
      form.append('blocklet-release', file as Blob);
      await lazyApi.post('/api/blocklets/upload', form).then((res) => res.data);
      Toast.success(t('developer.uploadSuccess'));
      setUploading(false);
      reload();
    } catch (error: any) {
      setUploading(false);
      const errors = (error.response?.data?.error || error.response?.data?.message || error.message).split('\n');
      Toast.error(
        <Box>
          {errors.map((item) => (
            <Box key={item}>{item}</Box>
          ))}
        </Box>
      );
      throw error;
    }
  };

  return loading && !data ? (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50vh',
      }}>
      <CircularProgress />
    </Box>
  ) : (
    <Box>
      <Title title={t('common.blocklet')}>
        <Tooltip title={t('common.refresh')}>
          <IconButton onClick={debounce(() => reload(), 300)}>
            <Icon icon={Refresh} width={18} height={18} />
          </IconButton>
        </Tooltip>
        <Button disabled={uploading} variant="outlined" color="primary" onClick={onUpload}>
          {uploading && <CircularProgress size={14} sx={{ mr: 0.5 }} />} {t('common.upload')}
        </Button>
        <Button disabled={uploading} variant="contained" color="primary" onClick={openCreateDialog}>
          {t('common.add')}
        </Button>
      </Title>
      <AddBlockletDialog ref={addBlockletDialogRef} />
      <ToolBar
        hasFilter={hasFilter}
        sortGroups={sortGroups}
        filterGroups={filterGroups}
        freeText={freeText}
        filters={filters}
        onFreeTextChange={setFreeText}
        onFilterChange={setFilters}
        sort={sort}
        loading={loading || loadingMore}
        onSortChange={setSort}
        total={data?.total || 0}
        displayCount={data?.displayCount || 0}
        checkedActionFilter={checkedActionFilter}
        onCheckedActionFilterChange={setCheckedActionFilter}
      />
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '20vh',
          }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
              mt: 3,
              maxWidth: 'calc(100vw - 32px)',
            }}>
            {list.map((blocklet) => (
              <BlockletCard key={blocklet.id} blocklet={blocklet} sortName={sort.name} avatar={false} />
            ))}
          </Box>

          {(loading || loadingMore) && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 2,
                pb: 2,
              }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {noMore && list.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 2,
                pb: 2,
              }}>
              <Typography
                sx={{
                  color: 'text.secondary',
                }}>
                {t('common.noMore')}
              </Typography>
              <NotFoundTips color="text.secondary" />
            </Box>
          )}

          {list.length === 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '30vh',
              }}>
              <Typography
                variant="h6"
                sx={{
                  color: 'text.hint',
                  textAlign: 'center',
                }}>
                {t('common.noResults')}
              </Typography>
              <NotFoundTips />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
