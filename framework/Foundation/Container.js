/**
 * Container - IoC (Inversion of Control) Container
 * Laravel-inspired dependency injection container
 */
export class Container {
  constructor() {
    this.bindings = new Map();
    this.instances = new Map();
    this.singletons = new Set();
    this.aliases = new Map();
  }

  /**
   * Bind a class or factory to the container
   */
  bind(abstract, concrete, singleton = false) {
    this.bindings.set(abstract, concrete);
    
    if (singleton) {
      this.singletons.add(abstract);
    }
  }

  /**
   * Bind a singleton to the container
   */
  singleton(abstract, concrete) {
    this.bind(abstract, concrete, true);
  }

  /**
   * Bind an existing instance to the container
   */
  instance(abstract, instance) {
    this.instances.set(abstract, instance);
  }

  /**
   * Create an alias for a binding
   */
  alias(alias, abstract) {
    this.aliases.set(alias, abstract);
  }

  /**
   * Resolve a service from the container
   */
  make(abstract) {
    const key = this.aliases.get(abstract) || abstract;

    if (this.instances.has(key)) {
      return this.instances.get(key);
    }

    const concrete = this.bindings.get(key);
    
    if (!concrete) {
      throw new Error(`No binding found for "${abstract}"`);
    }

    const instance = typeof concrete === 'function' 
      ? new concrete() 
      : concrete;

    if (this.singletons.has(key)) {
      this.instances.set(key, instance);
    }

    return instance;
  }

  /**
   * Check if a binding exists
   */
  has(abstract) {
    const key = this.aliases.get(abstract) || abstract;
    return this.bindings.has(key) || this.instances.has(key);
  }

  /**
   * Remove a binding
   */
  forget(abstract) {
    const key = this.aliases.get(abstract) || abstract;
    this.bindings.delete(key);
    this.instances.delete(key);
    this.singletons.delete(key);
  }

  /**
   * Clear all bindings
   */
  flush() {
    this.bindings.clear();
    this.instances.clear();
    this.singletons.clear();
    this.aliases.clear();
  }
}

export default Container;
