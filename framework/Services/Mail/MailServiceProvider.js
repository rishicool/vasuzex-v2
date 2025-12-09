import { ServiceProvider } from '../../Foundation/ServiceProvider.js';
import { MailManager } from './MailManager.js';

/**
 * Mail Service Provider
 * 
 * Registers Mail service in the application container.
 * Provides email sending capabilities via multiple drivers (SMTP, SendGrid, SES).
 */
export class MailServiceProvider extends ServiceProvider {
  /**
   * Register the service
   */
  async register() {
    this.singleton('mail', (app) => {
      return new MailManager(app);
    });

    // Create aliases
    this.alias('mailer', 'mail');
    this.alias('Mail', 'mail');
  }

  /**
   * Bootstrap the service
   */
  async boot() {
    // Mail service is ready to use
    if (this.config('mail.default')) {
      const mail = this.make('mail');
      console.log(`[MailServiceProvider] Mail service initialized with driver: ${this.config('mail.default')}`);
    }
  }
}

export default MailServiceProvider;
