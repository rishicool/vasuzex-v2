/**
 * Database User Provider
 * User provider for database queries without ORM
 */

export class DatabaseUserProvider {
  constructor(hasher, table) {
    this.hasher = hasher;
    this.table = table;
  }

  /**
   * Retrieve user by ID
   */
  async retrieveById(identifier) {
    const db = require('../../../database').default;
    
    const user = await db(this.table)
      .where('id', identifier)
      .first();

    return user ? this.getGenericUser(user) : null;
  }

  /**
   * Retrieve user by token
   */
  async retrieveByToken(identifier, token) {
    const db = require('../../../database').default;
    
    const user = await db(this.table)
      .where('id', identifier)
      .first();

    if (!user) {
      return null;
    }

    const rememberToken = user.remember_token;

    return rememberToken && rememberToken === token 
      ? this.getGenericUser(user) 
      : null;
  }

  /**
   * Update remember token
   */
  async updateRememberToken(user, token) {
    const db = require('../../../database').default;
    
    await db(this.table)
      .where('id', user.getAuthIdentifier())
      .update({
        remember_token: token,
        updated_at: new Date()
      });
  }

  /**
   * Retrieve user by credentials
   */
  async retrieveByCredentials(credentials) {
    if (!credentials || Object.keys(credentials).length === 0) {
      return null;
    }

    const db = require('../../../database').default;
    let query = db(this.table);

    for (const [key, value] of Object.entries(credentials)) {
      if (key.includes('password')) {
        continue;
      }

      if (Array.isArray(value)) {
        query = query.whereIn(key, value);
      } else {
        query = query.where(key, value);
      }
    }

    const user = await query.first();
    
    return user ? this.getGenericUser(user) : null;
  }

  /**
   * Validate user credentials
   */
  async validateCredentials(user, credentials) {
    const plain = credentials.password;
    const hashed = user.getAuthPassword();

    return await this.hasher.check(plain, hashed);
  }

  /**
   * Get generic user instance
   */
  getGenericUser(user) {
    return {
      ...user,
      getAuthIdentifier: () => user.id,
      getAuthPassword: () => user.password,
      getRememberToken: () => user.remember_token,
      setRememberToken: (token) => { user.remember_token = token; }
    };
  }

  /**
   * Get hasher
   */
  getHasher() {
    return this.hasher;
  }

  /**
   * Set hasher
   */
  setHasher(hasher) {
    this.hasher = hasher;
    return this;
  }
}

export default DatabaseUserProvider;
