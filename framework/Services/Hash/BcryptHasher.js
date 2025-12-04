/**
 * Bcrypt Hasher
 * Laravel-inspired bcrypt hasher implementation
 */

import bcrypt from 'bcrypt';
import { Hasher } from './Hasher.js';

export class BcryptHasher extends Hasher {
  constructor(options = {}) {
    super();
    this.rounds = options.rounds || 10;
  }

  /**
   * Get information about the given hashed value
   */
  info(hashedValue) {
    return {
      algo: 'bcrypt',
      algoName: 'bcrypt',
      options: {}
    };
  }

  /**
   * Hash the given value
   */
  async make(value, options = {}) {
    const rounds = options.rounds || this.rounds;
    return await bcrypt.hash(value, rounds);
  }

  /**
   * Check the given plain value against a hash
   */
  async check(value, hashedValue, options = {}) {
    if (!hashedValue || hashedValue.length === 0) {
      return false;
    }

    try {
      return await bcrypt.compare(value, hashedValue);
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if the given hash has been hashed using the given options
   */
  needsRehash(hashedValue, options = {}) {
    const rounds = options.rounds || this.rounds;
    
    try {
      const currentRounds = bcrypt.getRounds(hashedValue);
      return currentRounds !== rounds;
    } catch (error) {
      return true;
    }
  }

  /**
   * Set the default number of rounds
   */
  setRounds(rounds) {
    this.rounds = rounds;
    return this;
  }
}

export default BcryptHasher;
