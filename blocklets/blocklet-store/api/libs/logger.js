/* eslint-disable no-console */
const Sentry = require('@sentry/node');
const logger = require('@blocklet/logger');

const rewriteError = (e, stringify = true) => {
  if (e instanceof Error || (typeof e === 'object' && e.error instanceof Error)) {
    const error = e instanceof Error ? e : e.error;
    const other = e.error instanceof Error ? { ...e, error: undefined } : {};
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      details: (error.errors && (stringify ? JSON.stringify(error.errors) : error.errors)) || null,
      ...other,
    };
  }
  return e;
};

const testLogger = {
  log: console.log,
  debug: console.log,
  info: console.log,
  error: (...args) => console.log(...args.map((e) => rewriteError(e, false))),
  warn: console.warn,
};

const rewriteLogger =
  (func) =>
  (...args) => {
    if (args.length > 0 && typeof args[0] === 'string') {
      Sentry.captureMessage(args[0]);
    }

    if (args.length > 1 && typeof args[1] === 'object' && args[1].error instanceof Error) {
      Sentry.captureException(args[1].error);
    }

    func(...args.map((e) => rewriteError(e)));
  };

const init = () => {
  const instance = logger('Store');

  if (process.env.SENTRY_DSN) {
    instance.warn = rewriteLogger(instance.warn);
    instance.error = rewriteLogger(instance.error);
  }
  return instance;
};

module.exports = process.env.NODE_ENV === 'e2e' || process.env.CONSOLE_LOG === 'true' ? testLogger : init();

module.exports.setupAccessLogger = logger.setupAccessLogger;
