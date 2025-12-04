/**
 * Sync Queue
 * Laravel-inspired synchronous queue (executes immediately)
 */

import { Queue } from '../Queue.js';

export class SyncQueue extends Queue {
  constructor() {
    super();
    this.jobs = [];
  }

  /**
   * Get the size of the queue
   */
  async size(queue = null) {
    return 0; // Sync queue doesn't store jobs
  }

  /**
   * Push a new job onto the queue (executes immediately)
   */
  async push(job, data = {}, queue = null) {
    return await this.resolveJob(job, data);
  }

  /**
   * Push a new job onto the queue after a delay (ignores delay in sync mode)
   */
  async later(delay, job, data = {}, queue = null) {
    return await this.push(job, data, queue);
  }

  /**
   * Pop the next job off of the queue
   */
  async pop(queue = null) {
    return null; // Sync queue doesn't store jobs
  }

  /**
   * Resolve and execute the job immediately
   */
  async resolveJob(job, data) {
    if (typeof job === 'string') {
      // If job is a string, try to resolve it as a class or function
      throw new Error(`Cannot resolve job class: ${job}. Please provide a job instance or function.`);
    }

    if (typeof job === 'function') {
      // If job is a function, execute it
      return await job(data);
    }

    if (typeof job === 'object' && typeof job.handle === 'function') {
      // If job is an object with a handle method, execute it
      return await job.handle(data);
    }

    throw new Error('Invalid job. Job must be a function or an object with a handle method.');
  }
}

export default SyncQueue;
