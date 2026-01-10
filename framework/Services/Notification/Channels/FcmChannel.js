/**
 * FCM Notification Channel
 * Firebase Cloud Messaging channel for push notifications
 * 
 * Features:
 * - Multi-device notification (sends to all user devices)
 * - Automatic invalid token cleanup
 * - Platform-specific configurations
 * - Respects user notification preferences
 */

import { Channel } from '../Channel.js';
import { getMessaging } from '../FirebaseAdmin.js';
import { Log } from '../../../Support/Facades/index.js';

export class FcmChannel extends Channel {
  constructor(tokenRepository) {
    super();
    this.tokenRepository = tokenRepository; // Repository for user_device_tokens
  }

  /**
   * Send notification via FCM
   * @param {Object} notifiable - User object with id
   * @param {Object} notification - Notification instance
   */
  async send(notifiable, notification) {
    const messaging = getMessaging();
    
    if (!messaging) {
      Log.warning('FCM not available - skipping push notification', {
        userId: notifiable.id,
        notificationType: notification.constructor.name
      });
      return;
    }

    // Get FCM message from notification
    const fcmData = notification.toFcm 
      ? notification.toFcm(notifiable)
      : this.buildDefaultMessage(notification, notifiable);

    if (!fcmData) {
      return;
    }

    // Get all active tokens for user
    const tokens = await this.getActiveTokens(notifiable.id);

    if (tokens.length === 0) {
      Log.debug('No FCM tokens found for user', { userId: notifiable.id });
      return;
    }

    // Send to all devices
    await this.sendToMultipleDevices(tokens, fcmData, notifiable.id);
  }

  /**
   * Get active FCM tokens for user
   */
  async getActiveTokens(userId) {
    if (!this.tokenRepository) {
      Log.error('Token repository not configured for FcmChannel');
      return [];
    }

    return await this.tokenRepository.getActiveTokensForUser(userId);
  }

  /**
   * Send notification to multiple devices
   */
  async sendToMultipleDevices(tokens, fcmData, userId) {
    const messaging = getMessaging();
    const tokenStrings = tokens.map(t => t.token);

    try {
      const message = {
        notification: {
          title: fcmData.title,
          body: fcmData.body,
          ...(fcmData.imageUrl && { imageUrl: fcmData.imageUrl })
        },
        data: this.stringifyData(fcmData.data || {}),
        tokens: tokenStrings
      };

      // Add platform-specific config
      if (fcmData.android) {
        message.android = fcmData.android;
      }
      if (fcmData.apns) {
        message.apns = fcmData.apns;
      }
      if (fcmData.webpush) {
        message.webpush = fcmData.webpush;
      }

      const response = await messaging.sendEachForMulticast(message);

      Log.info('FCM multicast sent', {
        userId,
        successCount: response.successCount,
        failureCount: response.failureCount,
        totalTokens: tokenStrings.length
      });

      // Handle failed tokens
      if (response.failureCount > 0) {
        await this.handleFailedTokens(tokens, response.responses, userId);
      }

      // Update last_used_at for successful sends
      const successfulTokenIds = tokens
        .filter((_, index) => response.responses[index].success)
        .map(t => t.id);

      if (successfulTokenIds.length > 0 && this.tokenRepository) {
        await this.tokenRepository.updateLastUsed(successfulTokenIds);
      }

      return response;
    } catch (error) {
      Log.error('FCM multicast failed', {
        userId,
        error: error.message,
        code: error.code
      });
      throw error;
    }
  }

  /**
   * Handle failed token deliveries
   * Removes invalid/expired tokens
   */
  async handleFailedTokens(tokens, responses, userId) {
    const invalidTokenIds = [];
    const invalidReasons = [
      'messaging/invalid-registration-token',
      'messaging/registration-token-not-registered',
      'messaging/invalid-argument'
    ];

    responses.forEach((response, index) => {
      if (!response.success && response.error) {
        const errorCode = response.error.code;
        
        if (invalidReasons.includes(errorCode)) {
          invalidTokenIds.push(tokens[index].id);
          Log.info('Removing invalid FCM token', {
            userId,
            tokenId: tokens[index].id,
            platform: tokens[index].platform,
            errorCode
          });
        }
      }
    });

    if (invalidTokenIds.length > 0 && this.tokenRepository) {
      await this.tokenRepository.deactivateTokens(invalidTokenIds);
    }
  }

  /**
   * Build default FCM message from notification
   */
  buildDefaultMessage(notification, notifiable) {
    // Try to get data from toArray or toDatabase
    const data = notification.toArray 
      ? notification.toArray(notifiable)
      : (notification.toDatabase ? notification.toDatabase(notifiable) : null);

    if (!data) {
      return null;
    }

    return {
      title: data.title || 'Notification',
      body: data.body || data.message || '',
      data: data.data || {},
      imageUrl: data.imageUrl || data.image_url
    };
  }

  /**
   * Stringify all data values for FCM
   * FCM data payload must have string values only
   */
  stringifyData(data) {
    const stringified = {};
    for (const [key, value] of Object.entries(data)) {
      stringified[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }
    return stringified;
  }
}

export default FcmChannel;
