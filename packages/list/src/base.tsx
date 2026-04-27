import { ErrorFallback } from '@arcblock/ux/lib/ErrorBoundary';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Aside from './components/aside/aside';
import Explore from './components/explore';
import BlockletList from './components/list';
import TitleBar from './components/title-bar';
import { AsideProvider } from './contexts/aside';
import { useListContext } from './contexts/list';

interface IListBaseProps {
  menus?: IAsideMenu[];
  children?: IListProps['children'];
}

function ListBase({ menus = [], children = undefined }: IListBaseProps) {
  const { search, layout, compact } = useListContext();
  const { filters } = search;
  const listWrapperRef = useRef<HTMLDivElement>(null);

  const hasFilter = filters.category || filters.keyword || filters.price;
  const customRenderKey = menus.find((menu) => menu.key === filters.menu)?.key;

  return (
    <AsideProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {!compact && <TitleBar />}
        <Box
          ref={listWrapperRef}
          className="list-container"
          sx={{
            display: 'flex',
            height: '100%',
            pt: { xs: 0, md: compact ? 0 : 5 },
          }}>
          <Aside menus={menus} />
          <Stack
            sx={[
              {
                height: '100%',
                position: 'relative',
                flex: 1,
              },
              compact
                ? {
                    overflowY: 'auto',
                    ml: -2,
                    pr: 1,
                    pb: 2,
                  }
                : { overflow: 'visible' },
            ]}>
            {customRenderKey && children?.(customRenderKey)}
            {!customRenderKey && (layout.showExplore && !hasFilter ? <Explore /> : <BlockletList />)}
          </Stack>
        </Box>
      </ErrorBoundary>
    </AsideProvider>
  );
}

export default ListBase;
