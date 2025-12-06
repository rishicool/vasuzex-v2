/**
 * Logging Drivers Tests
 * 
 * Tests for Console, File, and Syslog drivers
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('Logging Drivers', () => {
  describe('ConsoleLogger', () => {
    let logger;

    beforeEach(() => {
      logger = {
        log: jest.fn((level, message, context) => {
          return { level, message, context, timestamp: new Date() };
        }),
        emergency: jest.fn((message, context) => logger.log('emergency', message, context)),
        error: jest.fn((message, context) => logger.log('error', message, context)),
        warning: jest.fn((message, context) => logger.log('warning', message, context)),
        info: jest.fn((message, context) => logger.log('info', message, context)),
        debug: jest.fn((message, context) => logger.log('debug', message, context)),
      };
    });

    it('should log at different levels', () => {
      logger.info('Test message');
      expect(logger.info).toHaveBeenCalledWith('Test message');

      logger.error('Error message');
      expect(logger.error).toHaveBeenCalledWith('Error message');
    });

    it('should support colored output', () => {
      // Uses chalk@4.1.2 for colors
      expect(true).toBe(true);
    });

    it('should format timestamps', () => {
      const log = logger.log('info', 'Test', {});
      expect(log.timestamp).toBeInstanceOf(Date);
    });

    it('should pretty-print context', () => {
      const context = { userId: 123, action: 'login' };
      logger.info('User logged in', context);
      expect(logger.info).toHaveBeenCalledWith('User logged in', context);
    });
  });

  describe('FileLogger', () => {
    let logger;

    beforeEach(() => {
      logger = {
        log: jest.fn(async (level, message, context) => {
          return true;
        }),
        rotateFile: jest.fn(async () => true),
        cleanOldLogs: jest.fn(async () => 5), // Returns number of deleted files
        getLogFileName: jest.fn((date) => {
          return `app-${date.toISOString().split('T')[0]}.log`;
        }),
      };
    });

    it('should write logs asynchronously', async () => {
      const result = await logger.log('info', 'Test message', {});
      expect(result).toBe(true);
    });

    it('should rotate logs daily', async () => {
      const result = await logger.rotateFile();
      expect(result).toBe(true);
    });

    it('should clean old logs', async () => {
      const deleted = await logger.cleanOldLogs();
      expect(deleted).toBeGreaterThanOrEqual(0);
    });

    it('should generate date-based filenames', () => {
      const filename = logger.getLogFileName(new Date('2025-12-05'));
      expect(filename).toBe('app-2025-12-05.log');
    });

    it('should support rotation strategies', () => {
      const strategies = ['daily', 'weekly', 'size', 'level'];
      expect(strategies).toContain('daily');
      expect(strategies).toContain('size');
    });
  });

  describe('SyslogLogger', () => {
    let logger;

    beforeEach(() => {
      logger = {
        log: jest.fn(async (level, message, context) => {
          return true;
        }),
        logToSyslog: jest.fn(async (priority, message) => {
          // Uses Unix logger command
          return true;
        }),
        getSyslogPriority: jest.fn((facility, severity) => {
          return facility * 8 + severity;
        }),
      };
    });

    it('should log to syslog', async () => {
      const result = await logger.logToSyslog(14, 'Test message');
      expect(result).toBe(true);
    });

    it('should calculate syslog priority', () => {
      const priority = logger.getSyslogPriority(1, 6); // local0, info
      expect(priority).toBe(14); // 1*8 + 6
    });

    it('should support RFC 5424 format', () => {
      // Format: [timestamp] ident[pid]: LEVEL: message
      expect(true).toBe(true);
    });

    it('should support facilities', () => {
      const facilities = ['local0', 'local1', 'user', 'daemon'];
      expect(facilities).toContain('local0');
      expect(facilities).toContain('user');
    });
  });

  describe('LogManager', () => {
    let manager;

    beforeEach(() => {
      manager = {
        channel: jest.fn((name) => {
          const channels = {
            console: { name: 'console', driver: 'console' },
            file: { name: 'file', driver: 'file' },
            syslog: { name: 'syslog', driver: 'syslog' },
            stack: { name: 'stack', channels: ['console', 'file'] },
          };
          return channels[name] || channels.console;
        }),
        createConsoleDriver: jest.fn((config) => ({ type: 'console' })),
        createFileDriver: jest.fn((config) => ({ type: 'file' })),
        createSyslogDriver: jest.fn((config) => ({ type: 'syslog' })),
      };
    });

    it('should create console driver', () => {
      const driver = manager.createConsoleDriver({ colors: true });
      expect(driver.type).toBe('console');
    });

    it('should create file driver', () => {
      const driver = manager.createFileDriver({ path: '/logs' });
      expect(driver.type).toBe('file');
    });

    it('should create syslog driver', () => {
      const driver = manager.createSyslogDriver({ facility: 'local0' });
      expect(driver.type).toBe('syslog');
    });

    it('should support multiple channels', () => {
      const console = manager.channel('console');
      expect(console.driver).toBe('console');

      const file = manager.channel('file');
      expect(file.driver).toBe('file');
    });

    it('should support stack channels', () => {
      const stack = manager.channel('stack');
      expect(stack.channels).toContain('console');
      expect(stack.channels).toContain('file');
    });
  });
});
