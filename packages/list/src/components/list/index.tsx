import { ErrorFallback } from '@arcblock/ux/lib/ErrorBoundary';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { useListContext } from '../../contexts/list';
import AsideFilter from '../aside/aside-filter';
import FilterBar from '../filter-bar';
import Loading from '../loading';
import Media from '../media';
import Empty from './empty';
import useList from './use-list';
import { formatError } from '../../libs/utils';

export default function BlockletList() {
  const { t, search, endpoint, blockletRender, serverVersion, minItemWidth, layout, baseSearch, compact } =
    useListContext();
  const { filters } = search;

  const { blocklets, errors, loadMore, loadings, hasNextPage, total } = useList();

  const [infiniteScrollRef] = useInfiniteScroll({
    loading: loadings.fetchBlockletsLoading || loadings.loadingMore,
    hasNextPage,
    onLoadMore: loadMore,
  });

  if (errors.fetchBlockletsError) {
    const error = new Error(`Failed to fetch blocklets from ${endpoint}: ${formatError(errors.fetchBlockletsError)}`);
    return <ErrorFallback error={error} />;
  }

  const showFilterBar = (baseSearch && layout.showSearch) || !filters.keyword;
  return (
    <>
      {showFilterBar ? (
        <FilterBar />
      ) : (
        <>
          <Media xs={<AsideFilter />} md={null} />
          {renderResultTitle()}
        </>
      )}
      {renderList()}
      {!loadings.fetchBlockletsLoading && hasNextPage && (
        <Box
          ref={infiniteScrollRef}
          sx={{
            height: 70,
            minHeight: 70,
            display: 'flex',
            justifyContent: 'center',
            py: 2,
            overflow: 'hidden',
          }}>
          {loadings.loadingMore ? <CircularProgress /> : null}
        </Box>
      )}
    </>
  );

  function renderList() {
    if (loadings.fetchBlockletsLoading) {
      return <Loading mt={15} />;
    }
    return blocklets.length ? (
      <Box
        className="blocklet-list"
        sx={{
          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',
            sm: `repeat(auto-fill, minmax(${minItemWidth}px, 1fr))`,
          },

          p: '2px',
          rowGap: 2,
          columnGap: compact ? 0 : 2,
        }}>
        {blocklets.map((blocklet) => (
          <Box
            key={blocklet.did}
            data-blocklet-did={blocklet.did}
            sx={{
              minWidth: {
                xs: '100%',
                sm: minItemWidth,
              },

              maxWidth: 'calc(100vw - 32px)',
            }}>
            {blockletRender({ blocklet, blocklets, serverVersion })}
          </Box>
        ))}
      </Box>
    ) : (
      <Empty />
    );
  }

  function renderResultTitle() {
    return (
      <Stack
        direction="row"
        className="search-result-title"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          mt: { xs: 2, md: 0 },
        }}>
        <Typography
          variant="h3"
          title={filters.keyword}
          sx={{
            maxWidth: '50vw',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
          {t('blocklet.search', { keyword: filters.keyword })}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'text.hint',
            fontSize: 13,
          }}>
          {t('blocklet.resultCount', { count: total })}
        </Typography>
      </Stack>
    );
  }
}
