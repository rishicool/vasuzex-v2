/**
 * Event Dispatcher
 * Laravel-inspired event dispatcher with listener support
 */

export class EventDispatcher {
  constructor(container = null) {
    this.container = container;
    this.listeners = {};
    this.wildcards = {};
    this.wildcardsCache = {};
  }

  /**
   * Register an event listener with the dispatcher
   */
  listen(events, listener) {
    const eventArray = Array.isArray(events) ? events : [events];

    for (const event of eventArray) {
      if (event.includes('*')) {
        this.setupWildcardListen(event, listener);
      } else {
        if (!this.listeners[event]) {
          this.listeners[event] = [];
        }
        this.listeners[event].push(this.makeListener(listener));
      }
    }

    return this;
  }

  /**
   * Setup a wildcard listener callback
   */
  setupWildcardListen(event, listener) {
    if (!this.wildcards[event]) {
      this.wildcards[event] = [];
    }

    this.wildcards[event].push(this.makeListener(listener, true));
    this.wildcardsCache = {};
  }

  /**
   * Determine if a given event has listeners
   */
  hasListeners(eventName) {
    return !!(this.listeners[eventName] || this.wildcards[eventName] || this.hasWildcardListeners(eventName));
  }

  /**
   * Determine if the given event has any wildcard listeners
   */
  hasWildcardListeners(eventName) {
    for (const key in this.wildcards) {
      if (this.matchesWildcard(key, eventName)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Fire an event and call the listeners
   */
  async dispatch(event, payload = [], halt = false) {
    const eventName = typeof event === 'string' ? event : event.constructor.name;
    const listeners = this.getListeners(eventName);

    if (listeners.length === 0) {
      return null;
    }

    const responses = [];

    for (const listener of listeners) {
      const response = await listener(event, payload);

      if (halt && response !== null && response !== undefined) {
        return response;
      }

      if (response === false) {
        break;
      }

      responses.push(response);
    }

    return halt ? null : responses;
  }

  /**
   * Fire an event until the first non-null response
   */
  async until(event, payload = []) {
    return await this.dispatch(event, payload, true);
  }

  /**
   * Register an event subscriber
   */
  subscribe(subscriber) {
    if (typeof subscriber === 'function') {
      subscriber = new subscriber();
    }

    if (typeof subscriber.subscribe === 'function') {
      subscriber.subscribe(this);
    }

    return this;
  }

  /**
   * Remove a set of listeners from the dispatcher
   */
  forget(event) {
    if (this.listeners[event]) {
      delete this.listeners[event];
    }

    if (this.wildcards[event]) {
      delete this.wildcards[event];
    }
  }

  /**
   * Get all of the listeners for a given event name
   */
  getListeners(eventName) {
    const listeners = this.listeners[eventName] || [];
    const wildcardListeners = this.getWildcardListeners(eventName);

    return [...listeners, ...wildcardListeners];
  }

  /**
   * Get the wildcard listeners for the event
   */
  getWildcardListeners(eventName) {
    const wildcardListeners = [];

    for (const [key, listeners] of Object.entries(this.wildcards)) {
      if (this.matchesWildcard(key, eventName)) {
        wildcardListeners.push(...listeners);
      }
    }

    return wildcardListeners;
  }

  /**
   * Check if event name matches wildcard pattern
   */
  matchesWildcard(pattern, eventName) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(eventName);
  }

  /**
   * Create a class based listener
   */
  makeListener(listener, wildcard = false) {
    if (typeof listener === 'string') {
      return this.createClassListener(listener, wildcard);
    }

    return async (event, payload) => {
      return wildcard ? await listener(event, payload) : await listener(...(Array.isArray(payload) ? payload : [payload]));
    };
  }

  /**
   * Create a class based listener callback
   */
  createClassListener(listener, wildcard = false) {
    return async (event, payload) => {
      if (this.container) {
        const instance = this.container.make(listener);
        
        if (typeof instance.handle === 'function') {
          return wildcard 
            ? await instance.handle(event, payload)
            : await instance.handle(...(Array.isArray(payload) ? payload : [payload]));
        }
      }

      throw new Error(`Event listener [${listener}] does not have a handle method.`);
    };
  }

  /**
   * Flush a set of events
   */
  flush(event) {
    this.dispatch(event + '_flushed');
  }
}

export default EventDispatcher;
