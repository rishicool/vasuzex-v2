/**
 * Session Guard
 * Laravel-inspired session-based authentication guard
 */

export class SessionGuard {
  constructor(name, provider, session, request = null) {
    this.name = name;
    this.provider = provider;
    this.session = session;
    this.request = request;
    this.user = null;
    this.lastAttempted = null;
    this.viaRemember = false;
    this.loggedOut = false;
    this.recallAttempted = false;
    this.cookie = null;
    this.events = null;
  }

  /**
   * Get authenticated user
   */
  async user() {
    if (this.loggedOut) {
      return null;
    }

    if (this.user) {
      return this.user;
    }

    const id = await this.session.get(this.getName());

    if (id) {
      this.user = await this.provider.retrieveById(id);
      
      if (this.user && this.events) {
        this.events.dispatch('auth.authenticated', { user: this.user });
      }
    }

    // Check remember me cookie
    if (!this.user && !this.recallAttempted) {
      const recaller = await this.recaller();
      if (recaller) {
        this.user = await this.userFromRecaller(recaller);
        
        if (this.user) {
          await this.updateSession(this.user.getAuthIdentifier());
          
          if (this.events) {
            this.events.dispatch('auth.login', { user: this.user, remember: true });
          }
        }
      }
    }

    return this.user;
  }

  /**
   * Get user from remember cookie
   */
  async userFromRecaller(recaller) {
    if (!recaller.valid || this.recallAttempted) {
      return null;
    }

    this.recallAttempted = true;

    const user = await this.provider.retrieveByToken(
      recaller.id,
      recaller.token
    );

    if (user) {
      this.viaRemember = true;
    }

    return user;
  }

  /**
   * Get recaller cookie
   */
  async recaller() {
    if (!this.request) {
      return null;
    }

    const recallerValue = this.request.cookies?.[this.getRecallerName()];
    
    if (recallerValue) {
      return this.parseRecaller(recallerValue);
    }

    return null;
  }

  /**
   * Parse recaller cookie
   */
  parseRecaller(value) {
    const segments = value.split('|');
    
    if (segments.length !== 2) {
      return { valid: false };
    }

    return {
      valid: true,
      id: segments[0],
      token: segments[1]
    };
  }

  /**
   * Get user ID
   */
  async id() {
    if (this.loggedOut) {
      return null;
    }

    const user = await this.user();
    return user ? user.getAuthIdentifier() : await this.session.get(this.getName());
  }

  /**
   * Validate credentials
   */
  async validate(credentials = {}) {
    this.lastAttempted = await this.provider.retrieveByCredentials(credentials);

    return await this.hasValidCredentials(this.lastAttempted, credentials);
  }

  /**
   * Attempt to authenticate
   */
  async attempt(credentials = {}, remember = false) {
    if (this.events) {
      this.events.dispatch('auth.attempting', { credentials });
    }

    this.lastAttempted = await this.provider.retrieveByCredentials(credentials);

    if (await this.hasValidCredentials(this.lastAttempted, credentials)) {
      await this.login(this.lastAttempted, remember);
      return true;
    }

    if (this.events) {
      this.events.dispatch('auth.failed', { credentials, user: this.lastAttempted });
    }

    return false;
  }

  /**
   * Check if credentials are valid
   */
  async hasValidCredentials(user, credentials) {
    return user !== null && await this.provider.validateCredentials(user, credentials);
  }

  /**
   * Login user
   */
  async login(user, remember = false) {
    await this.updateSession(user.getAuthIdentifier());

    if (remember) {
      await this.ensureRememberTokenIsSet(user);
      await this.queueRecallerCookie(user);
    }

    if (this.events) {
      this.events.dispatch('auth.login', { user, remember });
    }

    this.setUser(user);
  }

  /**
   * Login by user ID
   */
  async loginUsingId(id, remember = false) {
    const user = await this.provider.retrieveById(id);

    if (user) {
      await this.login(user, remember);
      return user;
    }

    return false;
  }

  /**
   * Login once without session
   */
  async once(credentials = {}) {
    if (this.events) {
      this.events.dispatch('auth.attempting', { credentials });
    }

    if (await this.validate(credentials)) {
      this.setUser(this.lastAttempted);
      return true;
    }

    return false;
  }

  /**
   * Login once by ID
   */
  async onceUsingId(id) {
    const user = await this.provider.retrieveById(id);

    if (user) {
      this.setUser(user);
      return user;
    }

    return false;
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
   * Logout user
   */
  async logout() {
    const user = this.user;

    await this.clearUserDataFromStorage();

    if (this.events && user) {
      this.events.dispatch('auth.logout', { user });
    }

    this.user = null;
    this.loggedOut = true;
  }

  /**
   * Clear user data from storage
   */
  async clearUserDataFromStorage() {
    await this.session.forget(this.getName());

    if (this.cookie) {
      this.cookie.queue(
        this.cookie.forget(this.getRecallerName())
      );
    }
  }

  /**
   * Update session
   */
  async updateSession(id) {
    await this.session.put(this.getName(), id);
    await this.session.migrate(true);
  }

  /**
   * Ensure remember token is set
   */
  async ensureRememberTokenIsSet(user) {
    if (!user.getRememberToken()) {
      await this.cycleRememberToken(user);
    }
  }

  /**
   * Cycle remember token
   */
  async cycleRememberToken(user) {
    const token = this.generateRememberToken();
    user.setRememberToken(token);
    await this.provider.updateRememberToken(user, token);
  }

  /**
   * Generate remember token
   */
  generateRememberToken() {
    return Array.from({ length: 60 }, () => 
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(
        Math.floor(Math.random() * 62)
      )
    ).join('');
  }

  /**
   * Queue recaller cookie
   */
  async queueRecallerCookie(user) {
    if (!this.cookie) {
      return;
    }

    const value = `${user.getAuthIdentifier()}|${user.getRememberToken()}`;
    
    this.cookie.queue(
      this.cookie.forever(this.getRecallerName(), value)
    );
  }

  /**
   * Set user
   */
  setUser(user) {
    this.user = user;
    this.loggedOut = false;
    return this;
  }

  /**
   * Set cookie jar
   */
  setCookieJar(cookie) {
    this.cookie = cookie;
    return this;
  }

  /**
   * Set event dispatcher
   */
  setDispatcher(events) {
    this.events = events;
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
   * Get session key name
   */
  getName() {
    return `auth_${this.name}_${crypto.createHash('sha256').update(this.name).digest('hex').substring(0, 8)}`;
  }

  /**
   * Get recaller cookie name
   */
  getRecallerName() {
    return `remember_${this.name}_${crypto.createHash('sha256').update(this.name).digest('hex').substring(0, 8)}`;
  }
}

export default SessionGuard;
