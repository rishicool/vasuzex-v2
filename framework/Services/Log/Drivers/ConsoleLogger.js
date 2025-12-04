/**
 * Console Logger
 * Simple console-based logger
 */

import { Logger } from '../Logger.js';

export class ConsoleLogger extends Logger {
  constructor(options = {}) {
    super();
    this.minLevel = options.level || 'debug';
    this.levels = {
      emergency: 0,
      alert: 1,
      critical: 2,
      error: 3,
      warning: 4,
      notice: 5,
      info: 6,
      debug: 7
    };
  }

  log(level, message, context = {}) {
    if (this.levels[level] > this.levels[this.minLevel]) {
      return;
    }

    const timestamp = new Date().toISOString();
    const formatted = this.format(level, message, context, timestamp);

    switch (level) {
      case 'emergency':
      case 'alert':
      case 'critical':
      case 'error':
        console.error(formatted);
        break;
      case 'warning':
        console.warn(formatted);
        break;
      case 'info':
      case 'notice':
        console.info(formatted);
        break;
      default:
        console.log(formatted);
    }
  }

  format(level, message, context, timestamp) {
    const contextStr = Object.keys(context).length > 0 
      ? ' ' + JSON.stringify(context)
      : '';
    
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }
}

export default ConsoleLogger;
