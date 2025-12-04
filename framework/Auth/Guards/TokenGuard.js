/**
 * Token Guard
 * Laravel-inspired token-based authentication guard
 */

export class TokenGuard {
  constructor(provider, inputKey = 'api_token', storageKey = 'api_token', hash = false) {
    this.provider = provider;
    this.inputKey = inputKey;
    this.storageKey = storageKey;
    this.hash = hash;
    this.request = null;
    this.user = null;
  }

  /**
   * Get authenticated user
   */
  async user() {
    if (this.user) {
      return this.user;
    }

    const token = this.getTokenForRequest();

    if (!token) {
      return null;
    }

    this.user = await this.provider.retrieveByCredentials({
      [this.storageKey]: this.hash ? crypto.createHash('sha256').update(token).digest('hex') : token
    });

    return this.user;
  }

  /**
   * Get token from request
   */
  getTokenForRequest() {
    if (!this.request) {
      return null;
    }

    // Check query parameter
    let token = this.request.query?.[this.inputKey];

    // Check request body
    if (!token) {
      token = this.request.body?.[this.inputKey];
    }

    // Check bearer token
    if (!token) {
      const header = this.request.headers?.authorization || '';
      if (header.startsWith('Bearer ')) {
        token = header.substring(7);
      }
    }

    // Check password (for basic auth)
    if (!token && this.request.headers?.authorization) {
      const auth = this.request.headers.authorization;
      if (auth.startsWith('Basic ')) {
        const decoded = Buffer.from(auth.substring(6), 'base64').toString();
        const [, password] = decoded.split(':');
        token = password;
      }
    }

    return token;
  }

  /**
   * Validate credentials
   */
  async validate(credentials = {}) {
    if (!credentials[this.inputKey]) {
      return false;
    }

    const user = await this.provider.retrieveByCredentials({
      [this.storageKey]: this.hash 
        ? crypto.createHash('sha256').update(credentials[this.inputKey]).digest('hex')
        : credentials[this.inputKey]
    });

    return user !== null;
  }

  /**
   * Set the user
   */
  setUser(user) {
    this.user = user;
    return this;
  }

  /**
   * Set request
   */
  setRequest(request) {
    this.request = request;
    return this;
  }

  /**
   * Check if user is authenticated
   */
  async check() {
    return (await this.user()) !== null;
  }

  /**
   * Check if user is guest
   */
  async guest() {
    return !(await this.check());
  }

  /**
   * Get user ID
   */
  async id() {
    const user = await this.user();
    return user ? user.getAuthIdentifier() : null;
  }
}

export default TokenGuard;
