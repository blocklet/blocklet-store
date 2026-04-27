import { ConfigProvider } from '@arcblock/ux/lib/Config';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { SessionProvider } from './contexts/session';
import { themeConfig } from './libs/theme';
import { translations } from './libs/translations';
import Home from './pages/home';

function App() {
  return (
    <SessionProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Home />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </SessionProvider>
  );
}

export default function WarpperApp() {
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
      locale={window.blocklet.locale}
      onLoadingTranslation={() => {}}
      injectFirst>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  );
}
