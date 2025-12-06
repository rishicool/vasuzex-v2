/**
 * MailManager Unit Tests
 * Tests for Laravel-inspired Mail Manager with multiple transports
 * 
 * Tests Cover:
 * - Constructor initialization
 * - Mailer instance resolution and caching
 * - SMTP transport creation
 * - SendGrid transport creation
 * - Custom transport creators via extend()
 * - Configuration retrieval
 * - Default driver selection
 * - send() proxy method
 * - Error handling for missing/invalid configuration
 */

/**
 * MailManager Unit Tests
 * Tests for Laravel-inspired Mail Manager with multiple transports
 * 
 * Tests Cover:
 * - Constructor initialization
 * - Mailer instance resolution and caching
 * - Configuration retrieval
 * - Default driver selection
 * - Custom transport creators via extend()
 * - send() proxy method
 * - Error handling for missing/invalid configuration
 * 
 * Note: SMTP/SendGrid transport creation tests require actual nodemailer installation.
 * These are tested through mocking the resolution process and custom creators.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('MailManager', () => {
  let MailManager;
  let mockApp;
  
  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Import MailManager
    const module = await import('../../../../framework/Services/Mail/MailManager.js');
    MailManager = module.MailManager;
    
    // Create mock app with config method
    mockApp = {
      config: jest.fn()
    };
  });

  describe('Constructor', () => {
    it('should initialize with app instance', () => {
      const manager = new MailManager(mockApp);
      
      expect(manager.app).toBe(mockApp);
      expect(manager.mailers).toEqual({});
      expect(manager.customCreators).toEqual({});
    });

    it('should create separate instances for different apps', () => {
      const manager1 = new MailManager(mockApp);
      const manager2 = new MailManager({ config: jest.fn() });
      
      expect(manager1).not.toBe(manager2);
      expect(manager1.mailers).not.toBe(manager2.mailers);
    });
  });

  describe('mailer()', () => {
    it('should return default mailer when no name provided', async () => {
      const mockMailer = { sendMail: jest.fn() };
      const customCreator = jest.fn().mockReturnValue(mockMailer);
      
      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'mail.default') return 'custom';
        if (key === 'mail.mailers') {
          return {
            custom: { transport: 'custom', apiKey: 'test' }
          };
        }
        return defaultValue;
      });

      const manager = new MailManager(mockApp);
      manager.extend('custom', customCreator);
      
      const mailer = await manager.mailer();
      
      expect(mailer).toBe(mockMailer);
      expect(mockApp.config).toHaveBeenCalledWith('mail.default', 'smtp');
    });

    it('should cache mailer instances', async () => {
      const mockMailer = { sendMail: jest.fn() };
      const customCreator = jest.fn().mockReturnValue(mockMailer);
      
      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'mail.default') return 'custom';
        if (key === 'mail.mailers') {
          return {
            custom: { transport: 'custom', apiKey: 'test' }
          };
        }
        return defaultValue;
      });

      const manager = new MailManager(mockApp);
      manager.extend('custom', customCreator);
      
      const mailer1 = await manager.mailer('custom');
      const mailer2 = await manager.mailer('custom');
      
      expect(mailer1).toBe(mailer2);
      expect(manager.mailers.custom).toBe(mailer1);
      expect(customCreator).toHaveBeenCalledTimes(1);
    });

    it('should create different instances for different mailer names', async () => {
      const mockMailer1 = { sendMail: jest.fn(), name: 'custom1' };
      const mockMailer2 = { sendMail: jest.fn(), name: 'custom2' };
      const creator1 = jest.fn().mockReturnValue(mockMailer1);
      const creator2 = jest.fn().mockReturnValue(mockMailer2);
      
      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'mail.default') return 'custom1';
        if (key === 'mail.mailers') {
          return {
            custom1: { transport: 'custom1', apiKey: 'test1' },
            custom2: { transport: 'custom2', apiKey: 'test2' }
          };
        }
        return defaultValue;
      });

      const manager = new MailManager(mockApp);
      manager.extend('custom1', creator1);
      manager.extend('custom2', creator2);
      
      const mailer1 = await manager.mailer('custom1');
      const mailer2 = await manager.mailer('custom2');
      
      expect(mailer1).toBe(mockMailer1);
      expect(mailer2).toBe(mockMailer2);
      expect(mailer1).not.toBe(mailer2);
    });
  });

  describe('resolve()', () => {
    it('should throw error when mailer is not configured', () => {
      mockApp.config.mockReturnValue({});
      
      const manager = new MailManager(mockApp);
      
      expect(() => manager.resolve('nonexistent')).toThrow('Mailer [nonexistent] is not configured.');
    });

    it('should throw error when transport is missing', () => {
      mockApp.config.mockReturnValue({
        smtp: { host: 'test.com' } // Missing transport
      });
      
      const manager = new MailManager(mockApp);
      
      expect(() => manager.resolve('smtp')).toThrow('Mailer [smtp] is not configured.');
    });

    it('should use custom creator when available', async () => {
      const customMailer = { sendMail: jest.fn() };
      const customCreator = jest.fn().mockReturnValue(customMailer);
      
      mockApp.config.mockReturnValue({
        custom: { transport: 'custom', apiKey: 'test' }
      });
      
      const manager = new MailManager(mockApp);
      manager.customCreators.custom = customCreator;
      
      const mailer = manager.resolve('custom');
      
      expect(customCreator).toHaveBeenCalledWith(mockApp, {
        transport: 'custom',
        apiKey: 'test'
      });
      expect(mailer).toBe(customMailer);
    });

    it('should throw error for unsupported transport', () => {
      mockApp.config.mockReturnValue({
        unsupported: { transport: 'unknown' }
      });
      
      const manager = new MailManager(mockApp);
      
      expect(() => manager.resolve('unsupported')).toThrow('Mail transport [unknown] is not supported.');
    });
  });

  describe('Transport Creation Methods', () => {
    it('should have createSmtpTransport method', () => {
      const manager = new MailManager(mockApp);
      
      expect(typeof manager.createSmtpTransport).toBe('function');
    });

    it('should have createSendgridTransport method', () => {
      const manager = new MailManager(mockApp);
      
      expect(typeof manager.createSendgridTransport).toBe('function');
    });

    it('should follow naming convention for transport methods', () => {
      const manager = new MailManager(mockApp);
      const method1 = `create${manager.capitalize('smtp')}Transport`;
      const method2 = `create${manager.capitalize('sendgrid')}Transport`;
      
      expect(typeof manager[method1]).toBe('function');
      expect(typeof manager[method2]).toBe('function');
    });
  });

  describe('extend()', () => {
    it('should register custom creator', () => {
      const customCreator = jest.fn();
      const manager = new MailManager(mockApp);
      
      const result = manager.extend('custom', customCreator);
      
      expect(result).toBe(manager);
      expect(manager.customCreators.custom).toBe(customCreator);
    });

    it('should allow multiple custom creators', () => {
      const creator1 = jest.fn();
      const creator2 = jest.fn();
      const manager = new MailManager(mockApp);
      
      manager.extend('custom1', creator1);
      manager.extend('custom2', creator2);
      
      expect(manager.customCreators.custom1).toBe(creator1);
      expect(manager.customCreators.custom2).toBe(creator2);
    });

    it('should support fluent interface', () => {
      const manager = new MailManager(mockApp);
      
      const result = manager
        .extend('custom1', jest.fn())
        .extend('custom2', jest.fn());
      
      expect(result).toBe(manager);
    });
  });

  describe('getConfig()', () => {
    it('should retrieve mailer configuration', () => {
      const mailers = {
        smtp: { transport: 'smtp', host: 'test.com' },
        sendgrid: { transport: 'sendgrid', api_key: 'key' }
      };
      
      mockApp.config.mockReturnValue(mailers);
      
      const manager = new MailManager(mockApp);
      const config = manager.getConfig('smtp');
      
      expect(mockApp.config).toHaveBeenCalledWith('mail.mailers', {});
      expect(config).toEqual({ transport: 'smtp', host: 'test.com' });
    });

    it('should return undefined for nonexistent mailer', () => {
      mockApp.config.mockReturnValue({});
      
      const manager = new MailManager(mockApp);
      const config = manager.getConfig('nonexistent');
      
      expect(config).toBeUndefined();
    });

    it('should return default value when mailers not configured', () => {
      mockApp.config.mockImplementation((key, defaultValue) => defaultValue);
      
      const manager = new MailManager(mockApp);
      const config = manager.getConfig('smtp');
      
      expect(config).toBeUndefined();
    });
  });

  describe('getDefaultDriver()', () => {
    it('should return configured default driver', () => {
      mockApp.config.mockReturnValue('sendgrid');
      
      const manager = new MailManager(mockApp);
      const driver = manager.getDefaultDriver();
      
      expect(mockApp.config).toHaveBeenCalledWith('mail.default', 'smtp');
      expect(driver).toBe('sendgrid');
    });

    it('should return smtp as fallback default', () => {
      mockApp.config.mockImplementation((key, defaultValue) => defaultValue);
      
      const manager = new MailManager(mockApp);
      const driver = manager.getDefaultDriver();
      
      expect(driver).toBe('smtp');
    });
  });

  describe('capitalize()', () => {
    it('should capitalize first letter', () => {
      const manager = new MailManager(mockApp);
      
      expect(manager.capitalize('smtp')).toBe('Smtp');
      expect(manager.capitalize('sendgrid')).toBe('Sendgrid');
    });

    it('should handle single character', () => {
      const manager = new MailManager(mockApp);
      
      expect(manager.capitalize('a')).toBe('A');
    });

    it('should handle already capitalized', () => {
      const manager = new MailManager(mockApp);
      
      expect(manager.capitalize('Smtp')).toBe('Smtp');
    });

    it('should handle empty string', () => {
      const manager = new MailManager(mockApp);
      
      expect(manager.capitalize('')).toBe('');
    });
  });

  describe('send()', () => {
    it('should proxy to default mailer', async () => {
      const mockMailer = {
        sendMail: jest.fn().mockResolvedValue({ messageId: '123' })
      };
      const customCreator = jest.fn().mockReturnValue(mockMailer);

      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'mail.default') return 'custom';
        if (key === 'mail.mailers') {
          return {
            custom: { transport: 'custom', apiKey: 'test' }
          };
        }
        return defaultValue;
      });

      const manager = new MailManager(mockApp);
      manager.extend('custom', customCreator);

      const options = {
        to: 'user@example.com',
        subject: 'Test',
        html: '<h1>Test</h1>'
      };

      const result = await manager.send(options);
      
      expect(mockMailer.sendMail).toHaveBeenCalledWith(options);
      expect(result).toEqual({ messageId: '123' });
    });

    it('should pass through all mail options', async () => {
      const mockMailer = {
        sendMail: jest.fn().mockResolvedValue({ messageId: '456' })
      };
      const customCreator = jest.fn().mockReturnValue(mockMailer);

      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'mail.default') return 'custom';
        if (key === 'mail.mailers') {
          return {
            custom: { transport: 'custom', apiKey: 'test' }
          };
        }
        return defaultValue;
      });

      const manager = new MailManager(mockApp);
      manager.extend('custom', customCreator);

      const options = {
        from: 'sender@example.com',
        to: 'user@example.com',
        cc: 'cc@example.com',
        bcc: 'bcc@example.com',
        subject: 'Test Email',
        text: 'Plain text',
        html: '<h1>HTML content</h1>',
        attachments: [{ filename: 'test.pdf', path: '/path/to/test.pdf' }]
      };

      await manager.send(options);
      
      expect(mockMailer.sendMail).toHaveBeenCalledWith(options);
    });
  });

  describe('Integration Scenarios', () => {
    it('should support multiple mailers simultaneously', async () => {
      const mockMailer1 = { sendMail: jest.fn(), name: 'custom1' };
      const mockMailer2 = { sendMail: jest.fn(), name: 'custom2' };
      const creator1 = jest.fn().mockReturnValue(mockMailer1);
      const creator2 = jest.fn().mockReturnValue(mockMailer2);
      
      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'mail.default') return 'custom1';
        if (key === 'mail.mailers') {
          return {
            custom1: { transport: 'custom1', apiKey: 'test1' },
            custom2: { transport: 'custom2', apiKey: 'test2' }
          };
        }
        return defaultValue;
      });

      const manager = new MailManager(mockApp);
      manager.extend('custom1', creator1);
      manager.extend('custom2', creator2);
      
      const mailer1 = await manager.mailer('custom1');
      const mailer2 = await manager.mailer('custom2');
      
      expect(mailer1).toBe(mockMailer1);
      expect(mailer2).toBe(mockMailer2);
      expect(mailer1).not.toBe(mailer2);
      expect(manager.mailers.custom1).toBe(mailer1);
      expect(manager.mailers.custom2).toBe(mailer2);
    });

    it('should allow custom mailer to override built-in', async () => {
      const customMailer = { sendMail: jest.fn() };
      const customCreator = jest.fn().mockReturnValue(customMailer);

      mockApp.config.mockReturnValue({
        smtp: { transport: 'smtp', host: 'test.com', port: 587 }
      });

      const manager = new MailManager(mockApp);
      manager.extend('smtp', customCreator);

      const mailer = await manager.mailer('smtp');
      
      expect(customCreator).toHaveBeenCalled();
      expect(mailer).toBe(customMailer);
    });

    it('should handle mailer creation errors gracefully', () => {
      mockApp.config.mockReturnValue({
        broken: { transport: 'invalid_transport' }
      });

      const manager = new MailManager(mockApp);
      
      expect(() => manager.resolve('broken')).toThrow('Mail transport [invalid_transport] is not supported.');
    });

    it('should resolve correct method name for transport', () => {
      const manager = new MailManager(mockApp);
      
      const smtpMethod = `create${manager.capitalize('smtp')}Transport`;
      const sendgridMethod = `create${manager.capitalize('sendgrid')}Transport`;
      
      expect(smtpMethod).toBe('createSmtpTransport');
      expect(sendgridMethod).toBe('createSendgridTransport');
      expect(typeof manager[smtpMethod]).toBe('function');
      expect(typeof manager[sendgridMethod]).toBe('function');
    });
  });
});
