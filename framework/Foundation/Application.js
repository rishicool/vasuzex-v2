import express from 'express';
import { Container } from './Container.js';
import { LoadEnvironmentVariables, LoadConfiguration } from './Bootstrap/index.js';
import { Facade } from '../Support/Facades/Facade.js';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Application - Core application class
 * Laravel-inspired application container with bootstrap support
 */
export class Application extends Container {
  constructor(rootDir = null) {
    super();
    this.express = express();
    this.providers = [];
    this.booted = false;
    this.bootstrapped = false;
    this.rootDir = rootDir;
    
    this.instance('app', this);
    this.instance('express', this.express);
    
    // Set application instance for Facades
    Facade.setFacadeApplication(this);
  }

  /**
   * Bootstrap the application
   */
  async bootstrap() {
    if (this.bootstrapped) return;

    const rootDir = this.rootDir || this.detectRootDir();

    // Bootstrap in Laravel order
    const bootstrappers = [
      new LoadEnvironmentVariables(),
      new LoadConfiguration(),
    ];

    for (const bootstrapper of bootstrappers) {
      await bootstrapper.bootstrap(this, rootDir);
    }

    this.bootstrapped = true;
  }

  /**
   * Detect root directory (fallback)
   */
  detectRootDir() {
    const currentFilePath = fileURLToPath(import.meta.url);
    // Assume framework is 2 levels deep from root
    return path.resolve(path.dirname(currentFilePath), '../..');
  }

  /**
   * Get configuration value (Laravel helper)
   */
  config(key, defaultValue = null) {
    const config = this.make('config');
    return config ? config.get(key, defaultValue) : defaultValue;
  }

  /**
   * Register a service provider
   */
  register(ProviderClass, options = null) {
    const instance = new ProviderClass(this);
    
    if (options) {
      this.instance(`${ProviderClass.name}.options`, options);
    }

    this.providers.push(instance);
    return this;
  }

  /**
   * Bootstrap all service providers
   */
  async boot() {
    if (this.booted) return;

    // Bootstrap application first
    if (!this.bootstrapped) {
      await this.bootstrap();
    }

    // Register phase
    for (const provider of this.providers) {
      await provider.register();
    }

    // Boot phase
    for (const provider of this.providers) {
      await provider.boot();
    }

    this.booted = true;
  }

  /**
   * Get Express instance
   */
  getExpress() {
    return this.express;
  }

  /**
   * Use Express middleware
   */
  use(...args) {
    this.express.use(...args);
    return this;
  }

  /**
   * Start HTTP server
   */
  async listen(port, callback) {
    if (!this.booted) {
      await this.boot();
    }

    this.express.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      if (callback) callback();
    });
  }

  /**
   * Handle errors
   */
  handleError(handler) {
    this.express.use(handler);
    return this;
  }
}

export default Application;
