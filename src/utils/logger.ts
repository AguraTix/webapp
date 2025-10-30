/**
 * Production-safe logger utility
 * Automatically removes console statements in production builds
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

export const logger = {
  /**
   * Log general information (only in development)
   */
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log errors (always logged, but sanitized in production)
   */
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    } else {
      // In production, log errors to external service or simplified format
      console.error('An error occurred');
    }
  },

  /**
   * Log warnings (only in development)
   */
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Log debug information (only in development)
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  /**
   * Log information (only in development)
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  /**
   * Group console logs (only in development)
   */
  group: (label: string) => {
    if (isDevelopment) {
      console.group(label);
    }
  },

  /**
   * End console group (only in development)
   */
  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },

  /**
   * Log table data (only in development)
   */
  table: (data: any) => {
    if (isDevelopment) {
      console.table(data);
    }
  },

  /**
   * Time measurement start (only in development)
   */
  time: (label: string) => {
    if (isDevelopment) {
      console.time(label);
    }
  },

  /**
   * Time measurement end (only in development)
   */
  timeEnd: (label: string) => {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  }
};

/**
 * API request logger for debugging
 */
export const apiLogger = {
  request: (method: string, url: string, data?: any) => {
    if (isDevelopment) {
      console.group(`🚀 API ${method.toUpperCase()} ${url}`);
      if (data) console.log('Request data:', data);
      console.groupEnd();
    }
  },

  response: (method: string, url: string, response: any) => {
    if (isDevelopment) {
      console.group(`✅ API ${method.toUpperCase()} ${url} - Success`);
      console.log('Response:', response);
      console.groupEnd();
    }
  },

  error: (method: string, url: string, error: any) => {
    if (isDevelopment) {
      console.group(`❌ API ${method.toUpperCase()} ${url} - Error`);
      console.error('Error:', error);
      console.groupEnd();
    } else {
      // In production, just log that an API error occurred
      console.error(`API ${method.toUpperCase()} request failed`);
    }
  }
};

/**
 * Chart/Analytics logger
 */
export const chartLogger = {
  data: (chartType: string, data: any) => {
    if (isDevelopment) {
      console.group(`📊 Chart Data - ${chartType}`);
      console.table(data);
      console.groupEnd();
    }
  },

  error: (chartType: string, error: any) => {
    if (isDevelopment) {
      console.error(`Chart Error - ${chartType}:`, error);
    }
  }
};

/**
 * Auth logger for debugging authentication
 */
export const authLogger = {
  login: (method: string, userData?: any) => {
    if (isDevelopment) {
      console.group(`🔐 Login - ${method}`);
      if (userData) console.log('User data:', userData);
      console.groupEnd();
    }
  },

  logout: () => {
    if (isDevelopment) {
      console.log('🚪 User logged out');
    }
  },

  error: (action: string, error: any) => {
    if (isDevelopment) {
      console.error(`Auth Error - ${action}:`, error);
    }
  },

  debug: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`[Auth Debug] ${message}`, data);
    }
  }
};

export default logger;