/**
 * Example Route: Client Config Endpoint
 * 
 * This example shows how to create an endpoint that serves
 * configuration to frontend applications using @vasuzex/client.
 * 
 * The frontend's loadAppConfig() will fetch from this endpoint.
 */

import { ClientConfigGenerator } from 'vasuzex-framework';

/**
 * Register client config routes
 * 
 * @param {Object} app - Express app instance
 */
export function registerClientConfigRoutes(app) {
  /**
   * GET /api/config
   * Returns full application configuration
   * (Use for authenticated users)
   */
  app.get('/api/config', (req, res) => {
    try {
      const config = ClientConfigGenerator.generate(req.app);
      res.json(config);
    } catch (error) {
      console.error('Config generation error:', error);
      res.status(500).json({
        error: 'Failed to generate configuration',
        message: error.message
      });
    }
  });

  /**
   * GET /api/config/public
   * Returns minimal public configuration
   * (Use for public/unauthenticated pages)
   */
  app.get('/api/config/public', (req, res) => {
    try {
      const config = ClientConfigGenerator.generatePublic(req.app);
      res.json(config);
    } catch (error) {
      console.error('Public config generation error:', error);
      res.status(500).json({
        error: 'Failed to generate public configuration',
        message: error.message
      });
    }
  });

  /**
   * GET /api/config/user
   * Returns user-specific configuration
   * (Requires authentication middleware)
   */
  app.get('/api/config/user', authenticateUser, (req, res) => {
    try {
      const config = ClientConfigGenerator.generateForUser(req.app, req.user);
      res.json(config);
    } catch (error) {
      console.error('User config generation error:', error);
      res.status(500).json({
        error: 'Failed to generate user configuration',
        message: error.message
      });
    }
  });

  /**
   * GET /api/config/custom
   * Returns custom configuration with additional fields
   */
  app.get('/api/config/custom', (req, res) => {
    try {
      const config = ClientConfigGenerator.generate(req.app, {
        // Add custom fields
        custom: {
          analytics: {
            enabled: true,
            trackingId: 'GA-XXXXXXXXX'
          },
          social: {
            facebook: 'https://facebook.com/example',
            twitter: 'https://twitter.com/example'
          }
        },
        
        // Override default values
        override: {
          api: {
            baseUrl: 'https://api.example.com'
          }
        },
        
        // Expose additional config keys
        expose: ['mail.from.address', 'services.stripe.key'],
        
        // Exclude sensitive keys
        exclude: ['auth.guards.api.secret']
      });

      res.json(config);
    } catch (error) {
      console.error('Custom config generation error:', error);
      res.status(500).json({
        error: 'Failed to generate custom configuration',
        message: error.message
      });
    }
  });
}

/**
 * Example authentication middleware
 * (Replace with your actual auth middleware)
 */
function authenticateUser(req, res, next) {
  // Example: Check for auth token
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  // Verify token and attach user to request
  // req.user = verifyToken(token);
  
  next();
}

/**
 * Usage in main app file:
 * 
 * import { registerClientConfigRoutes } from './routes/client-config.js';
 * 
 * const app = express();
 * registerClientConfigRoutes(app);
 * 
 * // Frontend usage with @vasuzex/client:
 * import { loadAppConfig } from '@vasuzex/client/Config';
 * 
 * const config = await loadAppConfig('/api/config');
 * console.log(config.app.name); // 'Vasuzex'
 * console.log(config.api.baseUrl); // 'http://localhost:3000'
 */
