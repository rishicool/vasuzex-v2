/**
 * HTTP Client Manager
 * Laravel HTTP client pattern for Node.js
 * 
 * Provides fluent HTTP client with interceptors, retries, and error handling.
 * Similar to Laravel's HTTP facade.
 * 
 * @example
 * import { Http } from '#framework';
 * 
 * // Simple request
 * const response = await Http.get('https://api.example.com/users');
 * 
 * // With authentication
 * const data = await Http.withToken(token)
 *   .get('https://api.example.com/profile');
 * 
 * // POST request
 * await Http.post('https://api.example.com/users', {
 *   name: 'John',
 *   email: 'john@example.com'
 * });
 * 
 * // With headers
 * await Http.withHeaders({ 'X-Custom': 'value' })
 *   .post(url, data);
 * 
 * // Retry on failure
 * await Http.retry(3).get(url);
 * 
 * // Timeout
 * await Http.timeout(5000).get(url);
 */

export class HttpManager {
  constructor(app) {
    this.app = app;
    this.axios = null;
    this.pendingRequest = {
      baseURL: null,
      headers: {},
      timeout: 30000,
      withCredentials: false,
      retries: 0,
      retryDelay: 1000,
      beforeRequest: null,
      afterResponse: null,
      onError: null,
    };
  }

  /**
   * Get axios instance (lazy loading)
   * @private
   */
  async getAxios() {
    if (!this.axios) {
      const axiosModule = await import('axios');
      this.axios = axiosModule.default;
    }
    return this.axios;
  }

  /**
   * Create a new pending request
   * @private
   */
  newPendingRequest() {
    return {
      baseURL: this.app.config('http.base_url', null),
      headers: { ...this.app.config('http.headers', {}) },
      timeout: this.app.config('http.timeout', 30000),
      withCredentials: false,
      retries: 0,
      retryDelay: 1000,
      beforeRequest: null,
      afterResponse: null,
      onError: null,
    };
  }

  /**
   * Set base URL
   */
  baseUrl(url) {
    const clone = this.clone();
    clone.pendingRequest.baseURL = url;
    return clone;
  }

  /**
   * Set request timeout
   */
  timeout(milliseconds) {
    const clone = this.clone();
    clone.pendingRequest.timeout = milliseconds;
    return clone;
  }

  /**
   * Set number of retries
   */
  retry(times, delay = 1000) {
    const clone = this.clone();
    clone.pendingRequest.retries = times;
    clone.pendingRequest.retryDelay = delay;
    return clone;
  }

  /**
   * Add headers
   */
  withHeaders(headers) {
    const clone = this.clone();
    clone.pendingRequest.headers = {
      ...clone.pendingRequest.headers,
      ...headers,
    };
    return clone;
  }

  /**
   * Add bearer token
   */
  withToken(token, type = 'Bearer') {
    return this.withHeaders({
      Authorization: `${type} ${token}`,
    });
  }

  /**
   * Add basic auth
   */
  withBasicAuth(username, password) {
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');
    return this.withHeaders({
      Authorization: `Basic ${credentials}`,
    });
  }

  /**
   * Accept JSON response
   */
  acceptJson() {
    return this.withHeaders({
      Accept: 'application/json',
    });
  }

  /**
   * Set content type to JSON
   */
  contentType(type) {
    return this.withHeaders({
      'Content-Type': type,
    });
  }

  /**
   * Send JSON content
   */
  asJson() {
    return this.contentType('application/json');
  }

  /**
   * Send form data
   */
  asForm() {
    return this.contentType('application/x-www-form-urlencoded');
  }

  /**
   * Send multipart form data
   */
  asMultipart() {
    return this.contentType('multipart/form-data');
  }

  /**
   * Include cookies
   */
  withCookies() {
    const clone = this.clone();
    clone.pendingRequest.withCredentials = true;
    return clone;
  }

  /**
   * Before request hook
   */
  beforeSending(callback) {
    const clone = this.clone();
    clone.pendingRequest.beforeRequest = callback;
    return clone;
  }

  /**
   * After response hook
   */
  afterResponse(callback) {
    const clone = this.clone();
    clone.pendingRequest.afterResponse = callback;
    return clone;
  }

  /**
   * Error handler
   */
  onError(callback) {
    const clone = this.clone();
    clone.pendingRequest.onError = callback;
    return clone;
  }

  /**
   * GET request
   */
  async get(url, query = null) {
    return await this.send('GET', url, {
      params: query,
    });
  }

  /**
   * POST request
   */
  async post(url, data = null) {
    return await this.send('POST', url, {
      data,
    });
  }

  /**
   * PUT request
   */
  async put(url, data = null) {
    return await this.send('PUT', url, {
      data,
    });
  }

  /**
   * PATCH request
   */
  async patch(url, data = null) {
    return await this.send('PATCH', url, {
      data,
    });
  }

  /**
   * DELETE request
   */
  async delete(url, data = null) {
    return await this.send('DELETE', url, {
      data,
    });
  }

  /**
   * HEAD request
   */
  async head(url) {
    return await this.send('HEAD', url);
  }

  /**
   * Send request
   * @private
   */
  async send(method, url, options = {}) {
    const axios = await this.getAxios();
    const config = {
      method,
      url,
      baseURL: this.pendingRequest.baseURL,
      headers: this.pendingRequest.headers,
      timeout: this.pendingRequest.timeout,
      withCredentials: this.pendingRequest.withCredentials,
      ...options,
    };

    // Before request hook
    if (this.pendingRequest.beforeRequest) {
      await this.pendingRequest.beforeRequest(config);
    }

    let lastError;
    const maxAttempts = this.pendingRequest.retries + 1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await axios(config);

        // After response hook
        if (this.pendingRequest.afterResponse) {
          await this.pendingRequest.afterResponse(response);
        }

        return new HttpResponse(response);
      } catch (error) {
        lastError = error;

        // Don't retry on client errors (4xx)
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          break;
        }

        // Wait before retry (except last attempt)
        if (attempt < maxAttempts - 1) {
          await this.sleep(this.pendingRequest.retryDelay);
        }
      }
    }

    // Error handler
    if (this.pendingRequest.onError) {
      await this.pendingRequest.onError(lastError);
    }

    throw new HttpException(lastError);
  }

  /**
   * Sleep utility
   * @private
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clone instance for chaining
   * @private
   */
  clone() {
    const cloned = new HttpManager(this.app);
    cloned.axios = this.axios;
    cloned.pendingRequest = { ...this.pendingRequest };
    return cloned;
  }

  /**
   * Pool - make concurrent requests
   */
  async pool(requests) {
    const results = await Promise.allSettled(
      requests.map(request => request())
    );

    return results.map((result, index) => ({
      index,
      status: result.status,
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null,
    }));
  }
}

/**
 * HTTP Response
 */
export class HttpResponse {
  constructor(response) {
    this.response = response;
    this.status = response.status;
    this.headers = response.headers;
    this.body = response.data;
  }

  /**
   * Get response data
   */
  json() {
    return this.body;
  }

  /**
   * Get response text
   */
  text() {
    return typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
  }

  /**
   * Check if successful (2xx)
   */
  successful() {
    return this.status >= 200 && this.status < 300;
  }

  /**
   * Check if OK (200)
   */
  ok() {
    return this.status === 200;
  }

  /**
   * Check if redirect (3xx)
   */
  redirect() {
    return this.status >= 300 && this.status < 400;
  }

  /**
   * Check if client error (4xx)
   */
  clientError() {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if server error (5xx)
   */
  serverError() {
    return this.status >= 500;
  }

  /**
   * Get header value
   */
  header(name) {
    return this.headers[name.toLowerCase()];
  }

  /**
   * Throw if not successful
   */
  throw() {
    if (!this.successful()) {
      throw new HttpException(new Error(`HTTP ${this.status}`));
    }
    return this;
  }

  /**
   * Get response as object with common properties
   */
  toObject() {
    return {
      status: this.status,
      headers: this.headers,
      body: this.body,
      successful: this.successful(),
    };
  }
}

/**
 * HTTP Exception
 */
export class HttpException extends Error {
  constructor(error) {
    super(error.message || 'HTTP request failed');
    this.name = 'HttpException';
    this.response = error.response;
    this.status = error.response?.status;
    this.data = error.response?.data;
    this.headers = error.response?.headers;
  }
}

export default HttpManager;
