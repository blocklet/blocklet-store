import { ErrorFallback } from '@arcblock/ux/lib/ErrorBoundary';
import Dashboard from '@blocklet/ui-react/lib/Dashboard';
import { css } from '@emotion/react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import PropTypes from 'prop-types';
import { ErrorBoundary } from 'react-error-boundary';
import { useLocation } from 'react-router-dom';

export default function Layout({ loading = false, error = null, children = null, ...rest }) {
  const location = useLocation();

  const cssMap = {
    body: css`
      flex: 1;
      display: flex;
      padding-top: 16px;
    `,
    main: css`
      flex: 1;
      padding: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    `,
  };

  return (
    <Dashboard legacy={false} title={window.blocklet.appName} fullWidth {...rest}>
      <div css={cssMap.body}>
        <div css={cssMap.main}>
          <Box css={cssMap.main}>
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
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[location.pathname]}>
                  {children}
                </ErrorBoundary>
              </Box>
            )}
          </Box>
        </div>
      </div>
    </Dashboard>
  );
}

Layout.propTypes = {
  children: PropTypes.any,
  loading: PropTypes.bool,
  error: PropTypes.any,
};
