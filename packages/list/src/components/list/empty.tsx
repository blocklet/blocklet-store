import Box from '@mui/material/Box';
import UXEmpty from '@arcblock/ux/lib/Empty';
import Typography from '@mui/material/Typography';

import { useListContext } from '../../contexts/list';

function CustomEmpty({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        mt: 2,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.hint',
      }}>
      <UXEmpty />
      {children}
    </Box>
  );
}

function NoResults() {
  const { t } = useListContext();

  return (
    <Typography style={{ textAlign: 'center' }} variant="subtitle2">
      {t('blocklet.noResults')}
    </Typography>
  );
}

function NoResultsTips({ filterTip = false, keywordTip = false }: { filterTip?: boolean; keywordTip?: boolean }) {
  const { t, locale } = useListContext();

  const getSplit = () => {
    if (locale === 'zh') return '、';
    return ' , ';
  };
  return (
    <Box
      sx={{
        mt: 1,
        display: 'flex',
      }}>
      <Typography style={{ marginRight: '16px' }}>{t('blocklet.emptyTip')}</Typography>
      {filterTip && <Typography>{t('blocklet.filterTip')}</Typography>}
      {filterTip && keywordTip && getSplit()}
      {keywordTip && <Typography>{t('blocklet.keywordTip')}</Typography>}
    </Box>
  );
}

function EmptyTitle({
  primaryStart,
  primaryEnd,
  filter,
}: {
  primaryStart: string;
  primaryEnd: string;
  filter: string;
}) {
  return (
    <Typography
      variant="subtitle2"
      sx={{
        display: 'flex',
        gap: 0.5,
        mx: 0.5,
      }}>
      <Typography>{primaryStart}</Typography>
      <Typography
        title={filter}
        color="primary"
        sx={{ maxWidth: '30vw', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {filter}
      </Typography>
      <Typography>{primaryEnd} </Typography>
    </Typography>
  );
}

export default function Empty() {
  const { t, search, getCategoryLocale, selectedCategory } = useListContext();
  const { filters } = search;

  const showFilterTip = !!selectedCategory || !!filters.price;

  if (filters.keyword && showFilterTip) {
    return (
      <CustomEmpty>
        <EmptyTitle
          primaryStart={t('blocklet.noBlockletPart1')}
          primaryEnd={t('blocklet.noBlockletPart2')}
          filter={filters.keyword}
        />
        <NoResultsTips keywordTip filterTip />
      </CustomEmpty>
    );
  }

  if (filters.keyword) {
    return (
      <CustomEmpty>
        <EmptyTitle
          primaryStart={t('blocklet.noBlockletPart1')}
          primaryEnd={t('blocklet.noBlockletPart2')}
          filter={filters.keyword}
        />
        <NoResultsTips keywordTip />
      </CustomEmpty>
    );
  }
  if (showFilterTip) {
    const categoryLocale = getCategoryLocale(selectedCategory);
    return (
      <CustomEmpty>
        {categoryLocale ? (
          <EmptyTitle
            primaryStart={t('blocklet.noCategoryResults1')}
            primaryEnd={t('blocklet.noCategoryResults2')}
            filter={categoryLocale}
          />
        ) : (
          <NoResults />
        )}
        <NoResultsTips filterTip />
      </CustomEmpty>
    );
  }

  return (
    <CustomEmpty>
      <NoResults />
    </CustomEmpty>
  );
}
