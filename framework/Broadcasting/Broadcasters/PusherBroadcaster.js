/**
 * Pusher Broadcaster
 * Broadcast using Pusher service
 */

import Broadcaster from '../Broadcaster.js';

export class PusherBroadcaster extends Broadcaster {
  constructor(config) {
    super();
    this.config = config;
    this.pusher = null;
  }

  /**
   * Initialize Pusher client
   */
  getPusher() {
    if (!this.pusher) {
      const Pusher = require('pusher');
      
      this.pusher = new Pusher({
        appId: this.config.app_id,
        key: this.config.key,
        secret: this.config.secret,
        cluster: this.config.cluster,
        useTLS: this.config.use_tls !== false
      });
    }

    return this.pusher;
  }

  /**
   * Broadcast event to channels
   */
  async broadcast(channels, event, payload = {}) {
    const pusher = this.getPusher();

    const formattedChannels = channels.map(channel => {
      if (typeof channel === 'object' && channel.name) {
        return channel.name;
      }
      return channel;
    });

    await pusher.trigger(formattedChannels, event, payload);
  }

  /**
   * Authenticate private channel
   */
  async auth(request) {
    const pusher = this.getPusher();
    const socketId = request.body.socket_id;
    const channelName = request.body.channel_name;

    if (channelName.startsWith('presence-')) {
      const channelData = {
        user_id: request.user?.id,
        user_info: request.user
      };
      
      return pusher.authenticate(socketId, channelName, channelData);
    }

    return pusher.authenticate(socketId, channelName);
  }

  /**
   * Return valid authentication response
   */
  async validAuthenticationResponse(request, result) {
    return result;
  }
}

export default PusherBroadcaster;
