/**
 * Redis Queue
 * Laravel-inspired Redis queue implementation
 */

import { Queue } from '../Queue.js';

export class RedisQueue extends Queue {
  constructor(redis, queue = 'default', connection = 'default', retryAfter = 60) {
    super();
    this.redis = redis;
    this.defaultQueue = queue;
    this.connection = connection;
    this.retryAfter = retryAfter;
  }

  /**
   * Get the size of the queue
   */
  async size(queue = null) {
    queue = this.getQueue(queue);
    return await this.redis.llen(queue);
  }

  /**
   * Push a new job onto the queue
   */
  async push(job, data = {}, queue = null) {
    return await this.pushRaw(this.createPayload(job, data), queue);
  }

  /**
   * Push a raw payload onto the queue
   */
  async pushRaw(payload, queue = null) {
    queue = this.getQueue(queue);
    await this.redis.rpush(queue, payload);
    return JSON.parse(payload).id;
  }

  /**
   * Push a new job onto the queue after a delay
   */
  async later(delay, job, data = {}, queue = null) {
    const payload = this.createPayload(job, data);
    const delayedQueue = this.getQueue(queue) + ':delayed';
    const availableAt = Date.now() + (delay * 1000);

    await this.redis.zadd(delayedQueue, availableAt, payload);

    return JSON.parse(payload).id;
  }

  /**
   * Pop the next job off of the queue
   */
  async pop(queue = null) {
    this.migrate(queue);

    queue = this.getQueue(queue);
    const job = await this.redis.lpop(queue);

    if (job) {
      const payload = JSON.parse(job);
      const reserved = this.getQueue(queue) + ':reserved';
      
      await this.redis.zadd(reserved, Date.now() + (this.retryAfter * 1000), job);

      return this.marshalJob(payload, job);
    }

    return null;
  }

  /**
   * Migrate any delayed or expired jobs onto the primary queue
   */
  async migrate(queue = null) {
    const now = Date.now();
    queue = this.getQueue(queue);

    // Migrate delayed jobs
    const delayedQueue = queue + ':delayed';
    const delayed = await this.redis.zrangebyscore(delayedQueue, '-inf', now);

    for (const job of delayed) {
      await this.redis.zrem(delayedQueue, job);
      await this.redis.rpush(queue, job);
    }

    // Migrate expired reserved jobs
    const reservedQueue = queue + ':reserved';
    const expired = await this.redis.zrangebyscore(reservedQueue, '-inf', now);

    for (const job of expired) {
      await this.redis.zrem(reservedQueue, job);
      await this.redis.rpush(queue, job);
    }
  }

  /**
   * Marshal the job into a RedisJob instance
   */
  marshalJob(payload, raw) {
    return {
      id: payload.id,
      payload,
      attempts: payload.attempts || 0,
      queue: this.defaultQueue,
      raw,
      delete: async () => {
        const reserved = this.getQueue(this.defaultQueue) + ':reserved';
        await this.redis.zrem(reserved, raw);
      },
      release: async (delay = 0) => {
        const reserved = this.getQueue(this.defaultQueue) + ':reserved';
        await this.redis.zrem(reserved, raw);

        if (delay > 0) {
          const delayedQueue = this.getQueue(this.defaultQueue) + ':delayed';
          const availableAt = Date.now() + (delay * 1000);
          await this.redis.zadd(delayedQueue, availableAt, raw);
        } else {
          await this.redis.rpush(this.getQueue(this.defaultQueue), raw);
        }
      }
    };
  }

  /**
   * Create a payload string from the given job and data
   */
  createPayload(job, data) {
    const payload = {
      id: this.generateId(),
      job: typeof job === 'string' ? job : job.constructor.name,
      data,
      attempts: 0,
      maxTries: job.tries || null,
      timeout: job.timeout || null,
      timestamp: Date.now()
    };

    return JSON.stringify(payload);
  }

  /**
   * Get the queue name
   */
  getQueue(queue) {
    return 'queues:' + (queue || this.defaultQueue);
  }

  /**
   * Generate a unique ID for the job
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get the Redis connection
   */
  getConnection() {
    return this.redis;
  }
}

export default RedisQueue;
