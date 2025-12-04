/**
 * Pipeline
 * Laravel-inspired pipeline for passing objects through pipes
 */

export class Pipeline {
  constructor(container = null) {
    this.container = container;
    this.passable = null;
    this.pipes = [];
    this.method = 'handle';
  }

  /**
   * Set the object being sent through the pipeline
   */
  send(passable) {
    this.passable = passable;
    return this;
  }

  /**
   * Set the array of pipes
   */
  through(pipes) {
    this.pipes = Array.isArray(pipes) ? pipes : [pipes];
    return this;
  }

  /**
   * Set the method to call on the pipes
   */
  via(method) {
    this.method = method;
    return this;
  }

  /**
   * Run the pipeline with a final destination callback
   */
  async then(destination) {
    const pipeline = this.pipes.reduceRight((next, pipe) => {
      return async (passable) => {
        return await this.carry(pipe, next, passable);
      };
    }, destination);

    return await pipeline(this.passable);
  }

  /**
   * Run the pipeline and return the result
   */
  async thenReturn() {
    return await this.then((passable) => passable);
  }

  /**
   * Carry the passable through a pipe
   */
  async carry(pipe, next, passable) {
    // If pipe is a function, call it directly
    if (typeof pipe === 'function') {
      return await pipe(passable, next);
    }

    // If pipe is a string, resolve it from container
    if (typeof pipe === 'string') {
      if (this.container) {
        const instance = this.container.make(pipe);
        return await instance[this.method](passable, next);
      }
      throw new Error(`Cannot resolve pipe: ${pipe}`);
    }

    // If pipe is an object with the method, call it
    if (typeof pipe === 'object' && typeof pipe[this.method] === 'function') {
      return await pipe[this.method](passable, next);
    }

    throw new Error('Invalid pipe');
  }
}

export default Pipeline;
