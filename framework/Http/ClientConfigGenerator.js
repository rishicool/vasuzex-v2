/**
 * Client Config Generator
 * 
 * Generates frontend-compatible configuration from backend settings.
 * Used with @vasuzex/client package's ConfigLoader.
 * 
 * @example
 * // In a route/controller
 * import { ClientConfigGenerator } from 'vasuzex-framework';
 * 
 * app.get('/api/config', (req, res) => {
 *   const config = ClientConfigGenerator.generate(req.app);
 *   res.json(config);
 * });
 * 
 * @example
 * // With custom config
 * const config = ClientConfigGenerator.generate(app, {
 *   customField: 'value',
 *   override: {
 *     apiBaseUrl: 'https://custom-api.example.com'
 *   }
 * });
 */

import Config from '../Support/Facades/Config.js';

export class ClientConfigGenerator {
  /**
   * Generate client configuration from backend config
   * 
   * @param {Object} app - Express app instance
   * @param {Object} options - Additional options
   * @param {Object} options.custom - Custom config to merge
   * @param {Object} options.override - Config to override defaults
   * @param {Array<string>} options.expose - Additional config keys to expose
   * @param {Array<string>} options.exclude - Config keys to exclude
   * @returns {Object} Client-safe configuration
   */
  static generate(app, options = {}) {
    const {
      custom = {},
      override = {},
      expose = [],
      exclude = []
    } = options;

    // Base configuration
    const config = {
      // Application info
      app: {
        name: Config.get('app.name', 'Vasuzex'),
        env: Config.get('app.env', 'production'),
        debug: Config.get('app.debug', false),
        url: Config.get('app.url', ''),
        timezone: Config.get('app.timezone', 'UTC'),
        locale: Config.get('app.locale', 'en'),
      },

      // API configuration
      api: {
        baseUrl: Config.get('app.url', ''),
        timeout: Config.get('http.timeout', 30000),
        version: Config.get('app.api_version', 'v1'),
      },

      // Authentication
      auth: {
        enabled: Config.get('auth.enabled', true),
        loginUrl: Config.get('auth.login_url', '/login'),
        logoutUrl: Config.get('auth.logout_url', '/logout'),
        tokenKey: Config.get('auth.token_key', 'auth_token'),
        guards: this._getAuthGuards(),
      },

      // Feature flags
      features: {
        registration: Config.get('auth.registration', true),
        passwordReset: Config.get('auth.password_reset', true),
        emailVerification: Config.get('auth.email_verification', false),
        twoFactor: Config.get('auth.two_factor', false),
        payments: Config.get('payment.enabled', false),
        uploads: Config.get('upload.enabled', true),
        notifications: Config.get('notification.enabled', false),
        broadcasting: Config.get('broadcasting.enabled', false),
        geoip: Config.get('geoip.enabled', false),
        media: Config.get('media.enabled', false),
      },

      // Upload/Media configuration
      upload: {
        enabled: Config.get('upload.enabled', true),
        maxFileSize: Config.get('upload.max_file_size', 10485760), // 10MB
        allowedTypes: Config.get('upload.allowed_types', ['image/jpeg', 'image/png', 'image/gif']),
        maxFiles: Config.get('upload.max_files', 10),
      },

      // Pagination defaults
      pagination: {
        perPage: Config.get('app.pagination.per_page', 15),
        maxPerPage: Config.get('app.pagination.max_per_page', 100),
      },

      // Session configuration
      session: {
        lifetime: Config.get('session.lifetime', 120), // minutes
        expireOnClose: Config.get('session.expire_on_close', false),
      },

      // Branding/UI
      branding: {
        logo: Config.get('app.logo', null),
        favicon: Config.get('app.favicon', null),
        theme: Config.get('app.theme', 'light'),
        primaryColor: Config.get('app.primary_color', '#00994C'),
      },

      // Date/Time formatting
      formatting: {
        dateFormat: Config.get('app.date_format', 'DD/MM/YYYY'),
        timeFormat: Config.get('app.time_format', 'HH:mm'),
        timezone: Config.get('app.timezone', 'UTC'),
        locale: Config.get('app.locale', 'en'),
        currency: Config.get('app.currency', 'INR'),
      },

      // Validation rules (for client-side validation)
      validation: {
        passwordMinLength: Config.get('auth.password_min_length', 8),
        usernameMinLength: Config.get('auth.username_min_length', 3),
        usernameMaxLength: Config.get('auth.username_max_length', 20),
      },
    };

    // Add custom exposed keys
    expose.forEach(key => {
      if (!exclude.includes(key)) {
        this._setNestedValue(config, key, Config.get(key));
      }
    });

    // Remove excluded keys
    exclude.forEach(key => {
      this._deleteNestedValue(config, key);
    });

    // Merge custom config
    const merged = this._deepMerge(config, custom);

    // Apply overrides (takes precedence over everything)
    return this._deepMerge(merged, override);
  }

  /**
   * Get auth guards configuration (public info only)
   * 
   * @returns {Object} Guards configuration
   * @private
   */
  static _getAuthGuards() {
    const guards = Config.get('auth.guards', {});
    const publicGuards = {};

    Object.keys(guards).forEach(name => {
      publicGuards[name] = {
        driver: guards[name].driver,
        provider: guards[name].provider,
      };
    });

    return publicGuards;
  }

  /**
   * Deep merge two objects
   * 
   * @param {Object} target - Target object
   * @param {Object} source - Source object
   * @returns {Object} Merged object
   * @private
   */
  static _deepMerge(target, source) {
    const output = { ...target };

    if (this._isObject(target) && this._isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this._isObject(source[key])) {
          if (!(key in target)) {
            output[key] = source[key];
          } else {
            output[key] = this._deepMerge(target[key], source[key]);
          }
        } else {
          output[key] = source[key];
        }
      });
    }

    return output;
  }

  /**
   * Set nested value using dot notation
   * 
   * @param {Object} obj - Target object
   * @param {string} path - Dot notation path (e.g., 'app.name')
   * @param {*} value - Value to set
   * @private
   */
  static _setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  /**
   * Delete nested value using dot notation
   * 
   * @param {Object} obj - Target object
   * @param {string} path - Dot notation path
   * @private
   */
  static _deleteNestedValue(obj, path) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) return;
      current = current[key];
    }

    delete current[keys[keys.length - 1]];
  }

  /**
   * Check if value is a plain object
   * 
   * @param {*} item - Item to check
   * @returns {boolean}
   * @private
   */
  static _isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * Generate minimal config (for public pages)
   * 
   * @param {Object} app - Express app instance
   * @returns {Object} Minimal configuration
   */
  static generatePublic(app) {
    return {
      app: {
        name: Config.get('app.name', 'Vasuzex'),
        url: Config.get('app.url', ''),
      },
      branding: {
        logo: Config.get('app.logo', null),
        theme: Config.get('app.theme', 'light'),
        primaryColor: Config.get('app.primary_color', '#00994C'),
      },
      auth: {
        enabled: Config.get('auth.enabled', true),
        loginUrl: Config.get('auth.login_url', '/login'),
      },
      features: {
        registration: Config.get('auth.registration', true),
      },
    };
  }

  /**
   * Generate config for authenticated users
   * 
   * @param {Object} app - Express app instance
   * @param {Object} user - Authenticated user
   * @returns {Object} User-specific configuration
   */
  static generateForUser(app, user) {
    const config = this.generate(app);

    // Add user-specific config
    config.user = {
      permissions: user.permissions || [],
      roles: user.roles || [],
      preferences: user.preferences || {},
    };

    return config;
  }
}

export default ClientConfigGenerator;
