/**
 * Broadcaster Interface
 * Base class for all broadcasters
 */

export class Broadcaster {
  /**
   * Broadcast event to channels
   */
  async broadcast(channels, event, payload = {}) {
    throw new Error('Method broadcast() must be implemented');
  }

  /**
   * Authenticate the incoming request for a channel
   */
  async auth(request) {
    throw new Error('Method auth() must be implemented');
  }

  /**
   * Return channel information
   */
  async validAuthenticationResponse(request, result) {
    throw new Error('Method validAuthenticationResponse() must be implemented');
  }
}

export default Broadcaster;
