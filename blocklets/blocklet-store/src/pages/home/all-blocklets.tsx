import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Toast from '@arcblock/ux/lib/Toast';
import Refresh from '@iconify-icons/tabler/refresh';
import { Icon } from '@iconify/react';
import { Box, CircularProgress, IconButton, Typography } from '@mui/material';
import { useInfiniteScroll } from 'ahooks';
import { debounce, omit } from 'lodash-es';
import { useCallback, useEffect, useMemo } from 'react';
import { joinURL, withQuery } from 'ufo';
import Tooltip from '../../components/tooltip';
import { EConditionType, EFilterKeys, EReviewType, EVersionStatus, EWaitActions } from '../../constants';
import { useSessionContext } from '../../contexts/session';
import useCustomEvent, { ECustomEvent } from '../../hooks/use-custom-event';
import { useUrlState } from '../../hooks/use-url-state';
import { lazyApi } from '../../libs/api';
import { formatError, getUrlPrefix } from '../../libs/util';
import BlockletCard from './components/blocklet-card';
import Title from './components/title';
import ToolBar from './components/tool-bar';
import { getFilterGroups, getSortGroups, isPendingReview, sortBlocklet } from './utils';
import { useReviewMessage } from '../../hooks/use-subscription';
import NotFoundTips from '../../components/not-found-tips';

const PAGE_SIZE = 20;

export default function AllBlocklets() {
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
        withQuery(joinURL(apiPrefix, '/api/console/blocklets'), {
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
        const pendingReview = isPendingReview(blocklet);
        return {
          ...blocklet,
          actions: pendingReview ? [EWaitActions.REVIEW] : [],
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

  const { events } = useSessionContext();
  useEffect(() => {
    events.on('switch-did', reload);
    return () => {
      events.off('switch-did', reload);
    };
  }, [reload, events]);

  const hasFilter = Object.keys(filters).some((key) => key !== EFilterKeys.CONDITION_TYPE);
  const list = useMemo(() => data?.list || [], [data]);
  const sortedList = useMemo(() => {
    return [...list].sort((blockletA, blockletB) => sortBlocklet(sort, blockletA, blockletB));
  }, [list, sort]);

  const sortGroups = useMemo(() => getSortGroups(t), [t]);
  const filterGroups = useMemo(
    () =>
      getFilterGroups(t).concat([
        {
          key: EFilterKeys.IS_OFFICIAL,
          title: t('blocklet.isOfficial'),
          items: [
            {
              label: t('common.yes'),
              value: 'true',
            },
            {
              label: t('common.no'),
              value: 'false',
            },
          ],
        },
        {
          key: EFilterKeys.REVIEW_TYPE,
          title: t('blocklet.reviewType'),
          items: [
            {
              label: t('blocklet.reviewFirstVersion'),
              value: EReviewType.FIRST,
            },
            {
              label: t('blocklet.reviewEveryVersion'),
              value: EReviewType.EACH,
            },
          ],
        },
      ]),
    [t]
  );

  const checkedActionFilter =
    filters[EFilterKeys.CONDITION_TYPE]?.includes(EConditionType.OR) &&
    filters[EFilterKeys.REVIEW_STATUS]?.includes(EVersionStatus.PENDING_REVIEW) &&
    filters[EFilterKeys.REVIEW_STATUS]?.includes(EVersionStatus.IN_REVIEW);

  const handleCheckedActionFilterChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        setFilters({
          [EFilterKeys.CONDITION_TYPE]: [EConditionType.OR],
          [EFilterKeys.REVIEW_STATUS]: [EVersionStatus.PENDING_REVIEW, EVersionStatus.IN_REVIEW],
        });
      } else {
        const reviewStatus = filters[EFilterKeys.REVIEW_STATUS]?.filter(
          (value) => ![EVersionStatus.PENDING_REVIEW, EVersionStatus.IN_REVIEW].includes(value as EVersionStatus)
        );
        setFilters({
          ...omit(filters, [EFilterKeys.UPGRADABLE, EFilterKeys.REVIEW_STATUS]),
          ...(reviewStatus?.length ? { [EFilterKeys.REVIEW_STATUS]: reviewStatus } : {}),
        });
      }
    },
    [filters, setFilters]
  );

  return (
    <Box>
      <Title title={t('common.blocklets')}>
        <Tooltip title={t('common.refresh')}>
          <IconButton onClick={debounce(() => reload(), 300)}>
            <Icon icon={Refresh} width={18} height={18} />
          </IconButton>
        </Tooltip>
      </Title>
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
        onCheckedActionFilterChange={handleCheckedActionFilterChange}
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
            {sortedList.map((blocklet) => (
              <BlockletCard key={blocklet.id} blocklet={blocklet} sortName={sort.name} openNewTab />
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
