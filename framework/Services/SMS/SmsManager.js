/**
 * SMS Manager
 * Laravel-inspired SMS Manager for Node.js
 * 
 * Manages SMS sending through multiple drivers (twilio, aws-sns, 2factor, vonage).
 * 
 * @example
 * import { SmsManager } from '#framework';
 * 
 * const sms = new SmsManager(app);
 * 
 * // Send SMS
 * await sms.send({
 *   to: '+919876543210',
 *   message: 'Hello from Neastore!'
 * });
 * 
 * // Use specific driver
 * await sms.driver('twilio').send({...});
 * 
 * // Send OTP (helper method)
 * await sms.sendOtp('+919876543210', '123456');
 */

export class SmsManager {
  constructor(app) {
    this.app = app;
    this.drivers = {};
    this.customCreators = {};
  }

  /**
   * Get SMS driver instance
   * 
   * @param {string|null} name - Driver name (twilio, aws-sns, 2factor, vonage, log)
   * @returns {Object} Driver instance
   */
  driver(name = null) {
    name = name || this.getDefaultDriver();

    if (!this.drivers[name]) {
      this.drivers[name] = this.resolve(name);
    }

    return this.drivers[name];
  }

  /**
   * Resolve SMS driver
   * 
   * @private
   * @param {string} name - Driver name
   * @returns {Object} Driver instance
   * @throws {Error} If driver not configured or supported
   */
  resolve(name) {
    const config = this.getConfig(name);

    if (!config) {
      throw new Error(`SMS driver [${name}] is not configured.`);
    }

    // Check for custom creator
    if (this.customCreators[name]) {
      return this.customCreators[name](this.app, config);
    }

    // Create driver using built-in method
    const method = `create${this.capitalize(name)}Driver`;
    
    if (typeof this[method] === 'function') {
      return this[method](config);
    }

    throw new Error(`SMS driver [${name}] is not supported.`);
  }

  /**
   * Create Twilio driver
   * 
   * @private
   * @param {Object} config - Twilio configuration
   * @returns {Object} Twilio driver instance
   */
  async createTwilioDriver(config) {
    const { TwilioDriver } = await import('./Drivers/TwilioDriver.js');
    return new TwilioDriver(config);
  }

  /**
   * Create AWS SNS driver
   * 
   * @private
   * @param {Object} config - AWS SNS configuration
   * @returns {Object} AWS SNS driver instance
   */
  async createAwsSnsDriver(config) {
    const { AwsSnsDriver } = await import('./Drivers/AwsSnsDriver.js');
    return new AwsSnsDriver(config);
  }

  /**
   * Create 2Factor driver (India-specific)
   * 
   * @private
   * @param {Object} config - 2Factor configuration
   * @returns {Object} 2Factor driver instance
   */
  async createTwofactorDriver(config) {
    const { TwoFactorDriver } = await import('./Drivers/TwoFactorDriver.js');
    return new TwoFactorDriver(config);
  }

  /**
   * Create Vonage (Nexmo) driver
   * 
   * @private
   * @param {Object} config - Vonage configuration
   * @returns {Object} Vonage driver instance
   */
  async createVonageDriver(config) {
    const { VonageDriver } = await import('./Drivers/VonageDriver.js');
    return new VonageDriver(config);
  }

  /**
   * Create Log driver (for testing)
   * 
   * @private
   * @param {Object} config - Log configuration
   * @returns {Object} Log driver instance
   */
  async createLogDriver(config) {
    const { LogDriver } = await import('./Drivers/LogDriver.js');
    return new LogDriver(this.app, config);
  }

  /**
   * Register custom driver creator
   * 
   * @param {string} name - Driver name
   * @param {Function} creator - Creator function
   * @returns {this}
   * 
   * @example
   * smsManager.extend('custom', (app, config) => {
   *   return new CustomSmsDriver(config);
   * });
   */
  extend(name, creator) {
    this.customCreators[name] = creator;
    return this;
  }

  /**
   * Get driver configuration
   * 
   * @private
   * @param {string} name - Driver name
   * @returns {Object|null} Driver configuration
   */
  getConfig(name) {
    const drivers = this.app.config('sms.drivers', {});
    return drivers[name];
  }

  /**
   * Get default driver name
   * 
   * @private
   * @returns {string} Default driver name
   */
  getDefaultDriver() {
    return this.app.config('sms.default', 'log');
  }

  /**
   * Capitalize string
   * 
   * @private
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Send SMS (proxy to default driver)
   * 
   * @param {Object} options - SMS options
   * @param {string} options.to - Recipient phone number (E.164 format: +919876543210)
   * @param {string} options.message - SMS message text
   * @param {string} [options.from] - Sender phone number or ID
   * @returns {Promise<Object>} Response object
   * 
   * @example
   * await sms.send({
   *   to: '+919876543210',
   *   message: 'Your OTP is 123456'
   * });
   */
  async send(options) {
    const driver = this.driver();
    return await driver.send(options);
  }

  /**
   * Send OTP SMS (helper method)
   * 
   * @param {string} to - Recipient phone number
   * @param {string} otp - OTP code
   * @param {Object} [options={}] - Additional options
   * @param {string} [options.appName] - Application name
   * @param {number} [options.expiryMinutes=10] - OTP expiry time in minutes
   * @returns {Promise<Object>} Response object
   * 
   * @example
   * await sms.sendOtp('+919876543210', '123456');
   * await sms.sendOtp('+919876543210', '123456', { appName: 'MyApp', expiryMinutes: 5 });
   */
  async sendOtp(to, otp, options = {}) {
    const appName = options.appName || this.app.config('app.name', 'App');
    const expiryMinutes = options.expiryMinutes || 10;
    
    const message = `Your ${appName} OTP is: ${otp}. Valid for ${expiryMinutes} minutes. Do not share with anyone.`;

    return await this.send({
      to,
      message,
      from: options.from
    });
  }

  /**
   * Send verification code
   * 
   * @param {string} to - Recipient phone number
   * @param {string} code - Verification code
   * @param {Object} [options={}] - Additional options
   * @returns {Promise<Object>} Response object
   * 
   * @example
   * await sms.sendVerificationCode('+919876543210', 'ABC123');
   */
  async sendVerificationCode(to, code, options = {}) {
    const appName = options.appName || this.app.config('app.name', 'App');
    
    const message = `Your ${appName} verification code is: ${code}. Please use this to verify your account.`;

    return await this.send({
      to,
      message,
      from: options.from
    });
  }

  /**
   * Send notification SMS
   * 
   * @param {string} to - Recipient phone number
   * @param {string} message - Notification message
   * @param {Object} [options={}] - Additional options
   * @returns {Promise<Object>} Response object
   * 
   * @example
   * await sms.notify('+919876543210', 'Your order #123 has been shipped!');
   */
  async notify(to, message, options = {}) {
    return await this.send({
      to,
      message,
      from: options.from
    });
  }

  /**
   * Get all available drivers
   * 
   * @returns {string[]} Array of driver names
   */
  availableDrivers() {
    const configured = Object.keys(this.app.config('sms.drivers', {}));
    const custom = Object.keys(this.customCreators);
    return [...new Set([...configured, ...custom])];
  }
}

export default SmsManager;
