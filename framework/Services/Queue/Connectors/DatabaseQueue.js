/**
 * Database Queue
 * Laravel-inspired database queue implementation
 */

import { Queue } from '../Queue.js';

export class DatabaseQueue extends Queue {
  constructor(database, table = 'jobs', defaultQueue = 'default', retryAfter = 60) {
    super();
    this.database = database;
    this.table = table;
    this.defaultQueue = defaultQueue;
    this.retryAfter = retryAfter;
  }

  /**
   * Get the size of the queue
   */
  async size(queue = null) {
    queue = queue || this.defaultQueue;

    const result = await this.database
      .table(this.table)
      .where('queue', queue)
      .count('* as count')
      .first();

    return result?.count || 0;
  }

  /**
   * Push a new job onto the queue
   */
  async push(job, data = {}, queue = null) {
    return await this.pushToDatabase(queue, this.createPayload(job, data));
  }

  /**
   * Push a new job onto the queue after a delay
   */
  async later(delay, job, data = {}, queue = null) {
    const availableAt = Date.now() + (delay * 1000);
    return await this.pushToDatabase(queue, this.createPayload(job, data), availableAt);
  }

  /**
   * Push the job to the database queue
   */
  async pushToDatabase(queue, payload, availableAt = null) {
    queue = queue || this.defaultQueue;
    availableAt = availableAt || Date.now();

    const id = await this.database.table(this.table).insertGetId({
      queue,
      payload: JSON.stringify(payload),
      attempts: 0,
      reserved_at: null,
      available_at: new Date(availableAt),
      created_at: new Date()
    });

    return id;
  }

  /**
   * Pop the next job off of the queue
   */
  async pop(queue = null) {
    queue = queue || this.defaultQueue;

    return await this.database.transaction(async (trx) => {
      const job = await this.getNextAvailableJob(queue, trx);

      if (job) {
        await this.markJobAsReserved(job.id, trx);
        return this.marshalJob(job);
      }

      return null;
    });
  }

  /**
   * Get the next available job from the queue
   */
  async getNextAvailableJob(queue, trx) {
    const now = Date.now();

    return await trx
      .table(this.table)
      .where('queue', queue)
      .where(function(query) {
        query.whereNull('reserved_at')
          .orWhere('reserved_at', '<=', new Date(now - (this.retryAfter * 1000)));
      })
      .where('available_at', '<=', new Date(now))
      .orderBy('id', 'asc')
      .first();
  }

  /**
   * Mark the given job ID as reserved
   */
  async markJobAsReserved(id, trx) {
    await trx
      .table(this.table)
      .where('id', id)
      .update({
        reserved_at: new Date(),
        attempts: this.database.raw('attempts + 1')
      });
  }

  /**
   * Marshal the job into a DatabaseJob instance
   */
  marshalJob(job) {
    return {
      id: job.id,
      payload: JSON.parse(job.payload),
      attempts: job.attempts,
      queue: job.queue,
      delete: async () => {
        await this.database.table(this.table).where('id', job.id).delete();
      },
      release: async (delay = 0) => {
        await this.database.table(this.table).where('id', job.id).update({
          reserved_at: null,
          available_at: new Date(Date.now() + (delay * 1000))
        });
      }
    };
  }

  /**
   * Create a payload string from the given job and data
   */
  createPayload(job, data) {
    return {
      job: typeof job === 'string' ? job : job.constructor.name,
      data,
      maxTries: job.tries || null,
      timeout: job.timeout || null,
      timestamp: Date.now()
    };
  }

  /**
   * Delete a job from the queue
   */
  async deleteJob(id) {
    await this.database.table(this.table).where('id', id).delete();
  }

  /**
   * Release a job back onto the queue
   */
  async releaseJob(id, delay = 0) {
    await this.database.table(this.table).where('id', id).update({
      reserved_at: null,
      available_at: new Date(Date.now() + (delay * 1000))
    });
  }
}

export default DatabaseQueue;
