/**
 * Syslog Logger
 * System logger using syslog protocol (RFC 5424)
 */

import { Logger } from '../Logger.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class SyslogLogger extends Logger {
  constructor(options = {}) {
    super();
    this.facility = options.facility || 'local0';
    this.ident = options.ident || 'vasuzex';
    this.minLevel = options.level || 'info';
    this.useSyslogCommand = options.useSyslogCommand !== false; // Default to true
    
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

    // Syslog priority mapping
    this.priorities = {
      emergency: 'emerg',
      alert: 'alert',
      critical: 'crit',
      error: 'err',
      warning: 'warning',
      notice: 'notice',
      info: 'info',
      debug: 'debug'
    };
  }

  async log(level, message, context = {}) {
    if (this.levels[level] > this.levels[this.minLevel]) {
      return;
    }

    const formatted = this.format(level, message, context);
    const priority = this.priorities[level] || 'info';

    try {
      if (this.useSyslogCommand && process.platform !== 'win32') {
        // Use system logger command (Unix/Linux/macOS)
        await this.logToSyslog(priority, formatted);
      } else {
        // Fallback to console with syslog-style format
        console.log(`<${this.getSyslogPriority(level)}> ${formatted}`);
      }
    } catch (error) {
      console.error(`Failed to write to syslog: ${error.message}`);
    }
  }

  format(level, message, context) {
    const timestamp = new Date().toISOString();
    const contextStr = Object.keys(context).length > 0 
      ? ' ' + JSON.stringify(context)
      : '';
    
    // RFC 5424 syslog format
    return `[${timestamp}] ${this.ident}[${process.pid}]: ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  async logToSyslog(priority, message) {
    // Use logger command on Unix systems
    const command = `logger -t "${this.ident}" -p ${this.facility}.${priority} "${message.replace(/"/g, '\\"')}"`;
    
    try {
      await execAsync(command);
    } catch (error) {
      // Fallback to console if logger command fails
      console.error(`Syslog command failed: ${error.message}`);
      console.log(message);
    }
  }

  getSyslogPriority(level) {
    // Calculate numeric priority (facility * 8 + severity)
    const facilityNum = this.getFacilityNumber(this.facility);
    const severity = this.levels[level];
    return facilityNum * 8 + severity;
  }

  getFacilityNumber(facility) {
    const facilities = {
      kern: 0,
      user: 1,
      mail: 2,
      daemon: 3,
      auth: 4,
      syslog: 5,
      lpr: 6,
      news: 7,
      uucp: 8,
      cron: 9,
      authpriv: 10,
      ftp: 11,
      local0: 16,
      local1: 17,
      local2: 18,
      local3: 19,
      local4: 20,
      local5: 21,
      local6: 22,
      local7: 23
    };

    return facilities[facility] || 16; // Default to local0
  }
}

export default SyslogLogger;
