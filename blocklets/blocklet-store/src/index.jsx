// react-app-polyfill see: https://github.com/facebook/create-react-app/blob/main/packages/react-app-polyfill/README.md#polyfilling-other-language-features
import { createRoot } from 'react-dom/client';
import '@blocklet/tracker';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import 'pace-js/pace';
import 'pace-js/themes/green/pace-theme-minimal.css';
// eslint-disable-next-line import/no-named-as-default
import App from './app';

window.paceOptions = {
  ajax: {
    // Do not track websocket since it could be long poll.
    trackWebSockets: false,
  },
  minTime: 0,
  ghostTime: 0,
};

// appUrl 的默认值统一使用了 http, 如果配置了证书会自动跳转到 https
// 所以 store 在检测 blocklet实际例可用性时，需要解决 http 协议版本不同导致的问题
const el = document.createElement('meta');
el.setAttribute('http-equiv', 'Content-Security-Policy');
el.setAttribute('content', 'upgrade-insecure-requests');
document.head.append(el);

if (window.blocklet && window.blocklet.SENTRY_DSN) {
  Sentry.init({
    dsn: window.blocklet.SENTRY_DSN,
    integrations: [new BrowserTracing()],
    tracesSampleRate: window.blocklet.SENTRY_SAMPLE_RATE,
  });
}

const container = document.getElementById('app');
const root = createRoot(container);

root.render(<App />);
