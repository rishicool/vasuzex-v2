/**
 * Logger Interface
 * Laravel-inspired logger contract (PSR-3 compatible)
 */

export class Logger {
  /**
   * System is unusable
   */
  emergency(message, context = {}) {
    this.log('emergency', message, context);
  }

  /**
   * Action must be taken immediately
   */
  alert(message, context = {}) {
    this.log('alert', message, context);
  }

  /**
   * Critical conditions
   */
  critical(message, context = {}) {
    this.log('critical', message, context);
  }

  /**
   * Runtime errors
   */
  error(message, context = {}) {
    this.log('error', message, context);
  }

  /**
   * Exceptional occurrences that are not errors
   */
  warning(message, context = {}) {
    this.log('warning', message, context);
  }

  /**
   * Normal but significant events
   */
  notice(message, context = {}) {
    this.log('notice', message, context);
  }

  /**
   * Interesting events
   */
  info(message, context = {}) {
    this.log('info', message, context);
  }

  /**
   * Detailed debug information
   */
  debug(message, context = {}) {
    this.log('debug', message, context);
  }

  /**
   * Log with arbitrary level
   */
  log(level, message, context = {}) {
    throw new Error('Method log() must be implemented');
  }
}

export default Logger;
