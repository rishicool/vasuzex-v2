/**
 * ServiceFactory - Dependency injection container for services
 * 
 * Provides a centralized way to create and manage service instances.
 * Inspired by Laravel's Service Container pattern.
 */
export class ServiceFactory {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
    this.aliases = new Map();
  }

  /**
   * Register a service
   * 
   * @param {string} name - Service name
   * @param {function} creator - Service creator function
   * @param {boolean} singleton - Whether to create as singleton
   */
  register(name, creator, singleton = false) {
    if (singleton) {
      this.singletons.set(name, creator);
    } else {
      this.services.set(name, creator);
    }
  }

  /**
   * Register a singleton service
   * 
   * @param {string} name - Service name
   * @param {function} creator - Service creator function
   */
  singleton(name, creator) {
    this.register(name, creator, true);
  }

  /**
   * Register a service alias
   * 
   * @param {string} alias - Alias name
   * @param {string} name - Original service name
   */
  alias(alias, name) {
    this.aliases.set(alias, name);
  }

  /**
   * Resolve a service instance
   * 
   * @param {string} name - Service name or alias
   * @returns {object} Service instance
   */
  make(name) {
    // Resolve alias
    if (this.aliases.has(name)) {
      name = this.aliases.get(name);
    }

    // Check if singleton already instantiated
    if (this.singletons.has(name)) {
      const creator = this.singletons.get(name);
      
      // If creator is already an instance, return it
      if (typeof creator !== 'function') {
        return creator;
      }

      // Create and cache instance
      const instance = creator(this);
      this.singletons.set(name, instance);
      return instance;
    }

    // Create new instance
    if (this.services.has(name)) {
      const creator = this.services.get(name);
      return creator(this);
    }

    throw new Error(`Service [${name}] not found in container`);
  }

  /**
   * Check if service exists
   * 
   * @param {string} name - Service name
   * @returns {boolean}
   */
  has(name) {
    // Resolve alias
    if (this.aliases.has(name)) {
      name = this.aliases.get(name);
    }

    return this.services.has(name) || this.singletons.has(name);
  }

  /**
   * Remove a service
   * 
   * @param {string} name - Service name
   */
  forget(name) {
    this.services.delete(name);
    this.singletons.delete(name);
    
    // Remove aliases pointing to this service
    for (const [alias, serviceName] of this.aliases.entries()) {
      if (serviceName === name) {
        this.aliases.delete(alias);
      }
    }
  }

  /**
   * Clear all services
   */
  clear() {
    this.services.clear();
    this.singletons.clear();
    this.aliases.clear();
  }

  /**
   * Get all registered service names
   * 
   * @returns {array} Service names
   */
  getServiceNames() {
    return [
      ...this.services.keys(),
      ...this.singletons.keys(),
    ];
  }
}

/**
 * Create a new service factory instance
 * 
 * @returns {ServiceFactory}
 */
export function createServiceFactory() {
  return new ServiceFactory();
}

/**
 * Global service factory instance
 */
export const serviceFactory = new ServiceFactory();
