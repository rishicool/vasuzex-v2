/**
 * Request - Enhanced Express Request
 * Laravel-like request helper methods
 */
export class Request {
  constructor(req) {
    this.req = req;
  }

  /**
   * Get all input data
   */
  all() {
    return { ...this.req.body, ...this.req.query, ...this.req.params };
  }

  /**
   * Get specific input value
   */
  input(key, defaultValue = null) {
    return this.all()[key] ?? defaultValue;
  }

  /**
   * Get only specified keys
   */
  only(keys) {
    const data = this.all();
    return keys.reduce((acc, key) => {
      if (key in data) acc[key] = data[key];
      return acc;
    }, {});
  }

  /**
   * Get all except specified keys
   */
  except(keys) {
    const data = this.all();
    const result = { ...data };
    keys.forEach(key => delete result[key]);
    return result;
  }

  /**
   * Check if input exists
   */
  has(key) {
    return key in this.all();
  }

  /**
   * Get query parameter
   */
  query(key = null, defaultValue = null) {
    if (!key) return this.req.query;
    return this.req.query[key] ?? defaultValue;
  }

  /**
   * Get route parameter
   */
  param(key, defaultValue = null) {
    return this.req.params[key] ?? defaultValue;
  }

  /**
   * Get request body
   */
  body(key = null, defaultValue = null) {
    if (!key) return this.req.body;
    return this.req.body[key] ?? defaultValue;
  }

  /**
   * Get header value
   */
  header(key, defaultValue = null) {
    return this.req.get(key) ?? defaultValue;
  }

  /**
   * Get bearer token
   */
  bearerToken() {
    const auth = this.header('authorization');
    if (auth && auth.startsWith('Bearer ')) {
      return auth.substring(7);
    }
    return null;
  }

  /**
   * Get request method
   */
  method() {
    return this.req.method;
  }

  /**
   * Get request path
   */
  path() {
    return this.req.path;
  }

  /**
   * Get request URL
   */
  url() {
    return this.req.url;
  }

  /**
   * Get client IP
   */
  ip() {
    return this.req.ip;
  }

  /**
   * Get underlying Express request
   */
  getRequest() {
    return this.req;
  }
}

export default Request;
