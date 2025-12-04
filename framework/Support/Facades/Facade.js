/**
 * Base Facade Class
 * Laravel-style Facade pattern for static access to container services
 */

export class Facade {
  /**
   * Application instance
   */
  static app = null;

  /**
   * Resolved instances cache
   */
  static resolvedInstances = {};

  /**
   * Set the application instance
   */
  static setFacadeApplication(app) {
    this.app = app;
  }

  /**
   * Get the application instance
   */
  static getFacadeApplication() {
    return this.app;
  }

  /**
   * Get the registered name of the component (must be overridden)
   */
  static getFacadeAccessor() {
    throw new Error('Facade does not implement getFacadeAccessor method.');
  }

  /**
   * Resolve the facade root instance
   */
  static getFacadeRoot() {
    return this.resolveFacadeInstance(this.getFacadeAccessor());
  }

  /**
   * Resolve the facade instance
   */
  static resolveFacadeInstance(name) {
    if (this.resolvedInstances[name]) {
      return this.resolvedInstances[name];
    }

    if (this.app) {
      const instance = this.app.make(name);
      this.resolvedInstances[name] = instance;
      return instance;
    }

    throw new Error(`A facade root has not been set for ${name}.`);
  }

  /**
   * Clear a resolved facade instance
   */
  static clearResolvedInstance(name) {
    delete this.resolvedInstances[name];
  }

  /**
   * Clear all resolved instances
   */
  static clearResolvedInstances() {
    this.resolvedInstances = {};
  }

  /**
   * Proxy static calls to the facade root
   */
  static __callStatic(method, ...args) {
    const instance = this.getFacadeRoot();

    if (!instance) {
      throw new Error(`A facade root has not been set.`);
    }

    return instance[method](...args);
  }
}

/**
 * Create a Proxy-based facade for static method calls
 */
export function createFacade(FacadeClass) {
  return new Proxy(FacadeClass, {
    get(target, prop) {
      // Return static properties/methods
      if (prop in target) {
        return target[prop];
      }

      // Proxy to facade root instance
      return function (...args) {
        const instance = target.getFacadeRoot();
        
        if (typeof instance[prop] === 'function') {
          return instance[prop](...args);
        }
        
        return instance[prop];
      };
    }
  });
}

export default Facade;
