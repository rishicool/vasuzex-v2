/**
 * Null Broadcaster
 * No-op broadcaster for testing
 */

import Broadcaster from '../Broadcaster.js';

export class NullBroadcaster extends Broadcaster {
  /**
   * Broadcast event to channels
   */
  async broadcast(channels, event, payload = {}) {
    // Do nothing
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

export default NullBroadcaster;
