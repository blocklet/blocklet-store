import StoreLogo from '@arcblock/icons/lib/StoreLogo';
import { ErrorFallback } from '@arcblock/ux/lib/ErrorBoundary';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { Autocomplete, useSearch } from '@blocklet/list';
import Footer from '@blocklet/ui-react/lib/Footer';
import Header from '@blocklet/ui-react/lib/Header';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider, useTheme } from '@mui/material';
import { ErrorBoundary } from 'react-error-boundary';
import { useLocation, useNavigate } from 'react-router-dom';
import { joinURL, parseQuery, withQuery } from 'ufo';
import useBrowser from '@arcblock/react-hooks/lib/useBrowser';
import { getUrlPrefix } from '../../libs/util';

export default function Layout({
  loading = false,
  error = null,
  children,
}: {
  loading?: boolean;
  error?: React.ReactNode;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, locale } = useLocaleContext();
  const { prefix } = getUrlPrefix();
  const isHomePage = location.pathname === joinURL(prefix, 'search');
  const search = useSearch(parseQuery(location.search), {
    onFilterChange: (filters) => {
      if (isHomePage || filters.keyword) {
        navigate(joinURL(prefix, withQuery('search', filters)));
      }
    },
    onSearchSelect: (option) => {
      navigate(joinURL(prefix, 'blocklets', option.did!));
    },
  });

  const browser = useBrowser();
  const isArcSphereClient = browser.arcSphere;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        '.header-addons': {
          gap: { xs: 0.8, md: 2 },
        },
      }}>
      <Header
        maxWidth={false}
        bordered
        // eslint-disable-next-line react/no-unstable-nested-components
        addons={(items) => {
          return (
            <>
              {!isArcSphereClient && (
                <ThemeProvider theme={theme}>
                  <Autocomplete
                    locale={locale}
                    endpoint={prefix}
                    autoFocus={isHomePage}
                    sx={{
                      display: { md: 'block', xs: 'none' },
                      mr: 1,
                      width: '350px',
                    }}
                    t={t}
                    filters={search.filters}
                    handleKeyword={search.handleKeyword}
                    handleSearchSelect={search.handleSearchSelect}
                  />
                </ThemeProvider>
              )}
              {items}
            </>
          );
        }}
      />
      <Container
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          mb: 3,
          '.blockletInfo .MuiListItemText-primary': { fontWeight: 'fontWeightBold' },
        }}>
        {loading && (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {error}
          </Box>
        )}
        {!(loading || error) && (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}>
            <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[location.pathname]}>
              {children}
            </ErrorBoundary>
          </Box>
        )}
      </Container>
      {/* @ts-ignore $FixMe */}
      <Footer theme={theme} meta={{ appLogo: <StoreLogo style={{ width: 'auto', height: 44 }} /> }} />
    </Box>
  );
}
