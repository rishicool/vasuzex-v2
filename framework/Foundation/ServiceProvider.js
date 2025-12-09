/**
 * ServiceProvider - Base class for service providers
 * Laravel-inspired service provider pattern
 */
export class ServiceProvider {
  constructor(app) {
    this.app = app;
  }

  /**
   * Register services in the container
   * Override this method in subclasses
   */
  register() {
    // Override in subclass
  }

  /**
   * Bootstrap services
   * Override this method in subclasses
   */
  boot() {
    // Override in subclass
  }

  /**
   * Bind a service to the container
   */
  bind(abstract, concrete, singleton = false) {
    return this.app.bind(abstract, concrete, singleton);
  }

  /**
   * Bind a singleton to the container
   */
  singleton(abstract, concrete) {
    return this.app.singleton(abstract, concrete);
  }

  /**
   * Bind an instance to the container
   */
  instance(abstract, instance) {
    return this.app.instance(abstract, instance);
  }

  /**
   * Create an alias
   */
  alias(alias, abstract) {
    return this.app.alias(alias, abstract);
  }

  /**
   * Resolve a service from the container
   */
  make(abstract) {
    return this.app.make(abstract);
  }

  /**
   * Get configuration value
   */
  config(key, defaultValue = null) {
    return this.app.config(key, defaultValue);
  }
}

export default ServiceProvider;
