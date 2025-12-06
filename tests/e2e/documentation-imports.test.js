/**
 * E2E Test - Verify all documented imports work
 */

import { describe, it, expect } from '@jest/globals';

describe('E2E: Documented Imports', () => {
  it('should import all documented facades', async () => {
    const { 
      Log, 
      Cache, 
      GeoIP, 
      Media,
      DB,
      Auth,
      Hash,
      Storage,
      Upload,
      Mail,
      SMS
    } = await import('../../framework/index.js');

    expect(Log).toBeDefined();
    expect(Cache).toBeDefined();
    expect(GeoIP).toBeDefined();
    expect(Media).toBeDefined();
    expect(DB).toBeDefined();
    expect(Auth).toBeDefined();
    expect(Hash).toBeDefined();
    expect(Storage).toBeDefined();
    expect(Upload).toBeDefined();
    expect(Mail).toBeDefined();
    expect(SMS).toBeDefined();
  });

  it('should import PaymentManager from framework', async () => {
    const { PaymentManager } = await import('../../framework/index.js');
    
    expect(PaymentManager).toBeDefined();
    expect(typeof PaymentManager).toBe('function');
  });

  it('should import SecurityMiddleware from framework', async () => {
    const { SecurityMiddleware } = await import('../../framework/index.js');
    
    expect(SecurityMiddleware).toBeDefined();
    expect(typeof SecurityMiddleware).toBe('function');
  });

  it('should import payment gateways', async () => {
    const { 
      PhonePeGateway,
      RazorpayGateway,
      StripeGateway 
    } = await import('../../framework/index.js');

    expect(PhonePeGateway).toBeDefined();
    expect(RazorpayGateway).toBeDefined();
    expect(StripeGateway).toBeDefined();
  });

  it('should import middleware functions', async () => {
    const {
      authenticate,
      authorize,
      validateRequest,
      rateLimiter,
      mediaServer
    } = await import('../../framework/index.js');

    expect(authenticate).toBeDefined();
    expect(authorize).toBeDefined();
    expect(validateRequest).toBeDefined();
    expect(rateLimiter).toBeDefined();
    expect(mediaServer).toBeDefined();
  });

  it('should import Model and database utilities', async () => {
    const { 
      Model,
      Relations,
      Observer
    } = await import('../../framework/index.js');

    expect(Model).toBeDefined();
    expect(Relations).toBeDefined();
    expect(Observer).toBeDefined();
  });

  it('should import support utilities', async () => {
    const { 
      Collection,
      Str,
      Arr
    } = await import('../../framework/index.js');

    expect(Collection).toBeDefined();
    expect(Str).toBeDefined();
    expect(Arr).toBeDefined();
  });
});
