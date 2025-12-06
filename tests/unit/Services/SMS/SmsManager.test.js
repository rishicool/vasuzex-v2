/**
 * SmsManager Unit Tests
 * Tests for Laravel-inspired SMS Manager with multiple drivers
 * 
 * Tests Cover:
 * - Constructor initialization
 * - Driver instance resolution and caching
 * - Configuration retrieval
 * - Default driver selection
 * - Custom driver creators via extend()
 * - send() proxy method
 * - sendOtp() helper method
 * - sendVerificationCode() helper method
 * - notify() helper method
 * - availableDrivers() method
 * - Error handling for missing/invalid configuration
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('SmsManager', () => {
  let SmsManager;
  let mockApp;
  
  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Import SmsManager
    const module = await import('../../../../framework/Services/SMS/SmsManager.js');
    SmsManager = module.SmsManager;
    
    // Create mock app with config method
    mockApp = {
      config: jest.fn()
    };
  });

  describe('Constructor', () => {
    it('should initialize with app instance', () => {
      const manager = new SmsManager(mockApp);
      
      expect(manager.app).toBe(mockApp);
      expect(manager.drivers).toEqual({});
      expect(manager.customCreators).toEqual({});
    });

    it('should create separate instances for different apps', () => {
      const manager1 = new SmsManager(mockApp);
      const manager2 = new SmsManager({ config: jest.fn() });
      
      expect(manager1).not.toBe(manager2);
      expect(manager1.drivers).not.toBe(manager2.drivers);
    });
  });

  describe('driver()', () => {
    it('should return default driver when no name provided', async () => {
      const mockDriver = { send: jest.fn() };
      const customCreator = jest.fn().mockReturnValue(mockDriver);
      
      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'sms.default') return 'custom';
        if (key === 'sms.drivers') {
          return {
            custom: { apiKey: 'test123' }
          };
        }
        return defaultValue;
      });

      const manager = new SmsManager(mockApp);
      manager.extend('custom', customCreator);
      
      const driver = await manager.driver();
      
      expect(driver).toBe(mockDriver);
      expect(mockApp.config).toHaveBeenCalledWith('sms.default', 'log');
    });

    it('should cache driver instances', async () => {
      const mockDriver = { send: jest.fn() };
      const customCreator = jest.fn().mockReturnValue(mockDriver);
      
      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'sms.default') return 'custom';
        if (key === 'sms.drivers') {
          return {
            custom: { apiKey: 'test123' }
          };
        }
        return defaultValue;
      });

      const manager = new SmsManager(mockApp);
      manager.extend('custom', customCreator);
      
      const driver1 = await manager.driver('custom');
      const driver2 = await manager.driver('custom');
      
      expect(driver1).toBe(driver2);
      expect(manager.drivers.custom).toBe(driver1);
      expect(customCreator).toHaveBeenCalledTimes(1);
    });

    it('should create different instances for different driver names', async () => {
      const mockDriver1 = { send: jest.fn(), name: 'custom1' };
      const mockDriver2 = { send: jest.fn(), name: 'custom2' };
      const creator1 = jest.fn().mockReturnValue(mockDriver1);
      const creator2 = jest.fn().mockReturnValue(mockDriver2);
      
      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'sms.default') return 'custom1';
        if (key === 'sms.drivers') {
          return {
            custom1: { apiKey: 'test1' },
            custom2: { apiKey: 'test2' }
          };
        }
        return defaultValue;
      });

      const manager = new SmsManager(mockApp);
      manager.extend('custom1', creator1);
      manager.extend('custom2', creator2);
      
      const driver1 = await manager.driver('custom1');
      const driver2 = await manager.driver('custom2');
      
      expect(driver1).toBe(mockDriver1);
      expect(driver2).toBe(mockDriver2);
      expect(driver1).not.toBe(driver2);
    });
  });

  describe('resolve()', () => {
    it('should throw error when driver is not configured', () => {
      mockApp.config.mockReturnValue({});
      
      const manager = new SmsManager(mockApp);
      
      expect(() => manager.resolve('nonexistent')).toThrow('SMS driver [nonexistent] is not configured.');
    });

    it('should use custom creator when available', async () => {
      const customDriver = { send: jest.fn() };
      const customCreator = jest.fn().mockReturnValue(customDriver);
      
      mockApp.config.mockReturnValue({
        custom: { apiKey: 'test' }
      });
      
      const manager = new SmsManager(mockApp);
      manager.customCreators.custom = customCreator;
      
      const driver = manager.resolve('custom');
      
      expect(customCreator).toHaveBeenCalledWith(mockApp, {
        apiKey: 'test'
      });
      expect(driver).toBe(customDriver);
    });

    it('should throw error for unsupported driver', () => {
      mockApp.config.mockReturnValue({
        unsupported: { apiKey: 'test' }
      });
      
      const manager = new SmsManager(mockApp);
      
      expect(() => manager.resolve('unsupported')).toThrow('SMS driver [unsupported] is not supported.');
    });
  });

  describe('Driver Creation Methods', () => {
    it('should have createTwilioDriver method', () => {
      const manager = new SmsManager(mockApp);
      
      expect(typeof manager.createTwilioDriver).toBe('function');
    });

    it('should have createAwsSnsDriver method', () => {
      const manager = new SmsManager(mockApp);
      
      expect(typeof manager.createAwsSnsDriver).toBe('function');
    });

    it('should have createTwofactorDriver method', () => {
      const manager = new SmsManager(mockApp);
      
      expect(typeof manager.createTwofactorDriver).toBe('function');
    });

    it('should have createVonageDriver method', () => {
      const manager = new SmsManager(mockApp);
      
      expect(typeof manager.createVonageDriver).toBe('function');
    });

    it('should have createLogDriver method', () => {
      const manager = new SmsManager(mockApp);
      
      expect(typeof manager.createLogDriver).toBe('function');
    });

    it('should follow naming convention for driver methods', () => {
      const manager = new SmsManager(mockApp);
      const twilioMethod = `create${manager.capitalize('twilio')}Driver`;
      const vonageMethod = `create${manager.capitalize('vonage')}Driver`;
      
      expect(typeof manager[twilioMethod]).toBe('function');
      expect(typeof manager[vonageMethod]).toBe('function');
      expect(twilioMethod).toBe('createTwilioDriver');
      expect(vonageMethod).toBe('createVonageDriver');
    });
  });

  describe('extend()', () => {
    it('should register custom creator', () => {
      const customCreator = jest.fn();
      const manager = new SmsManager(mockApp);
      
      const result = manager.extend('custom', customCreator);
      
      expect(result).toBe(manager);
      expect(manager.customCreators.custom).toBe(customCreator);
    });

    it('should allow multiple custom creators', () => {
      const creator1 = jest.fn();
      const creator2 = jest.fn();
      const manager = new SmsManager(mockApp);
      
      manager.extend('custom1', creator1);
      manager.extend('custom2', creator2);
      
      expect(manager.customCreators.custom1).toBe(creator1);
      expect(manager.customCreators.custom2).toBe(creator2);
    });

    it('should support fluent interface', () => {
      const manager = new SmsManager(mockApp);
      
      const result = manager
        .extend('custom1', jest.fn())
        .extend('custom2', jest.fn());
      
      expect(result).toBe(manager);
    });
  });

  describe('getConfig()', () => {
    it('should retrieve driver configuration', () => {
      const drivers = {
        twilio: { accountSid: 'AC123', authToken: 'token' },
        aws_sns: { region: 'us-east-1', accessKeyId: 'key' }
      };
      
      mockApp.config.mockReturnValue(drivers);
      
      const manager = new SmsManager(mockApp);
      const config = manager.getConfig('twilio');
      
      expect(mockApp.config).toHaveBeenCalledWith('sms.drivers', {});
      expect(config).toEqual({ accountSid: 'AC123', authToken: 'token' });
    });

    it('should return undefined for nonexistent driver', () => {
      mockApp.config.mockReturnValue({});
      
      const manager = new SmsManager(mockApp);
      const config = manager.getConfig('nonexistent');
      
      expect(config).toBeUndefined();
    });

    it('should return default value when drivers not configured', () => {
      mockApp.config.mockImplementation((key, defaultValue) => defaultValue);
      
      const manager = new SmsManager(mockApp);
      const config = manager.getConfig('twilio');
      
      expect(config).toBeUndefined();
    });
  });

  describe('getDefaultDriver()', () => {
    it('should return configured default driver', () => {
      mockApp.config.mockReturnValue('twilio');
      
      const manager = new SmsManager(mockApp);
      const driver = manager.getDefaultDriver();
      
      expect(mockApp.config).toHaveBeenCalledWith('sms.default', 'log');
      expect(driver).toBe('twilio');
    });

    it('should return log as fallback default', () => {
      mockApp.config.mockImplementation((key, defaultValue) => defaultValue);
      
      const manager = new SmsManager(mockApp);
      const driver = manager.getDefaultDriver();
      
      expect(driver).toBe('log');
    });
  });

  describe('capitalize()', () => {
    it('should capitalize first letter', () => {
      const manager = new SmsManager(mockApp);
      
      expect(manager.capitalize('twilio')).toBe('Twilio');
      expect(manager.capitalize('aws-sns')).toBe('Aws-sns');
    });

    it('should handle single character', () => {
      const manager = new SmsManager(mockApp);
      
      expect(manager.capitalize('a')).toBe('A');
    });

    it('should handle already capitalized', () => {
      const manager = new SmsManager(mockApp);
      
      expect(manager.capitalize('Twilio')).toBe('Twilio');
    });

    it('should handle empty string', () => {
      const manager = new SmsManager(mockApp);
      
      expect(manager.capitalize('')).toBe('');
    });
  });

  describe('send()', () => {
    it('should proxy to default driver', async () => {
      const mockDriver = {
        send: jest.fn().mockResolvedValue({ messageId: 'sms-123', status: 'sent' })
      };
      const customCreator = jest.fn().mockReturnValue(mockDriver);

      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'sms.default') return 'custom';
        if (key === 'sms.drivers') {
          return {
            custom: { apiKey: 'test' }
          };
        }
        return defaultValue;
      });

      const manager = new SmsManager(mockApp);
      manager.extend('custom', customCreator);

      const options = {
        to: '+919876543210',
        message: 'Test SMS'
      };

      const result = await manager.send(options);
      
      expect(mockDriver.send).toHaveBeenCalledWith(options);
      expect(result).toEqual({ messageId: 'sms-123', status: 'sent' });
    });

    it('should pass through all SMS options', async () => {
      const mockDriver = {
        send: jest.fn().mockResolvedValue({ messageId: 'sms-456' })
      };
      const customCreator = jest.fn().mockReturnValue(mockDriver);

      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'sms.default') return 'custom';
        if (key === 'sms.drivers') {
          return {
            custom: { apiKey: 'test' }
          };
        }
        return defaultValue;
      });

      const manager = new SmsManager(mockApp);
      manager.extend('custom', customCreator);

      const options = {
        from: '+1234567890',
        to: '+919876543210',
        message: 'Hello from Vasuzex!'
      };

      await manager.send(options);
      
      expect(mockDriver.send).toHaveBeenCalledWith(options);
    });
  });

  describe('sendOtp()', () => {
    it('should send OTP with default settings', async () => {
      const mockDriver = {
        send: jest.fn().mockResolvedValue({ messageId: 'otp-123' })
      };
      const customCreator = jest.fn().mockReturnValue(mockDriver);

      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'sms.default') return 'custom';
        if (key === 'sms.drivers') return { custom: { apiKey: 'test' } };
        if (key === 'app.name') return 'TestApp';
        return defaultValue;
      });

      const manager = new SmsManager(mockApp);
      manager.extend('custom', customCreator);

      await manager.sendOtp('+919876543210', '123456');
      
      expect(mockDriver.send).toHaveBeenCalledWith({
        to: '+919876543210',
        message: 'Your TestApp OTP is: 123456. Valid for 10 minutes. Do not share with anyone.',
        from: undefined
      });
    });

    it('should use custom app name and expiry minutes', async () => {
      const mockDriver = {
        send: jest.fn().mockResolvedValue({ messageId: 'otp-456' })
      };
      const customCreator = jest.fn().mockReturnValue(mockDriver);

      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'sms.default') return 'custom';
        if (key === 'sms.drivers') return { custom: { apiKey: 'test' } };
        if (key === 'app.name') return 'DefaultApp';
        return defaultValue;
      });

      const manager = new SmsManager(mockApp);
      manager.extend('custom', customCreator);

      await manager.sendOtp('+919876543210', '654321', {
        appName: 'CustomApp',
        expiryMinutes: 5
      });
      
      expect(mockDriver.send).toHaveBeenCalledWith({
        to: '+919876543210',
        message: 'Your CustomApp OTP is: 654321. Valid for 5 minutes. Do not share with anyone.',
        from: undefined
      });
    });

    it('should support custom from number', async () => {
      const mockDriver = {
        send: jest.fn().mockResolvedValue({ messageId: 'otp-789' })
      };
      const customCreator = jest.fn().mockReturnValue(mockDriver);

      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'sms.default') return 'custom';
        if (key === 'sms.drivers') return { custom: { apiKey: 'test' } };
        if (key === 'app.name') return 'App';
        return defaultValue;
      });

      const manager = new SmsManager(mockApp);
      manager.extend('custom', customCreator);

      await manager.sendOtp('+919876543210', '111222', {
        from: '+1234567890'
      });
      
      expect(mockDriver.send).toHaveBeenCalledWith({
        to: '+919876543210',
        message: 'Your App OTP is: 111222. Valid for 10 minutes. Do not share with anyone.',
        from: '+1234567890'
      });
    });
  });

  describe('sendVerificationCode()', () => {
    it('should send verification code with default app name', async () => {
      const mockDriver = {
        send: jest.fn().mockResolvedValue({ messageId: 'verify-123' })
      };
      const customCreator = jest.fn().mockReturnValue(mockDriver);

      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'sms.default') return 'custom';
        if (key === 'sms.drivers') return { custom: { apiKey: 'test' } };
        if (key === 'app.name') return 'MyApp';
        return defaultValue;
      });

      const manager = new SmsManager(mockApp);
      manager.extend('custom', customCreator);

      await manager.sendVerificationCode('+919876543210', 'ABC123');
      
      expect(mockDriver.send).toHaveBeenCalledWith({
        to: '+919876543210',
        message: 'Your MyApp verification code is: ABC123. Please use this to verify your account.',
        from: undefined
      });
    });

    it('should use custom app name', async () => {
      const mockDriver = {
        send: jest.fn().mockResolvedValue({ messageId: 'verify-456' })
      };
      const customCreator = jest.fn().mockReturnValue(mockDriver);

      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'sms.default') return 'custom';
        if (key === 'sms.drivers') return { custom: { apiKey: 'test' } };
        if (key === 'app.name') return 'DefaultApp';
        return defaultValue;
      });

      const manager = new SmsManager(mockApp);
      manager.extend('custom', customCreator);

      await manager.sendVerificationCode('+919876543210', 'XYZ789', {
        appName: 'CustomVerify'
      });
      
      expect(mockDriver.send).toHaveBeenCalledWith({
        to: '+919876543210',
        message: 'Your CustomVerify verification code is: XYZ789. Please use this to verify your account.',
        from: undefined
      });
    });

    it('should support custom from number', async () => {
      const mockDriver = {
        send: jest.fn().mockResolvedValue({ messageId: 'verify-789' })
      };
      const customCreator = jest.fn().mockReturnValue(mockDriver);

      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'sms.default') return 'custom';
        if (key === 'sms.drivers') return { custom: { apiKey: 'test' } };
        if (key === 'app.name') return 'App';
        return defaultValue;
      });

      const manager = new SmsManager(mockApp);
      manager.extend('custom', customCreator);

      await manager.sendVerificationCode('+919876543210', 'CODE99', {
        from: '+1234567890'
      });
      
      expect(mockDriver.send).toHaveBeenCalledWith({
        to: '+919876543210',
        message: 'Your App verification code is: CODE99. Please use this to verify your account.',
        from: '+1234567890'
      });
    });
  });

  describe('notify()', () => {
    it('should send notification message', async () => {
      const mockDriver = {
        send: jest.fn().mockResolvedValue({ messageId: 'notify-123' })
      };
      const customCreator = jest.fn().mockReturnValue(mockDriver);

      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'sms.default') return 'custom';
        if (key === 'sms.drivers') return { custom: { apiKey: 'test' } };
        return defaultValue;
      });

      const manager = new SmsManager(mockApp);
      manager.extend('custom', customCreator);

      await manager.notify('+919876543210', 'Your order #123 has been shipped!');
      
      expect(mockDriver.send).toHaveBeenCalledWith({
        to: '+919876543210',
        message: 'Your order #123 has been shipped!',
        from: undefined
      });
    });

    it('should support custom from number', async () => {
      const mockDriver = {
        send: jest.fn().mockResolvedValue({ messageId: 'notify-456' })
      };
      const customCreator = jest.fn().mockReturnValue(mockDriver);

      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'sms.default') return 'custom';
        if (key === 'sms.drivers') return { custom: { apiKey: 'test' } };
        return defaultValue;
      });

      const manager = new SmsManager(mockApp);
      manager.extend('custom', customCreator);

      await manager.notify('+919876543210', 'Payment received!', {
        from: '+1234567890'
      });
      
      expect(mockDriver.send).toHaveBeenCalledWith({
        to: '+919876543210',
        message: 'Payment received!',
        from: '+1234567890'
      });
    });
  });

  describe('availableDrivers()', () => {
    it('should return configured drivers', () => {
      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'sms.drivers') {
          return {
            twilio: { accountSid: 'AC123' },
            aws_sns: { region: 'us-east-1' }
          };
        }
        return defaultValue;
      });

      const manager = new SmsManager(mockApp);
      const drivers = manager.availableDrivers();
      
      expect(drivers).toContain('twilio');
      expect(drivers).toContain('aws_sns');
      expect(drivers).toHaveLength(2);
    });

    it('should include custom creators', () => {
      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'sms.drivers') {
          return {
            twilio: { accountSid: 'AC123' }
          };
        }
        return defaultValue;
      });

      const manager = new SmsManager(mockApp);
      manager.extend('custom1', jest.fn());
      manager.extend('custom2', jest.fn());

      const drivers = manager.availableDrivers();
      
      expect(drivers).toContain('twilio');
      expect(drivers).toContain('custom1');
      expect(drivers).toContain('custom2');
      expect(drivers).toHaveLength(3);
    });

    it('should deduplicate driver names', () => {
      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'sms.drivers') {
          return {
            custom: { apiKey: 'configured' }
          };
        }
        return defaultValue;
      });

      const manager = new SmsManager(mockApp);
      manager.extend('custom', jest.fn());

      const drivers = manager.availableDrivers();
      
      expect(drivers).toContain('custom');
      expect(drivers).toHaveLength(1);
    });

    it('should return empty array when no drivers configured', () => {
      mockApp.config.mockImplementation((key, defaultValue) => defaultValue);

      const manager = new SmsManager(mockApp);
      const drivers = manager.availableDrivers();
      
      expect(drivers).toEqual([]);
    });
  });

  describe('Integration Scenarios', () => {
    it('should support multiple drivers simultaneously', async () => {
      const mockDriver1 = { send: jest.fn(), name: 'custom1' };
      const mockDriver2 = { send: jest.fn(), name: 'custom2' };
      const creator1 = jest.fn().mockReturnValue(mockDriver1);
      const creator2 = jest.fn().mockReturnValue(mockDriver2);
      
      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'sms.default') return 'custom1';
        if (key === 'sms.drivers') {
          return {
            custom1: { apiKey: 'test1' },
            custom2: { apiKey: 'test2' }
          };
        }
        return defaultValue;
      });

      const manager = new SmsManager(mockApp);
      manager.extend('custom1', creator1);
      manager.extend('custom2', creator2);
      
      const driver1 = await manager.driver('custom1');
      const driver2 = await manager.driver('custom2');
      
      expect(driver1).toBe(mockDriver1);
      expect(driver2).toBe(mockDriver2);
      expect(driver1).not.toBe(driver2);
      expect(manager.drivers.custom1).toBe(driver1);
      expect(manager.drivers.custom2).toBe(driver2);
    });

    it('should allow custom driver to override built-in', async () => {
      const customDriver = { send: jest.fn() };
      const customCreator = jest.fn().mockReturnValue(customDriver);

      mockApp.config.mockReturnValue({
        twilio: { accountSid: 'AC123', authToken: 'token' }
      });

      const manager = new SmsManager(mockApp);
      manager.extend('twilio', customCreator);

      const driver = await manager.driver('twilio');
      
      expect(customCreator).toHaveBeenCalled();
      expect(driver).toBe(customDriver);
    });

    it('should handle driver creation errors gracefully', () => {
      mockApp.config.mockReturnValue({
        broken: { apiKey: 'test' }
      });

      const manager = new SmsManager(mockApp);
      
      expect(() => manager.resolve('broken')).toThrow('SMS driver [broken] is not supported.');
    });

    it('should resolve correct method name for driver', () => {
      const manager = new SmsManager(mockApp);
      
      const twilioMethod = `create${manager.capitalize('twilio')}Driver`;
      const awsSnsMethod = `create${manager.capitalize('aws-sns')}Driver`;
      
      expect(twilioMethod).toBe('createTwilioDriver');
      expect(awsSnsMethod).toBe('createAws-snsDriver');
      expect(typeof manager[twilioMethod]).toBe('function');
    });

    it('should chain helper methods correctly', async () => {
      const mockDriver = {
        send: jest.fn()
          .mockResolvedValueOnce({ messageId: 'otp-1' })
          .mockResolvedValueOnce({ messageId: 'verify-1' })
          .mockResolvedValueOnce({ messageId: 'notify-1' })
      };
      const customCreator = jest.fn().mockReturnValue(mockDriver);

      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'sms.default') return 'custom';
        if (key === 'sms.drivers') return { custom: { apiKey: 'test' } };
        if (key === 'app.name') return 'App';
        return defaultValue;
      });

      const manager = new SmsManager(mockApp);
      manager.extend('custom', customCreator);

      await manager.sendOtp('+911234567890', '123456');
      await manager.sendVerificationCode('+911234567890', 'ABC123');
      await manager.notify('+911234567890', 'Test notification');
      
      expect(mockDriver.send).toHaveBeenCalledTimes(3);
    });
  });
});
