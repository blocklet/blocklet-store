/* eslint-disable react/require-default-props */
import { ErrorFallback } from '@arcblock/ux/lib/ErrorBoundary';
import Footer from '@blocklet/ui-react/lib/Footer';
import Header from '@blocklet/ui-react/lib/Header';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import { ErrorBoundary } from 'react-error-boundary';
import { useLocation } from 'react-router-dom';

export default function Layout({
  loading = false,
  error = null,
  children = null,
}: {
  loading?: boolean;
  error?: any;
  children?: any;
}) {
  const location = useLocation();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
      {/* @ts-ignore */}
      <Header maxWidth={false} />
      <Container
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          '.blockletInfo .MuiListItemText-primary': {
            fontWeight: 'bold',
          },
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
              py: 4,
              display: 'flex',
              flexDirection: 'column',
            }}>
            <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[location.pathname]}>
              {children}
            </ErrorBoundary>
          </Box>
        )}
      </Container>
      {/* @ts-ignore */}
      <Footer />
    </Box>
  );
}
