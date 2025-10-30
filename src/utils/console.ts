/**
 * Production-safe console replacement
 * This will be completely removed in production builds
 */

const isDev = import.meta.env.DEV;

// Create a no-op function for production
const noop = () => {};

// Export console methods that will be removed in production
export const devConsole = {
  log: isDev ? console.log.bind(console) : noop,
  error: isDev ? console.error.bind(console) : noop,
  warn: isDev ? console.warn.bind(console) : noop,
  debug: isDev ? console.debug.bind(console) : noop,
  info: isDev ? console.info.bind(console) : noop,
  table: isDev ? console.table.bind(console) : noop,
  group: isDev ? console.group.bind(console) : noop,
  groupEnd: isDev ? console.groupEnd.bind(console) : noop,
  time: isDev ? console.time.bind(console) : noop,
  timeEnd: isDev ? console.timeEnd.bind(console) : noop,
};

// For critical errors that should always be logged (but sanitized in production)
export const prodSafeError = (message: string, error?: any) => {
  if (isDev) {
    console.error(message, error);
  } else {
    // In production, log only essential error info
    console.error('Application error occurred');
  }
};

export default devConsole;