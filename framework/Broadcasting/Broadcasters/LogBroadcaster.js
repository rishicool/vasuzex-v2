/**
 * Log Broadcaster
 * Broadcast to log for debugging
 */

import Broadcaster from '../Broadcaster.js';

export class LogBroadcaster extends Broadcaster {
  constructor(logger) {
    super();
    this.logger = logger;
  }

  /**
   * Broadcast event to channels
   */
  async broadcast(channels, event, payload = {}) {
    const channelNames = channels.map(channel => {
      return typeof channel === 'object' && channel.name
        ? channel.name
        : channel;
    });

    this.logger.info('Broadcasting event', {
      event,
      channels: channelNames,
      payload
    });
  }

  /**
   * Authenticate private channel
   */
  async auth(request) {
    return { auth: true };
  }

  /**
   * Return valid authentication response
   */
  async validAuthenticationResponse(request, result) {
    return result;
  }
}

export default LogBroadcaster;
