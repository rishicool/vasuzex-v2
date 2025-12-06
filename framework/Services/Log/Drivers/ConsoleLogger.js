/**
 * Console Logger
 * Enhanced console-based logger with colored output
 */

import { Logger } from '../Logger.js';
import chalk from 'chalk';

export class ConsoleLogger extends Logger {
  constructor(options = {}) {
    super();
    this.minLevel = options.level || 'debug';
    this.useColors = options.colors !== false; // Default to true
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

    // Color mapping for different log levels
    this.colors = {
      emergency: chalk.bgRed.white.bold,
      alert: chalk.red.bold,
      critical: chalk.red.bold,
      error: chalk.red,
      warning: chalk.yellow,
      notice: chalk.blue,
      info: chalk.green,
      debug: chalk.gray
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
      ? ' ' + JSON.stringify(context, null, 2)
      : '';
    
    if (this.useColors) {
      const colorFn = this.colors[level] || chalk.white;
      const levelStr = colorFn(`[${level.toUpperCase()}]`);
      const timeStr = chalk.gray(`[${timestamp}]`);
      const msgStr = level === 'error' || level === 'emergency' || level === 'alert' || level === 'critical'
        ? chalk.red(message)
        : message;
      const ctxStr = contextStr ? chalk.cyan(contextStr) : '';
      
      return `${timeStr} ${levelStr}: ${msgStr}${ctxStr}`;
    }
    
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }
}

export default ConsoleLogger;
