/**
 * SMS Facade
 * 
 * Provides static access to SMS service
 * Laravel-style facade pattern
 * 
 * @example
 * import { SMS } from '#framework';
 * 
 * // Send SMS
 * await SMS.send({
 *   to: '+919876543210',
 *   message: 'Hello World!'
 * });
 * 
 * // Send OTP
 * await SMS.sendOtp('+919876543210', '123456');
 * 
 * // Use specific driver
 * await SMS.driver('twilio').send({...});
 */

import Facade from './Facade.js';

class SMSFacade extends Facade {
  /**
   * Get the registered name of the component
   * 
   * @returns {string}
   */
  static getFacadeAccessor() {
    return 'sms';
  }
}

export default SMSFacade;
