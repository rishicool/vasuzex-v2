import { ServiceProvider } from '../../Foundation/ServiceProvider.js';
import { LogManager } from './LogManager.js';

/**
 * Log Service Provider
 * 
 * Registers Log service in the application container.
 * Provides logging capabilities via multiple channels (Console, File, Syslog, Stack).
 */
export class LogServiceProvider extends ServiceProvider {
  /**
   * Register the service
   */
  async register() {
    this.singleton('log', (app) => {
      return new LogManager(app);
    });

    // Create aliases
    this.alias('logger', 'log');
    this.alias('Logger', 'log');
  }

  /**
   * Bootstrap the service
   */
  async boot() {
    // Initialize default log channel
    if (this.config('logging.default')) {
      const log = this.make('log');
      const defaultChannel = this.config('logging.default', 'console');
      
      // Pre-create default channel to verify configuration
      try {
        log.driver(defaultChannel);
      } catch (error) {
        console.error(`[LogServiceProvider] Failed to initialize log channel [${defaultChannel}]:`, error.message);
      }
    }
  }
}

export default LogServiceProvider;
