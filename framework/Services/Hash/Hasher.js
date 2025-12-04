/**
 * Hasher Interface
 * Laravel-inspired hasher contract
 */

export class Hasher {
  /**
   * Get information about the given hashed value
   * @param {string} hashedValue
   * @returns {Object}
   */
  info(hashedValue) {
    throw new Error('Method info() must be implemented');
  }

  /**
   * Hash the given value
   * @param {string} value
   * @param {Object} options
   * @returns {Promise<string>}
   */
  async make(value, options = {}) {
    throw new Error('Method make() must be implemented');
  }

  /**
   * Check the given plain value against a hash
   * @param {string} value
   * @param {string} hashedValue
   * @param {Object} options
   * @returns {Promise<boolean>}
   */
  async check(value, hashedValue, options = {}) {
    throw new Error('Method check() must be implemented');
  }

  /**
   * Check if the given hash has been hashed using the given options
   * @param {string} hashedValue
   * @param {Object} options
   * @returns {boolean}
   */
  needsRehash(hashedValue, options = {}) {
    throw new Error('Method needsRehash() must be implemented');
  }
}

export default Hasher;
