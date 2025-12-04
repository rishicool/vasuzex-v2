/**
 * Cookie Jar
 * Laravel-inspired cookie manager
 */

export class CookieJar {
  constructor(encrypter = null) {
    this.encrypter = encrypter;
    this.queued = [];
  }

  /**
   * Create a new cookie instance
   */
  make(name, value, minutes = 0, path = '/', domain = null, secure = false, httpOnly = true, sameSite = 'lax') {
    const maxAge = minutes > 0 ? minutes * 60 : undefined;

    return {
      name,
      value: this.encrypter ? this.encrypter.encrypt(value) : value,
      options: {
        maxAge,
        path,
        domain,
        secure,
        httpOnly,
        sameSite
      }
    };
  }

  /**
   * Create a cookie that lasts "forever"
   */
  forever(name, value, path = '/', domain = null, secure = false, httpOnly = true, sameSite = 'lax') {
    return this.make(name, value, 2628000, path, domain, secure, httpOnly, sameSite); // 5 years
  }

  /**
   * Expire the given cookie
   */
  forget(name, path = '/', domain = null) {
    return this.make(name, '', -2628000, path, domain);
  }

  /**
   * Queue a cookie to send with the next response
   */
  queue(...args) {
    this.queued.push(this.make(...args));
  }

  /**
   * Get the cookies which have been queued
   */
  getQueuedCookies() {
    return this.queued;
  }

  /**
   * Set cookies on response
   */
  setCookies(res) {
    for (const cookie of this.queued) {
      res.cookie(cookie.name, cookie.value, cookie.options);
    }
    this.queued = [];
  }

  /**
   * Get cookie value from request
   */
  get(req, name, defaultValue = null) {
    const value = req.cookies?.[name];
    
    if (!value) {
      return defaultValue;
    }

    try {
      return this.encrypter ? this.encrypter.decrypt(value) : value;
    } catch (error) {
      return defaultValue;
    }
  }

  /**
   * Determine if a cookie exists on the request
   */
  has(req, name) {
    return !!req.cookies?.[name];
  }
}

export default CookieJar;
