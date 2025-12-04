/**
 * Queue Connector Interface
 * Laravel-inspired queue connector contract
 */

export class Connector {
  /**
   * Establish a queue connection
   * @param {Object} config
   * @returns {Queue}
   */
  connect(config) {
    throw new Error('Method connect() must be implemented');
  }
}

export default Connector;
