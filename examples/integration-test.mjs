/**
 * Integration Test: ClientConfigGenerator with Frontend
 * 
 * This demonstrates how to set up a complete backend endpoint
 * that works with @vasuzex/client's loadAppConfig().
 */

import express from 'express';
import { ClientConfigGenerator } from '../framework/Http/ClientConfigGenerator.js';

// Create Express app
const app = express();

// Mock Config.get for this example (in real app, use actual Config)
const mockConfig = {
  'app.name': 'Vasuzex Framework',
  'app.env': 'development',
  'app.debug': true,
  'app.url': 'http://localhost:3000',
  'app.timezone': 'Asia/Kolkata',
  'app.locale': 'en-IN',
  'app.api_version': 'v1',
  'auth.enabled': true,
  'auth.login_url': '/api/auth/login',
  'auth.logout_url': '/api/auth/logout',
  'auth.token_key': 'auth_token',
  'auth.registration': true,
  'auth.password_reset': true,
  'upload.enabled': true,
  'upload.max_file_size': 10485760,
  'payment.enabled': false,
};

// Monkey-patch Config.get for this example
const Config = {
  get: (key, defaultValue) => mockConfig[key] !== undefined ? mockConfig[key] : defaultValue
};

// Temporarily replace the import
import ConfigFacade from '../framework/Support/Facades/Config.js';
Object.defineProperty(ConfigFacade, 'get', {
  value: Config.get,
  writable: true,
  configurable: true
});

// Routes
app.get('/api/config', (req, res) => {
  try {
    const config = ClientConfigGenerator.generate(req.app);
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/config/public', (req, res) => {
  try {
    const config = ClientConfigGenerator.generatePublic(req.app);
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = 3456;
const server = app.listen(PORT, () => {
  console.log(`✓ Test server running on http://localhost:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET http://localhost:${PORT}/api/config`);
  console.log(`  GET http://localhost:${PORT}/api/config/public`);
  
  console.log(`\nTesting endpoints...\n`);

  // Make test requests
  Promise.all([
    fetch(`http://localhost:${PORT}/api/config`).then(r => r.json()),
    fetch(`http://localhost:${PORT}/api/config/public`).then(r => r.json()),
  ]).then(([fullConfig, publicConfig]) => {
    console.log('✅ Full Config Response:');
    console.log('  Keys:', Object.keys(fullConfig));
    console.log('  App Name:', fullConfig.app?.name);
    console.log('  API Base:', fullConfig.api?.baseUrl);
    console.log('  Features:', Object.keys(fullConfig.features || {}).length, 'features');
    
    console.log('\n✅ Public Config Response:');
    console.log('  Keys:', Object.keys(publicConfig));
    console.log('  Has sensitive data?', publicConfig.upload !== undefined ? 'YES (unexpected)' : 'NO (expected)');
    
    console.log('\n✨ Integration test passed!');
    console.log('\nFrontend usage:');
    console.log(`  import { loadAppConfig } from '@vasuzex/client/Config';`);
    console.log(`  const config = await loadAppConfig('http://localhost:${PORT}/api/config');`);
    
    server.close();
  }).catch(error => {
    console.error('❌ Test failed:', error.message);
    server.close();
  });
});
