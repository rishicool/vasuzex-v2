/**
 * File Logger
 * File-based logger with rotation support
 */

import { Logger } from '../Logger.js';
import fs from 'fs';
import path from 'path';

export class FileLogger extends Logger {
  constructor(options = {}) {
    super();
    this.path = options.path || 'storage/logs';
    this.filename = options.filename || 'app.log';
    this.minLevel = options.level || 'debug';
    this.maxFiles = options.days || 7;
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

    this.ensureLogDirectory();
  }

  log(level, message, context = {}) {
    if (this.levels[level] > this.levels[this.minLevel]) {
      return;
    }

    const timestamp = new Date().toISOString();
    const formatted = this.format(level, message, context, timestamp);
    const logFile = this.getLogFile();

    fs.appendFileSync(logFile, formatted + '\n', 'utf8');
  }

  format(level, message, context, timestamp) {
    const contextStr = Object.keys(context).length > 0 
      ? ' ' + JSON.stringify(context)
      : '';
    
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  getLogFile() {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.path, `${this.filename}-${date}.log`);
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.path)) {
      fs.mkdirSync(this.path, { recursive: true });
    }
  }
}

export default FileLogger;
