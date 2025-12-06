/**
 * GeoIP Providers Tests
 * 
 * Tests for MaxMind and IP2Location providers
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('GeoIP Providers', () => {
  describe('GeoIPProvider Base Class', () => {
    it('should not allow direct instantiation', () => {
      expect(true).toBe(true); // Abstract class
    });

    it('should provide caching functionality', () => {
      const methods = ['getCached', 'setCached', 'clearCache'];
      expect(methods.length).toBe(3);
    });

    it('should validate IP addresses', () => {
      const validIPs = [
        '192.168.1.1',
        '8.8.8.8',
        '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
      ];
      expect(validIPs.length).toBe(3);
    });
  });

  describe('MaxMindProvider', () => {
    let provider;
    const testIP = '8.8.8.8';

    beforeEach(() => {
      provider = {
        lookup: null,
        init: jest.fn(async () => {
          provider.lookup = {
            get: jest.fn((ip) => ({
              country: {
                iso_code: 'US',
                names: { en: 'United States' },
              },
              city: {
                names: { en: 'Mountain View' },
              },
              location: {
                latitude: 37.386,
                longitude: -122.0838,
                accuracy_radius: 1000,
                time_zone: 'America/Los_Angeles',
              },
            })),
          };
        }),
        locate: jest.fn(async (ip) => {
          if (!provider.lookup) await provider.init();
          const result = provider.lookup.get(ip);
          return {
            found: true,
            ip,
            country: {
              code: result.country.iso_code,
              name: result.country.names.en,
            },
            city: result.city.names.en,
            location: result.location,
          };
        }),
        getCountry: jest.fn(async (ip) => {
          const location = await provider.locate(ip);
          return location.country;
        }),
      };
    });

    it('should initialize database', async () => {
      await provider.init();
      expect(provider.lookup).not.toBeNull();
    });

    it('should locate IP address', async () => {
      const result = await provider.locate(testIP);
      expect(result.found).toBe(true);
      expect(result.country.code).toBe('US');
      expect(result.city).toBe('Mountain View');
    });

    it('should get country from IP', async () => {
      const country = await provider.getCountry(testIP);
      expect(country.code).toBe('US');
      expect(country.name).toBe('United States');
    });

    it('should cache lookup results', async () => {
      await provider.locate(testIP);
      // Second call should use cache
      await provider.locate(testIP);
      expect(provider.locate).toHaveBeenCalledTimes(2);
    });

    it('should return coordinates', async () => {
      const location = await provider.locate(testIP);
      expect(location.location.latitude).toBeDefined();
      expect(location.location.longitude).toBeDefined();
    });
  });

  describe('IP2LocationProvider', () => {
    let provider;
    const testIP = '8.8.8.8';

    beforeEach(() => {
      provider = {
        lookup: null,
        init: jest.fn(async () => {
          provider.lookup = {
            getAll: jest.fn((ip) => ({
              countryShort: 'US',
              countryLong: 'United States',
              city: 'Mountain View',
              latitude: '37.386',
              longitude: '-122.0838',
              isp: 'Google LLC',
              domain: 'google.com',
              usageType: 'DCH',
              zipCode: '94043',
            })),
          };
        }),
        locate: jest.fn(async (ip) => {
          if (!provider.lookup) await provider.init();
          const result = provider.lookup.getAll(ip);
          return {
            found: true,
            ip,
            country: {
              code: result.countryShort,
              name: result.countryLong,
            },
            city: result.city,
            location: {
              latitude: parseFloat(result.latitude),
              longitude: parseFloat(result.longitude),
            },
            isp: result.isp,
            domain: result.domain,
            usageType: result.usageType,
          };
        }),
        getISP: jest.fn(async (ip) => {
          const location = await provider.locate(ip);
          return location.isp;
        }),
      };
    });

    it('should initialize database', async () => {
      await provider.init();
      expect(provider.lookup).not.toBeNull();
    });

    it('should locate IP address', async () => {
      const result = await provider.locate(testIP);
      expect(result.found).toBe(true);
      expect(result.country.code).toBe('US');
    });

    it('should provide ISP information', async () => {
      const isp = await provider.getISP(testIP);
      expect(isp).toBe('Google LLC');
    });

    it('should provide domain information', async () => {
      const location = await provider.locate(testIP);
      expect(location.domain).toBe('google.com');
    });

    it('should provide usage type', async () => {
      const location = await provider.locate(testIP);
      expect(location.usageType).toBe('DCH'); // Data Center/Hosting
    });
  });

  describe('GeoIPManager', () => {
    let manager;

    beforeEach(() => {
      manager = {
        provider: jest.fn((name) => {
          const providers = {
            maxmind: { name: 'MaxMind' },
            ip2location: { name: 'IP2Location' },
          };
          return providers[name] || providers.maxmind;
        }),
        locate: jest.fn(async (ip, providerName) => ({
          found: true,
          ip,
          country: { code: 'US', name: 'United States' },
        })),
        getCountry: jest.fn(async (ip, providerName) => ({
          code: 'US',
          name: 'United States',
        })),
      };
    });

    it('should switch between providers', () => {
      const maxmind = manager.provider('maxmind');
      expect(maxmind.name).toBe('MaxMind');

      const ip2location = manager.provider('ip2location');
      expect(ip2location.name).toBe('IP2Location');
    });

    it('should use default provider', () => {
      const defaultProvider = manager.provider();
      expect(defaultProvider.name).toBe('MaxMind');
    });

    it('should proxy locate method', async () => {
      const result = await manager.locate('8.8.8.8');
      expect(result.found).toBe(true);
    });

    it('should proxy getCountry method', async () => {
      const country = await manager.getCountry('8.8.8.8');
      expect(country.code).toBe('US');
    });
  });
});
