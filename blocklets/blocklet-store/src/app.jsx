import { useTheme } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import { lazy, Suspense, useEffect, useMemo } from 'react';

import { ConfigProvider } from '@arcblock/ux/lib/Config';
import { ToastProvider } from '@arcblock/ux/lib/Toast';
import withTracker from '@arcblock/ux/lib/withTracker';
import { css, Global } from '@emotion/react';
import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import { joinURL } from 'ufo';

import Center from '@arcblock/ux/lib/Center';
import CookieConsent from '@arcblock/ux/lib/CookieConsent';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { get } from 'lodash-es';

import { DeveloperProvider } from './contexts/developer';
import { SessionProvider } from './contexts/session';

import PrivateRoute from './components/private-route';
import { themeConfig } from './libs/theme';
import { translations } from './locales';

const BlockletListPage = lazy(() => import('./pages/home/index'));
const BlockletDetailPage = lazy(() => import('./pages/blocklets/detail/index'));
const ProfilePage = lazy(() => import('./pages/profile'));
const ConnectCliPage = lazy(() => import('./pages/connect/connect-cli'));
const GenKeyPair = lazy(() => import('./pages/connect/gen-key-pair'));
const ConnectStudio = lazy(() => import('./pages/connect/connect-studio'));
const JoinPage = lazy(() => import('./pages/join'));
const DeveloperAccessTokenPage = lazy(() => import('./pages/developer/access-token'));
const DeveloperBlockletListPage = lazy(() => import('./pages/developer/blocklet-list'));
const AdminBlockletListPage = lazy(() => import('./pages/admin/blocklet-list'));
const CategoryListPage = lazy(() => import('./pages/admin/category-list'));

function InjectGlobalStyles() {
  const theme = useTheme();

  const globalStyles = useMemo(() => {
    const isLight = theme.palette.mode === 'light';
    const lightScrollStyle = css`
      @media (min-width: ${theme.breakpoints.values.md}px) {
        body {
          overflow-y: scroll;
          overflow-x: hidden;
        }
        body::-webkit-scrollbar {
          width: 10px;
        }
        body::-webkit-scrollbar-track {
          background: white;
        }
        body::-webkit-scrollbar-thumb {
          background: #eee;
          border-radius: 10px;
        }
        body::-webkit-scrollbar-thumb:hover {
          background: #ddd;
        }
      }
    `;

    return css`
      body {
        overflow-y: auto;
        overflow-x: hidden;
      }
      ${isLight ? lightScrollStyle : ''}
      a {
        color: ${theme.palette.primary.main};
        text-decoration: none !important;
      }
      a:hover,
      a:hover * {
        text-decoration: none !important;
      }

      --tags-tag-green-bg: #d1fae5;
      --tags-tag-green-border: #a7f3d0;
      --tags-tag-green-text: #047857;

      --tags-tag-red-bg: #ffe4e6;
      --tags-tag-red-border: #fecdd3;
      --tags-tag-red-text: #be123c;

      --tags-tag-orange-bg: #fef4c7;
      --tags-tag-orange-border: #fde68a;
      --tags-tag-orange-text: #b45309;

      --backgrounds-bg-component: #f1f3f5;
      --stroke-border-base: #eff1f5;
      --foregrounds-fg-subtle: #4b5563;

      .SnackbarContent-root.SnackbarItem-contentRoot {
        border-radius: 8px;
        box-shadow: none;
      }
      .SnackbarContent-root.SnackbarItem-variantSuccess {
        color: var(--tags-tag-green-text);
        background-color: var(--tags-tag-green-bg);
        border: 1px solid var(--tags-tag-green-border);
      }
      .SnackbarContent-root.SnackbarItem-variantError {
        color: var(--tags-tag-red-text);
        background-color: var(--tags-tag-red-bg);
        border: 1px solid var(--tags-tag-red-border);
      }
      .SnackbarContent-root.SnackbarItem-variantWarning {
        color: var(--tags-tag-orange-text);
        background-color: var(--tags-tag-orange-bg);
        border: 1px solid var(--tags-tag-orange-border);
      }
      .SnackbarContent-root.SnackbarItem-variantInfo {
        color: var(--foregrounds-fg-subtle);
        background-color: var(--backgrounds-bg-component);
        border: 1px solid var(--stroke-border-base);
      }
    `;
  }, [theme]);

  return <Global styles={globalStyles} />;
}

const fallback = (
  <Center>
    <CircularProgress />
  </Center>
);

function InsideApp() {
  const { locale } = useLocaleContext();
  const location = useLocation();

  useEffect(() => {
    document.cookie = `nf_lang=${locale};`;
  }, [locale]);

  dayjs.locale(locale === 'zh' ? 'zh-cn' : locale);
  dayjs.extend(LocalizedFormat);
  dayjs.extend(relativeTime);

  useEffect(() => {
    if (window.tracker && typeof window.tracker.pageView === 'function') {
      window.tracker.pageView(joinURL(window.blocklet.prefix, `${location.pathname}${location.search}`));
    }
  }, [location]);

  return (
    <>
      <InjectGlobalStyles />
      <Suspense fallback={fallback}>
        <Routes>
          <Route path="/" element={<BlockletListPage />} />
          <Route path="/search" element={<BlockletListPage />} />
          <Route path="/category/:category" element={<BlockletListPage />} />
          <Route path="/blocklets/:did/:version?" element={<BlockletDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/blocklet/:did" element={<BlockletDetailPage />} />
          <Route path="/connect-cli" element={<ConnectCliPage />} />
          <Route path="/gen-key-pair" element={<GenKeyPair />} />
          <Route path="/connect-studio" element={<ConnectStudio />} />
          {window.blocklet?.preferences?.permissionMode === 'staking' && <Route path="/join" element={<JoinPage />} />}
          <Route element={<PrivateRoute />}>
            <Route path="/developer/blocklets" element={<DeveloperBlockletListPage />} />
            <Route path="/developer/access-tokens" element={<DeveloperAccessTokenPage />} />
            <Route path="/console/blocklets" element={<AdminBlockletListPage />} />
            <Route path="/console/categories" element={<CategoryListPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <CookieConsent locale={locale} />
    </>
  );
}

export function App() {
  return (
    <SessionProvider serviceHost={get(window, 'blocklet.prefix', '/')} protectedRoutes={[]}>
      <DeveloperProvider>
        <ToastProvider>
          <InsideApp />
        </ToastProvider>
      </DeveloperProvider>
    </SessionProvider>
  );
}

const AppWithTracker = withTracker(App);

// eslint-disable-next-line func-names
export default function () {
  let basename = '/';
  if (window.blocklet && window.blocklet.prefix) {
    basename = window.blocklet.prefix;
  }

  return (
    <ConfigProvider
      theme={themeConfig}
      translations={translations}
      languages={window.blocklet.languages}
      fallbackLocale="en"
      injectFirst>
      <Router basename={basename}>
        <AppWithTracker />
      </Router>
    </ConfigProvider>
  );
}
