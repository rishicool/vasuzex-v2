/**
 * SMS Service Provider
 * 
 * Register SMS service in the application container
 */

export class SmsServiceProvider {
  /**
   * Register SMS service
   * 
   * @param {Object} app - Application instance
   */
  register(app) {
    app.singleton('sms', () => {
      const { SmsManager } = require('./SmsManager.js');
      return new SmsManager(app);
    });
  }

  /**
   * Boot SMS service
   * 
   * @param {Object} app - Application instance
   */
  boot(app) {
    // Boot logic if needed
  }
}

export default SmsServiceProvider;
