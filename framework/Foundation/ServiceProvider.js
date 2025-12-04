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
}

export default ServiceProvider;
