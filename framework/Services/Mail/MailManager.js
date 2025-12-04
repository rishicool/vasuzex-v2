/**
 * Mail Manager
 * Laravel MailManager pattern for Node.js
 * 
 * Manages mail sending through multiple drivers (smtp, sendgrid, ses).
 * 
 * @example
 * import { MailManager } from 'vasuzex-framework';
 * 
 * const mail = new MailManager(app);
 * 
 * // Send mail
 * await mail.send({
 *   to: 'user@example.com',
 *   subject: 'Hello',
 *   html: '<h1>Welcome</h1>',
 *   text: 'Welcome'
 * });
 * 
 * // Use specific mailer
 * await mail.mailer('sendgrid').send({...});
 */

export class MailManager {
  constructor(app) {
    this.app = app;
    this.mailers = {};
    this.customCreators = {};
  }

  /**
   * Get mailer instance
   */
  mailer(name = null) {
    name = name || this.getDefaultDriver();

    if (!this.mailers[name]) {
      this.mailers[name] = this.resolve(name);
    }

    return this.mailers[name];
  }

  /**
   * Resolve mailer
   * @private
   */
  resolve(name) {
    const config = this.getConfig(name);

    if (!config || !config.transport) {
      throw new Error(`Mailer [${name}] is not configured.`);
    }

    const transport = config.transport;

    if (this.customCreators[transport]) {
      return this.customCreators[transport](this.app, config);
    }

    const method = `create${this.capitalize(transport)}Transport`;
    
    if (typeof this[method] === 'function') {
      return this[method](config);
    }

    throw new Error(`Mail transport [${transport}] is not supported.`);
  }

  /**
   * Create SMTP transport
   * @private
   */
  async createSmtpTransport(config) {
    const nodemailer = await import('nodemailer');
    
    return nodemailer.default.createTransport({
      host: config.host,
      port: config.port,
      secure: config.encryption === 'ssl',
      auth: {
        user: config.username,
        pass: config.password,
      },
    });
  }

  /**
   * Create SendGrid transport
   * @private
   */
  async createSendgridTransport(config) {
    const nodemailer = await import('nodemailer');
    const sgTransport = await import('nodemailer-sendgrid');
    
    return nodemailer.default.createTransport(sgTransport.default({
      apiKey: config.api_key,
    }));
  }

  /**
   * Register custom creator
   */
  extend(transport, creator) {
    this.customCreators[transport] = creator;
    return this;
  }

  /**
   * Get config
   * @private
   */
  getConfig(name) {
    const mailers = this.app.config('mail.mailers', {});
    return mailers[name];
  }

  /**
   * Get default driver
   * @private
   */
  getDefaultDriver() {
    return this.app.config('mail.default', 'smtp');
  }

  /**
   * Capitalize
   * @private
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Send mail (proxy to default mailer)
   */
  async send(options) {
    const mailer = this.mailer();
    return await mailer.sendMail(options);
  }
}

export default MailManager;
