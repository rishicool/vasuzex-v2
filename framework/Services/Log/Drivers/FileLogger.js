/**
 * File Logger
 * File-based logger with rotation support and async writing
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
    this.maxFiles = options.days || 14; // Keep logs for 14 days
    this.rotation = options.rotation || 'daily'; // daily, weekly, size
    this.maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB default
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
    this.cleanOldLogs();
  }

  async log(level, message, context = {}) {
    if (this.levels[level] > this.levels[this.minLevel]) {
      return;
    }

    const timestamp = new Date().toISOString();
    const formatted = this.format(level, message, context, timestamp);
    const logFile = this.getLogFile(level);

    try {
      // Check if rotation is needed based on size
      if (this.rotation === 'size' && fs.existsSync(logFile)) {
        const stats = fs.statSync(logFile);
        if (stats.size >= this.maxSize) {
          await this.rotateFile(logFile);
        }
      }

      // Append to log file asynchronously
      await fs.promises.appendFile(logFile, formatted + '\n', 'utf8');
    } catch (error) {
      console.error(`Failed to write to log file: ${error.message}`);
    }
  }

  format(level, message, context, timestamp) {
    const contextStr = Object.keys(context).length > 0 
      ? ' ' + JSON.stringify(context)
      : '';
    
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  getLogFile(level) {
    let filename;

    switch (this.rotation) {
      case 'daily':
        const date = new Date().toISOString().split('T')[0];
        filename = `${this.filename}-${date}.log`;
        break;
      
      case 'weekly':
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        const weekStr = weekStart.toISOString().split('T')[0];
        filename = `${this.filename}-week-${weekStr}.log`;
        break;
      
      case 'level':
        filename = `${level}.log`;
        break;
      
      default:
        filename = this.filename;
    }

    return path.join(this.path, filename);
  }

  async rotateFile(logFile) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rotatedFile = logFile.replace('.log', `-${timestamp}.log`);
    
    try {
      await fs.promises.rename(logFile, rotatedFile);
    } catch (error) {
      console.error(`Failed to rotate log file: ${error.message}`);
    }
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.path)) {
      fs.mkdirSync(this.path, { recursive: true });
    }
  }

  cleanOldLogs() {
    if (!fs.existsSync(this.path)) return;

    try {
      const files = fs.readdirSync(this.path);
      const now = Date.now();
      const maxAge = this.maxFiles * 24 * 60 * 60 * 1000; // Convert days to milliseconds

      files.forEach(file => {
        const filePath = path.join(this.path, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtime.getTime();

        if (age > maxAge) {
          fs.unlinkSync(filePath);
        }
      });
    } catch (error) {
      console.error(`Failed to clean old logs: ${error.message}`);
    }
  }
}

export default FileLogger;
