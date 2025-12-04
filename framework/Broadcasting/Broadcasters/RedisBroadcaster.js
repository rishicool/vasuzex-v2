/**
 * Redis Broadcaster
 * Broadcast using Redis pub/sub
 */

import Broadcaster from '../Broadcaster.js';

export class RedisBroadcaster extends Broadcaster {
  constructor(redis, config) {
    super();
    this.redis = redis;
    this.config = config;
  }

  /**
   * Broadcast event to channels
   */
  async broadcast(channels, event, payload = {}) {
    const connection = this.redis.connection(this.config.connection || null);

    const message = JSON.stringify({
      event,
      data: payload,
      socket: null
    });

    for (const channel of channels) {
      const channelName = typeof channel === 'object' && channel.name
        ? channel.name
        : channel;

      await connection.publish(channelName, message);
    }
  }

  /**
   * Authenticate private channel
   */
  async auth(request) {
    const channelName = request.body.channel_name;

    if (channelName.startsWith('presence-')) {
      return {
        channel_data: {
          user_id: request.user?.id,
          user_info: request.user
        }
      };
    }

    return { auth: true };
  }

  /**
   * Return valid authentication response
   */
  async validAuthenticationResponse(request, result) {
    return result;
  }
}

export default RedisBroadcaster;
