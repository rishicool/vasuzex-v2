/**
 * Log Facade
 * Enhanced to support standalone scripts without Application instance
 */

import { Facade, createFacade } from './Facade.js';

class LogFacade extends Facade {
  static getFacadeAccessor() {
    return 'log';
  }

  /**
   * Fallback logging methods for standalone scripts
   */
  static log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ' ' + JSON.stringify(data) : '';
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`);
  }

  static debug(message, data = null) {
    if (this.app) {
      try {
        const instance = this.getFacadeRoot();
        return instance.debug(message, data);
      } catch (error) {
        // Fall through to standalone mode
      }
    }
    // Standalone: Only log debug in verbose mode
    if (process.env.LOG_LEVEL === 'debug' || process.env.DEBUG) {
      this.log('debug', message, data);
    }
  }

  static info(message, data = null) {
    if (this.app) {
      try {
        const instance = this.getFacadeRoot();
        return instance.info(message, data);
      } catch (error) {
        // Fall through to standalone mode
      }
    }
    this.log('info', message, data);
  }

  static warn(message, data = null) {
    if (this.app) {
      try {
        const instance = this.getFacadeRoot();
        return instance.warn(message, data);
      } catch (error) {
        // Fall through to standalone mode
      }
    }
    this.log('warn', message, data);
  }

  static error(message, data = null) {
    if (this.app) {
      try {
        const instance = this.getFacadeRoot();
        return instance.error(message, data);
      } catch (error) {
        // Fall through to standalone mode
      }
    }
    this.log('error', message, data);
  }
}

export default createFacade(LogFacade);
