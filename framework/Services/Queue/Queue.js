/**
 * Queue Interface
 * Laravel-inspired queue contract
 */

export class Queue {
  /**
   * Get the size of the queue
   * @param {string} queue
   * @returns {Promise<number>}
   */
  async size(queue = null) {
    throw new Error('Method size() must be implemented');
  }

  /**
   * Push a new job onto the queue
   * @param {string|Object} job
   * @param {any} data
   * @param {string} queue
   * @returns {Promise<any>}
   */
  async push(job, data = {}, queue = null) {
    throw new Error('Method push() must be implemented');
  }

  /**
   * Push a new job onto the queue after a delay
   * @param {number} delay
   * @param {string|Object} job
   * @param {any} data
   * @param {string} queue
   * @returns {Promise<any>}
   */
  async later(delay, job, data = {}, queue = null) {
    throw new Error('Method later() must be implemented');
  }

  /**
   * Push an array of jobs onto the queue
   * @param {Array} jobs
   * @param {any} data
   * @param {string} queue
   * @returns {Promise<any>}
   */
  async bulk(jobs, data = {}, queue = null) {
    for (const job of jobs) {
      await this.push(job, data, queue);
    }
  }

  /**
   * Pop the next job off of the queue
   * @param {string} queue
   * @returns {Promise<Object|null>}
   */
  async pop(queue = null) {
    throw new Error('Method pop() must be implemented');
  }

  /**
   * Get the connection name for the queue
   * @returns {string}
   */
  getConnectionName() {
    return this.connectionName || 'default';
  }

  /**
   * Set the connection name for the queue
   * @param {string} name
   * @returns {this}
   */
  setConnectionName(name) {
    this.connectionName = name;
    return this;
  }
}

export default Queue;
