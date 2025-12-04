import { Router as ExpressRouter } from 'express';

/**
 * Router - Express-based routing with Laravel-like syntax
 */
export class Router {
  constructor() {
    this.router = ExpressRouter();
  }

  /**
   * Register a GET route
   */
  get(path, ...handlers) {
    this.router.get(path, ...handlers);
    return this;
  }

  /**
   * Register a POST route
   */
  post(path, ...handlers) {
    this.router.post(path, ...handlers);
    return this;
  }

  /**
   * Register a PUT route
   */
  put(path, ...handlers) {
    this.router.put(path, ...handlers);
    return this;
  }

  /**
   * Register a PATCH route
   */
  patch(path, ...handlers) {
    this.router.patch(path, ...handlers);
    return this;
  }

  /**
   * Register a DELETE route
   */
  delete(path, ...handlers) {
    this.router.delete(path, ...handlers);
    return this;
  }

  /**
   * Register routes for all HTTP methods
   */
  any(path, ...handlers) {
    this.router.all(path, ...handlers);
    return this;
  }

  /**
   * Group routes with common prefix/middleware
   */
  group(options, callback) {
    const groupRouter = new Router();
    callback(groupRouter);

    if (options.middleware) {
      this.router.use(options.prefix || '/', options.middleware, groupRouter.getRouter());
    } else {
      this.router.use(options.prefix || '/', groupRouter.getRouter());
    }

    return this;
  }

  /**
   * Apply middleware to router
   */
  use(...middleware) {
    this.router.use(...middleware);
    return this;
  }

  /**
   * Get underlying Express router
   */
  getRouter() {
    return this.router;
  }
}

export default Router;
