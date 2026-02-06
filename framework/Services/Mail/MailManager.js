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
  async mailer(name = null) {
    name = name || this.getDefaultDriver();

    if (!this.mailers[name]) {
      this.mailers[name] = await this.resolve(name);
    }

    return this.mailers[name];
  }

  /**
   * Resolve mailer
   * @private
   */
  async resolve(name) {
    const config = this.getConfig(name);

    if (!config || !config.transport) {
      throw new Error(`Mailer [${name}] is not configured.`);
    }

    const transport = config.transport;

    if (this.customCreators[transport]) {
      return await this.customCreators[transport](this.app, config);
    }

    const method = `create${this.capitalize(transport)}Transport`;
    
    if (typeof this[method] === 'function') {
      return await this[method](config);
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
   * Create Mailjet transport
   * @private
   */
  async createMailjetTransport(config) {
    const nodemailer = await import('nodemailer');
    const Mailjet = await import('node-mailjet');
    
    // Validate credentials
    if (!config.api_key || !config.api_secret) {
      throw new Error(`Mailjet credentials missing. api_key: ${!!config.api_key}, api_secret: ${!!config.api_secret}`);
    }
    
    // Create Mailjet client
    const mailjetClient = Mailjet.default.apiConnect(
      config.api_key,
      config.api_secret
    );
    
    // Create custom transport for nodemailer
    const mailjetTransport = {
      name: 'mailjet',
      version: '1.0.0',
      send: async (mail, callback) => {
        try {
          const info = mail.message.createReadStream();
          const chunks = [];
          
          info.on('data', (chunk) => chunks.push(chunk));
          info.on('end', async () => {
            try {
              const rawEmail = Buffer.concat(chunks).toString();
              const recipients = [];
              
              // Parse recipients
              if (mail.data.to) {
                const toAddresses = Array.isArray(mail.data.to) ? mail.data.to : [mail.data.to];
                toAddresses.forEach(addr => {
                  const email = typeof addr === 'string' ? addr : addr.address;
                  recipients.push({ Email: email });
                });
              }
              
              // Prepare Mailjet message
              const messages = [{
                From: {
                  Email: typeof mail.data.from === 'string' 
                    ? mail.data.from.match(/<(.+)>/)?.[1] || mail.data.from
                    : mail.data.from.address,
                  Name: typeof mail.data.from === 'string'
                    ? mail.data.from.match(/^(.+?)\s*</)?.[1] || ''
                    : mail.data.from.name || ''
                },
                To: recipients,
                Subject: mail.data.subject,
                TextPart: mail.data.text || '',
                HTMLPart: mail.data.html || ''
              }];
              
              // Send via Mailjet
              const result = await mailjetClient
                .post('send', { version: 'v3.1' })
                .request({ Messages: messages });
              
              callback(null, {
                messageId: result.body.Messages[0].To[0].MessageID,
                response: result.body
              });
            } catch (error) {
              callback(error);
            }
          });
          
          info.on('error', (error) => {
            callback(error);
          });
        } catch (error) {
          callback(error);
        }
      }
    };
    
    return nodemailer.default.createTransport(mailjetTransport);
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
    const config = mailers[name];
    return config;
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
    const mailer = await this.mailer();
    return await mailer.sendMail(options);
  }

  /**
   * Clear cached transport(s)
   * Allows runtime config changes to take effect
   * 
   * @param {string|null} mailerName - Specific mailer to clear, or null to clear all
   * @example
   * // Clear specific mailer
   * Mail.clearCache('mailjet');
   * 
   * // Clear all cached transports
   * Mail.clearCache();
   */
  clearCache(mailerName = null) {
    if (mailerName) {
      delete this.transports[mailerName];
      console.log(`[MailManager] Cleared cache for mailer: ${mailerName}`);
    } else {
      this.transports = {};
      console.log('[MailManager] Cleared all mail transport caches');
    }
  }

  /**
   * Reload mailer with fresh config
   * Clears cache and recreates transport
   * 
   * @param {string|null} mailerName - Specific mailer to reload, or null for default
   * @returns {Promise<Object>} Fresh mailer transport
   * @example
   * // Reload default mailer
   * await Mail.reload();
   * 
   * // Reload specific mailer
   * await Mail.reload('mailjet');
   */
  async reload(mailerName = null) {
    this.clearCache(mailerName);
    return await this.mailer(mailerName);
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache information
   */
  getCacheInfo() {
    return {
      cachedTransports: Object.keys(this.transports),
      count: Object.keys(this.transports).length,
    };
  }
}

export default MailManager;
