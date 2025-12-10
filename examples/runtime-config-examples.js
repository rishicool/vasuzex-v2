/**
 * Runtime Config Examples (Laravel-Style)
 * On-the-fly config get/set in Vasuzex-v2
 * 
 * EXACTLY like Laravel's Config facade!
 */

import { Application } from '../framework/Foundation/Application.js';

/**
 * Example 1: Basic Get/Set
 */
async function example1_basicGetSet() {
  console.log('\n=== Example 1: Basic Get/Set ===\n');
  
  const app = new Application(process.cwd());
  await app.bootstrap();
  
  // Laravel: Config::get('app.name')
  console.log('Original app name:', app.config('app.name'));
  
  // Laravel: Config::set('app.name', 'New Name')
  const config = app.make('config');
  config.set('app.name', 'Neastore Runtime Update!');
  
  console.log('Updated app name:', app.config('app.name'));
  
  // Set with dot notation
  config.set('app.custom_setting', 'My Custom Value');
  console.log('Custom setting:', app.config('app.custom_setting'));
}

/**
 * Example 2: Nested Config Updates
 */
async function example2_nestedConfig() {
  console.log('\n=== Example 2: Nested Config Updates ===\n');
  
  const app = new Application(process.cwd());
  await app.bootstrap();
  const config = app.make('config');
  
  // Original database config
  console.log('Original DB host:', app.config('database.connections.postgresql.host'));
  
  // Update nested value
  config.set('database.connections.postgresql.host', 'db.example.com');
  config.set('database.connections.postgresql.port', 5433);
  
  console.log('Updated DB host:', app.config('database.connections.postgresql.host'));
  console.log('Updated DB port:', app.config('database.connections.postgresql.port'));
  
  // Add new connection on-the-fly
  config.set('database.connections.mongodb', {
    driver: 'mongodb',
    host: 'localhost',
    port: 27017,
    database: 'neastore'
  });
  
  console.log('New MongoDB config:', app.config('database.connections.mongodb'));
}

/**
 * Example 3: Bulk Updates
 */
async function example3_bulkUpdates() {
  console.log('\n=== Example 3: Bulk Config Updates ===\n');
  
  const app = new Application(process.cwd());
  await app.bootstrap();
  const config = app.make('config');
  
  // Laravel: Config::set(['key1' => 'val1', 'key2' => 'val2'])
  config.set({
    'app.debug': false,
    'app.timezone': 'Asia/Kolkata',
    'app.locale': 'hi',
    'cache.default': 'redis'
  });
  
  console.log('Debug mode:', app.config('app.debug'));
  console.log('Timezone:', app.config('app.timezone'));
  console.log('Locale:', app.config('app.locale'));
  console.log('Cache driver:', app.config('cache.default'));
}

/**
 * Example 4: Array Operations
 */
async function example4_arrayOperations() {
  console.log('\n=== Example 4: Array Operations ===\n');
  
  const app = new Application(process.cwd());
  await app.bootstrap();
  const config = app.make('config');
  
  // Create array config
  config.set('app.allowed_hosts', ['localhost', '127.0.0.1']);
  console.log('Initial hosts:', app.config('app.allowed_hosts'));
  
  // Push new value (Laravel: Config::push())
  config.push('app.allowed_hosts', 'example.com');
  console.log('After push:', app.config('app.allowed_hosts'));
  
  // Prepend value (Laravel: Config::prepend())
  config.prepend('app.allowed_hosts', 'app.local');
  console.log('After prepend:', app.config('app.allowed_hosts'));
}

/**
 * Example 5: Runtime Feature Flags
 */
async function example5_featureFlags() {
  console.log('\n=== Example 5: Runtime Feature Flags ===\n');
  
  const app = new Application(process.cwd());
  await app.bootstrap();
  const config = app.make('config');
  
  // Enable/disable features at runtime
  config.set('features.new_checkout', true);
  config.set('features.beta_ui', false);
  config.set('features.payment_gateway_v2', true);
  
  // Use in code
  if (app.config('features.new_checkout')) {
    console.log('✅ New checkout enabled');
  }
  
  if (!app.config('features.beta_ui')) {
    console.log('❌ Beta UI disabled');
  }
  
  console.log('All features:', app.config('features'));
}

/**
 * Example 6: API/Controller Usage
 */
async function example6_controllerUsage() {
  console.log('\n=== Example 6: Controller Usage ===\n');
  
  const app = new Application(process.cwd());
  await app.bootstrap();
  
  // Simulate controller/service accessing config
  class UserService {
    constructor(app) {
      this.app = app;
      this.config = app.make('config');
    }
    
    getMaxLoginAttempts() {
      // Get with default
      return this.app.config('auth.max_login_attempts', 5);
    }
    
    setMaxLoginAttempts(attempts) {
      this.config.set('auth.max_login_attempts', attempts);
    }
    
    enableTwoFactor() {
      this.config.set('auth.two_factor_enabled', true);
      console.log('✅ Two-factor authentication enabled');
    }
  }
  
  const userService = new UserService(app);
  
  console.log('Max login attempts:', userService.getMaxLoginAttempts());
  
  userService.setMaxLoginAttempts(3);
  console.log('Updated max attempts:', userService.getMaxLoginAttempts());
  
  userService.enableTwoFactor();
  console.log('2FA enabled:', app.config('auth.two_factor_enabled'));
}

/**
 * Example 7: Check if Config Exists
 */
async function example7_checkExists() {
  console.log('\n=== Example 7: Check Config Exists ===\n');
  
  const app = new Application(process.cwd());
  await app.bootstrap();
  const config = app.make('config');
  
  // Laravel: Config::has('key')
  console.log('Has app.name?', config.has('app.name'));
  console.log('Has app.nonexistent?', config.has('app.nonexistent'));
  
  // Set and check
  config.set('temp.test', 'value');
  console.log('Has temp.test?', config.has('temp.test'));
}

/**
 * Example 8: Get All Config
 */
async function example8_getAllConfig() {
  console.log('\n=== Example 8: Get All Config ===\n');
  
  const app = new Application(process.cwd());
  await app.bootstrap();
  const config = app.make('config');
  
  // Laravel: Config::all()
  const allConfig = config.all();
  console.log('All config keys:', Object.keys(allConfig));
  
  // Get multiple values
  const values = config.get(['app.name', 'app.env', 'app.debug']);
  console.log('Multiple values:', values);
}

/**
 * Example 9: Merge Config
 */
async function example9_mergeConfig() {
  console.log('\n=== Example 9: Merge Config ===\n');
  
  const app = new Application(process.cwd());
  await app.bootstrap();
  const config = app.make('config');
  
  // Merge new config section
  config.merge({
    payment: {
      gateway: 'razorpay',
      key: 'rzp_test_xxx',
      webhook_secret: 'whsec_xxx'
    }
  });
  
  console.log('Payment config:', app.config('payment'));
  console.log('Payment gateway:', app.config('payment.gateway'));
}

/**
 * Example 10: Real-World - Dynamic CORS Update
 */
async function example10_dynamicCORS() {
  console.log('\n=== Example 10: Dynamic CORS Update ===\n');
  
  const app = new Application(process.cwd());
  await app.bootstrap();
  const config = app.make('config');
  
  // Original CORS origin
  console.log('Original CORS:', app.config('cors.origin'));
  
  // Add new allowed origin at runtime
  const currentOrigins = app.config('cors.origin', []);
  const newOrigins = Array.isArray(currentOrigins) 
    ? currentOrigins 
    : [currentOrigins];
  
  newOrigins.push('https://admin.example.com');
  config.set('cors.origin', newOrigins);
  
  console.log('Updated CORS origins:', app.config('cors.origin'));
  
  // Update methods
  config.set('cors.methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  console.log('Updated methods:', app.config('cors.methods'));
}

/**
 * Run all examples
 */
async function runAllExamples() {
  try {
    await example1_basicGetSet();
    await example2_nestedConfig();
    await example3_bulkUpdates();
    await example4_arrayOperations();
    await example5_featureFlags();
    await example6_controllerUsage();
    await example7_checkExists();
    await example8_getAllConfig();
    await example9_mergeConfig();
    await example10_dynamicCORS();
    
    console.log('\n✅ All examples completed successfully!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}

export {
  example1_basicGetSet,
  example2_nestedConfig,
  example3_bulkUpdates,
  example4_arrayOperations,
  example5_featureFlags,
  example6_controllerUsage,
  example7_checkExists,
  example8_getAllConfig,
  example9_mergeConfig,
  example10_dynamicCORS
};
