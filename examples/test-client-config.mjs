/**
 * Manual Test for ClientConfigGenerator
 * 
 * Run with: node examples/test-client-config.mjs
 */

import { ClientConfigGenerator } from '../framework/Http/ClientConfigGenerator.js';

// Mock app (not needed but matches API)
const app = {};

console.log('Testing ClientConfigGenerator...\n');

// Test 1: Basic generation
console.log('✓ Test 1: Basic generate()');
const config = ClientConfigGenerator.generate(app);
console.log('  - Generated config with keys:', Object.keys(config));
console.log('  - App name:', config.app?.name);
console.log('  - Features:', Object.keys(config.features || {}));

// Test 2: Custom config
console.log('\n✓ Test 2: Custom config merge');
const customConfig = ClientConfigGenerator.generate(app, {
  custom: {
    analytics: {
      enabled: true,
      trackingId: 'GA-123456'
    }
  }
});
console.log('  - Has analytics:', customConfig.analytics !== undefined);
console.log('  - Tracking ID:', customConfig.analytics?.trackingId);

// Test 3: Overrides
console.log('\n✓ Test 3: Override config');
const overrideConfig = ClientConfigGenerator.generate(app, {
  override: {
    app: {
      name: 'Overridden App Name'
    },
    api: {
      baseUrl: 'https://custom-api.example.com'
    }
  }
});
console.log('  - Overridden app name:', overrideConfig.app.name);
console.log('  - Overridden API base:', overrideConfig.api.baseUrl);

// Test 4: Public config
console.log('\n✓ Test 4: Public config generation');
const publicConfig = ClientConfigGenerator.generatePublic(app);
console.log('  - Public config keys:', Object.keys(publicConfig));
console.log('  - Has sensitive data (upload/session)?:', 
  publicConfig.upload !== undefined || publicConfig.session !== undefined);

// Test 5: User config
console.log('\n✓ Test 5: User-specific config');
const user = {
  id: 1,
  name: 'Test User',
  permissions: ['read:posts', 'write:posts'],
  roles: ['editor'],
  preferences: { theme: 'dark' }
};
const userConfig = ClientConfigGenerator.generateForUser(app, user);
console.log('  - Has user data:', userConfig.user !== undefined);
console.log('  - User permissions:', userConfig.user?.permissions);
console.log('  - User roles:', userConfig.user?.roles);

// Test 6: Helper methods
console.log('\n✓ Test 6: Helper methods');

// Deep merge test
const target = { a: 1, b: { c: 2 } };
const source = { b: { d: 3 }, e: 4 };
const merged = ClientConfigGenerator._deepMerge(target, source);
console.log('  - Deep merge result:', JSON.stringify(merged));
console.log('  - Expected: {"a":1,"b":{"c":2,"d":3},"e":4}');
console.log('  - Match:', JSON.stringify(merged) === '{"a":1,"b":{"c":2,"d":3},"e":4}');

// Set nested value test
const obj = {};
ClientConfigGenerator._setNestedValue(obj, 'a.b.c', 'test-value');
console.log('  - Set nested value:', obj.a?.b?.c === 'test-value');

// Delete nested value test
const obj2 = { x: { y: { z: 'value' } } };
ClientConfigGenerator._deleteNestedValue(obj2, 'x.y.z');
console.log('  - Delete nested value:', obj2.x?.y?.z === undefined);

// isObject test
console.log('  - isObject({}):', ClientConfigGenerator._isObject({}));
console.log('  - isObject([]):', ClientConfigGenerator._isObject([]));
console.log('  - isObject(null):', ClientConfigGenerator._isObject(null));

console.log('\n✅ All manual tests completed!');
console.log('\nSample JSON output (first 500 chars):');
console.log(JSON.stringify(config, null, 2).substring(0, 500) + '...');
