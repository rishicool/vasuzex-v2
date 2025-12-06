/**
 * ClientConfigGenerator Tests
 * 
 * Test suite for the ClientConfigGenerator class
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { ClientConfigGenerator } from '../../framework/Http/ClientConfigGenerator.js';
import Config from '../../framework/Support/Facades/Config.js';

describe('ClientConfigGenerator', () => {
  let mockApp;

  beforeEach(() => {
    mockApp = {};
    
    // Mock Config.get
    jest.spyOn(Config, 'get').mockImplementation((key, defaultValue) => {
      const mockConfig = {
        'app.name': 'Test App',
        'app.env': 'testing',
        'app.debug': true,
        'app.url': 'http://localhost:3000',
        'app.timezone': 'Asia/Kolkata',
        'app.locale': 'en-IN',
        'app.api_version': 'v1',
        'app.logo': '/images/logo.png',
        'app.theme': 'dark',
        'app.primary_color': '#ff0000',
        'app.date_format': 'DD/MM/YYYY',
        'app.time_format': 'HH:mm',
        'app.currency': 'INR',
        'app.pagination.per_page': 20,
        'app.pagination.max_per_page': 200,
        'auth.enabled': true,
        'auth.login_url': '/auth/login',
        'auth.logout_url': '/auth/logout',
        'auth.token_key': 'jwt_token',
        'auth.registration': true,
        'auth.password_reset': true,
        'auth.email_verification': true,
        'auth.two_factor': true,
        'auth.password_min_length': 10,
        'auth.username_min_length': 5,
        'auth.username_max_length': 30,
        'auth.guards': {
          web: { driver: 'session', provider: 'users' },
          api: { driver: 'jwt', provider: 'users', secret: 'secret123' }
        },
        'http.timeout': 60000,
        'upload.enabled': true,
        'upload.max_file_size': 5242880, // 5MB
        'upload.allowed_types': ['image/jpeg', 'image/png'],
        'upload.max_files': 5,
        'session.lifetime': 240,
        'session.expire_on_close': true,
        'payment.enabled': true,
        'notification.enabled': true,
        'broadcasting.enabled': true,
        'geoip.enabled': true,
        'media.enabled': true,
        'mail.from.address': 'no-reply@example.com',
        'services.stripe.key': 'pk_test_123',
      };

      return mockConfig[key] !== undefined ? mockConfig[key] : defaultValue;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generate()', () => {
    it('should generate basic configuration', () => {
      const config = ClientConfigGenerator.generate(mockApp);

      expect(config).toBeDefined();
      expect(config.app).toBeDefined();
      expect(config.api).toBeDefined();
      expect(config.auth).toBeDefined();
      expect(config.features).toBeDefined();
    });

    it('should include app configuration', () => {
      const config = ClientConfigGenerator.generate(mockApp);

      expect(config.app.name).toBe('Test App');
      expect(config.app.env).toBe('testing');
      expect(config.app.debug).toBe(true);
      expect(config.app.url).toBe('http://localhost:3000');
      expect(config.app.timezone).toBe('Asia/Kolkata');
      expect(config.app.locale).toBe('en-IN');
    });

    it('should include API configuration', () => {
      const config = ClientConfigGenerator.generate(mockApp);

      expect(config.api.baseUrl).toBe('http://localhost:3000');
      expect(config.api.timeout).toBe(60000);
      expect(config.api.version).toBe('v1');
    });

    it('should include auth configuration without secrets', () => {
      const config = ClientConfigGenerator.generate(mockApp);

      expect(config.auth.enabled).toBe(true);
      expect(config.auth.loginUrl).toBe('/auth/login');
      expect(config.auth.logoutUrl).toBe('/auth/logout');
      expect(config.auth.tokenKey).toBe('jwt_token');
      expect(config.auth.guards).toBeDefined();
      expect(config.auth.guards.web).toEqual({ driver: 'session', provider: 'users' });
      expect(config.auth.guards.api).toEqual({ driver: 'jwt', provider: 'users' });
      expect(config.auth.guards.api.secret).toBeUndefined(); // Should not expose secret
    });

    it('should include feature flags', () => {
      const config = ClientConfigGenerator.generate(mockApp);

      expect(config.features.registration).toBe(true);
      expect(config.features.passwordReset).toBe(true);
      expect(config.features.emailVerification).toBe(true);
      expect(config.features.twoFactor).toBe(true);
      expect(config.features.payments).toBe(true);
      expect(config.features.uploads).toBe(true);
      expect(config.features.notifications).toBe(true);
      expect(config.features.broadcasting).toBe(true);
    });

    it('should include upload configuration', () => {
      const config = ClientConfigGenerator.generate(mockApp);

      expect(config.upload.enabled).toBe(true);
      expect(config.upload.maxFileSize).toBe(5242880);
      expect(config.upload.allowedTypes).toEqual(['image/jpeg', 'image/png']);
      expect(config.upload.maxFiles).toBe(5);
    });

    it('should include branding configuration', () => {
      const config = ClientConfigGenerator.generate(mockApp);

      expect(config.branding.logo).toBe('/images/logo.png');
      expect(config.branding.theme).toBe('dark');
      expect(config.branding.primaryColor).toBe('#ff0000');
    });

    it('should include formatting configuration', () => {
      const config = ClientConfigGenerator.generate(mockApp);

      expect(config.formatting.dateFormat).toBe('DD/MM/YYYY');
      expect(config.formatting.timeFormat).toBe('HH:mm');
      expect(config.formatting.currency).toBe('INR');
      expect(config.formatting.locale).toBe('en-IN');
    });

    it('should merge custom configuration', () => {
      const config = ClientConfigGenerator.generate(mockApp, {
        custom: {
          analytics: {
            enabled: true,
            trackingId: 'GA-123'
          }
        }
      });

      expect(config.analytics).toBeDefined();
      expect(config.analytics.enabled).toBe(true);
      expect(config.analytics.trackingId).toBe('GA-123');
    });

    it('should apply overrides', () => {
      const config = ClientConfigGenerator.generate(mockApp, {
        override: {
          app: {
            name: 'Overridden Name'
          },
          api: {
            baseUrl: 'https://api.override.com'
          }
        }
      });

      expect(config.app.name).toBe('Overridden Name');
      expect(config.api.baseUrl).toBe('https://api.override.com');
    });

    it('should expose additional config keys', () => {
      const config = ClientConfigGenerator.generate(mockApp, {
        expose: ['mail.from.address', 'services.stripe.key']
      });

      expect(config.mail.from.address).toBe('no-reply@example.com');
      expect(config.services.stripe.key).toBe('pk_test_123');
    });

    it('should exclude specified keys', () => {
      const config = ClientConfigGenerator.generate(mockApp, {
        exclude: ['auth.guards']
      });

      expect(config.auth.guards).toBeUndefined();
    });

    it('should not expose excluded keys even if in expose list', () => {
      const config = ClientConfigGenerator.generate(mockApp, {
        expose: ['auth.guards'],
        exclude: ['auth.guards']
      });

      expect(config.auth.guards).toBeUndefined();
    });
  });

  describe('generatePublic()', () => {
    it('should generate minimal public configuration', () => {
      const config = ClientConfigGenerator.generatePublic(mockApp);

      expect(config).toBeDefined();
      expect(Object.keys(config).length).toBeLessThan(5);
    });

    it('should include only public fields', () => {
      const config = ClientConfigGenerator.generatePublic(mockApp);

      expect(config.app).toBeDefined();
      expect(config.branding).toBeDefined();
      expect(config.auth).toBeDefined();
      expect(config.features).toBeDefined();
      
      // Should not include sensitive config
      expect(config.api).toBeUndefined();
      expect(config.upload).toBeUndefined();
      expect(config.session).toBeUndefined();
    });

    it('should include minimal auth info', () => {
      const config = ClientConfigGenerator.generatePublic(mockApp);

      expect(config.auth.enabled).toBe(true);
      expect(config.auth.loginUrl).toBe('/auth/login');
      expect(config.auth.guards).toBeUndefined();
    });
  });

  describe('generateForUser()', () => {
    it('should generate user-specific configuration', () => {
      const user = {
        id: 1,
        name: 'Test User',
        permissions: ['read:posts', 'write:posts'],
        roles: ['editor'],
        preferences: {
          theme: 'dark',
          notifications: true
        }
      };

      const config = ClientConfigGenerator.generateForUser(mockApp, user);

      expect(config.user).toBeDefined();
      expect(config.user.permissions).toEqual(['read:posts', 'write:posts']);
      expect(config.user.roles).toEqual(['editor']);
      expect(config.user.preferences).toEqual({
        theme: 'dark',
        notifications: true
      });
    });

    it('should include base config with user config', () => {
      const user = { permissions: [], roles: [] };
      const config = ClientConfigGenerator.generateForUser(mockApp, user);

      expect(config.app).toBeDefined();
      expect(config.api).toBeDefined();
      expect(config.user).toBeDefined();
    });
  });

  describe('Helper methods', () => {
    describe('_deepMerge()', () => {
      it('should merge nested objects', () => {
        const target = { a: 1, b: { c: 2 } };
        const source = { b: { d: 3 }, e: 4 };
        
        const result = ClientConfigGenerator._deepMerge(target, source);

        expect(result).toEqual({
          a: 1,
          b: { c: 2, d: 3 },
          e: 4
        });
      });

      it('should override primitive values', () => {
        const target = { a: 1, b: 2 };
        const source = { b: 3, c: 4 };
        
        const result = ClientConfigGenerator._deepMerge(target, source);

        expect(result).toEqual({ a: 1, b: 3, c: 4 });
      });
    });

    describe('_setNestedValue()', () => {
      it('should set nested value using dot notation', () => {
        const obj = {};
        ClientConfigGenerator._setNestedValue(obj, 'a.b.c', 'value');

        expect(obj).toEqual({ a: { b: { c: 'value' } } });
      });

      it('should override existing values', () => {
        const obj = { a: { b: { c: 'old' } } };
        ClientConfigGenerator._setNestedValue(obj, 'a.b.c', 'new');

        expect(obj.a.b.c).toBe('new');
      });
    });

    describe('_deleteNestedValue()', () => {
      it('should delete nested value using dot notation', () => {
        const obj = { a: { b: { c: 'value' } } };
        ClientConfigGenerator._deleteNestedValue(obj, 'a.b.c');

        expect(obj.a.b.c).toBeUndefined();
      });

      it('should handle non-existent paths gracefully', () => {
        const obj = { a: 1 };
        
        expect(() => {
          ClientConfigGenerator._deleteNestedValue(obj, 'x.y.z');
        }).not.toThrow();
      });
    });

    describe('_isObject()', () => {
      it('should return true for plain objects', () => {
        expect(ClientConfigGenerator._isObject({})).toBe(true);
        expect(ClientConfigGenerator._isObject({ a: 1 })).toBe(true);
      });

      it('should return false for arrays', () => {
        expect(ClientConfigGenerator._isObject([])).toBe(false);
        expect(ClientConfigGenerator._isObject([1, 2, 3])).toBe(false);
      });

      it('should return false for primitives', () => {
        expect(ClientConfigGenerator._isObject(null)).toBe(false);
        expect(ClientConfigGenerator._isObject(undefined)).toBe(false);
        expect(ClientConfigGenerator._isObject(123)).toBe(false);
        expect(ClientConfigGenerator._isObject('string')).toBe(false);
        expect(ClientConfigGenerator._isObject(true)).toBe(false);
      });
    });
  });
});
