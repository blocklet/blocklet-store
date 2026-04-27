import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';
import useBrowser from '@arcblock/react-hooks/lib/useBrowser';
import { useAsideContext } from '../contexts/aside';
import { useListContext } from '../contexts/list';
import IconButton from './icon-button';
import Autocomplete from './autocomplete';

export default function TitleBar() {
  const { t, selectedCategory, getCategoryLocale, locale, search } = useListContext();
  const { toggleOpen } = useAsideContext();

  const browser = useBrowser();
  const isArcSphereClient = browser.arcSphere;
  const hasBottomNavigation = !!window.blocklet?.navigation?.some((item) => item.section === 'bottomNavigation');

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <Typography
        variant="body1"
        sx={{
          display: { xs: 'flex', md: 'none' },
          alignItems: 'center',
          gap: 1,
          py: 2,
          fontWeight: 'fontWeightMedium',
        }}>
        <IconButton onClick={() => toggleOpen(true)}>
          <MenuIcon />
        </IconButton>
        {getCategoryLocale(selectedCategory!) || t('common.category')}
      </Typography>
      {isArcSphereClient && hasBottomNavigation && (
        <Autocomplete
          locale={locale!}
          endpoint={window.blocklet?.prefix || '/'}
          sx={{ display: { md: 'block', xs: 'none' }, mr: 1, width: '350px' }}
          t={t}
          filters={search.filters}
          handleKeyword={search.handleKeyword}
          handleSearchSelect={search.handleSearchSelect}
        />
      )}
    </Box>
  );
}
