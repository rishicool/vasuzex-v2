/**
 * Model User Provider
 * User provider for GuruORM models
 */

export class ModelUserProvider {
  constructor(hasher, model) {
    this.hasher = hasher;
    this.model = model;
  }

  /**
   * Retrieve user by ID
   */
  async retrieveById(identifier) {
    const Model = this.createModel();
    const authIdentifierName = Model.prototype.getAuthIdentifierName?.() || 'id';
    
    return await Model.where(authIdentifierName, identifier).first();
  }

  /**
   * Retrieve user by token
   */
  async retrieveByToken(identifier, token) {
    const Model = this.createModel();
    const authIdentifierName = Model.prototype.getAuthIdentifierName?.() || 'id';
    
    const user = await Model.where(authIdentifierName, identifier).first();

    if (!user) {
      return null;
    }

    const rememberToken = user.getRememberToken?.() || user.remember_token;

    return rememberToken && rememberToken === token ? user : null;
  }

  /**
   * Update remember token
   */
  async updateRememberToken(user, token) {
    if (typeof user.setRememberToken === 'function') {
      user.setRememberToken(token);
    } else {
      user.remember_token = token;
    }

    await user.save();
  }

  /**
   * Retrieve user by credentials
   */
  async retrieveByCredentials(credentials) {
    if (!credentials || Object.keys(credentials).length === 0) {
      return null;
    }

    // Skip password field
    const query = this.createModel();
    let hasConditions = false;

    for (const [key, value] of Object.entries(credentials)) {
      if (key.includes('password')) {
        continue;
      }

      if (Array.isArray(value)) {
        query.whereIn(key, value);
      } else {
        query.where(key, value);
      }

      hasConditions = true;
    }

    if (!hasConditions) {
      return null;
    }

    return await query.first();
  }

  /**
   * Validate user credentials
   */
  async validateCredentials(user, credentials) {
    const plain = credentials.password;
    const hashed = user.getAuthPassword?.() || user.password;

    return await this.hasher.check(plain, hashed);
  }

  /**
   * Create model instance
   */
  createModel() {
    const ModelClass = require(this.model).default || require(this.model);
    return new ModelClass();
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

  /**
   * Get model name
   */
  getModel() {
    return this.model;
  }

  /**
   * Set model name
   */
  setModel(model) {
    this.model = model;
    return this;
  }
}

export default ModelUserProvider;
