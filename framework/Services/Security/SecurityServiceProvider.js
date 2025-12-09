/**
 * Security Service Provider
 * Registers security service in the application container
 */

import { ServiceProvider } from '../../Foundation/ServiceProvider.js';
import { SecurityService } from './SecurityService.js';

export class SecurityServiceProvider extends ServiceProvider {
  /**
   * Register security service
   */
  async register() {
    this.app.singleton('security', () => {
      return new SecurityService({
        jwtSecret: this.app.config('app.key') || this.app.config('security.jwt.secret'),
        jwtExpiresIn: this.app.config('security.jwt.expiresIn') || '7d',
        otpLength: this.app.config('security.otp.length') || 6,
        otpExpiryMinutes: this.app.config('security.otp.expiryMinutes') || 10,
        bcryptRounds: this.app.config('security.bcrypt.rounds') || 10,
      });
    });
  }

  /**
   * Boot security service
   */
  async boot() {
    // Security service is ready
  }
}

export default SecurityServiceProvider;
