/**
 * AWS SNS SMS Driver
 * 
 * Send SMS using Amazon Simple Notification Service (SNS)
 * Documentation: https://docs.aws.amazon.com/sns/latest/dg/sms_publish-to-phone.html
 * 
 * Required config:
 * - region: AWS region (e.g., 'us-east-1')
 * - accessKeyId: AWS Access Key ID
 * - secretAccessKey: AWS Secret Access Key
 * 
 * Optional config:
 * - smsType: 'Promotional' or 'Transactional' (default: 'Transactional')
 * - senderId: Sender ID for supported countries
 * 
 * @example
 * // config/sms.cjs
 * aws_sns: {
 *   region: env('AWS_REGION', 'us-east-1'),
 *   accessKeyId: env('AWS_ACCESS_KEY_ID'),
 *   secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
 *   smsType: 'Transactional'
 * }
 */

export class AwsSnsDriver {
  constructor(config) {
    this.config = config;
    this.client = null;
    
    this.validateConfig();
  }

  /**
   * Validate required configuration
   * 
   * @private
   * @throws {Error} If required config missing
   */
  validateConfig() {
    if (!this.config.region) {
      throw new Error('AWS SNS driver requires region');
    }

    if (!this.config.accessKeyId || !this.config.secretAccessKey) {
      throw new Error('AWS SNS driver requires accessKeyId and secretAccessKey');
    }
  }

  /**
   * Get AWS SNS client (lazy load)
   * 
   * @private
   * @returns {Promise<Object>} SNS client
   */
  async getClient() {
    if (!this.client) {
      const { SNSClient } = await import('@aws-sdk/client-sns');
      
      this.client = new SNSClient({
        region: this.config.region,
        credentials: {
          accessKeyId: this.config.accessKeyId,
          secretAccessKey: this.config.secretAccessKey
        }
      });
    }
    return this.client;
  }

  /**
   * Send SMS via AWS SNS
   * 
   * @param {Object} options - SMS options
   * @param {string} options.to - Recipient phone number (E.164 format)
   * @param {string} options.message - SMS message text
   * @param {string} [options.smsType] - 'Promotional' or 'Transactional'
   * @param {string} [options.senderId] - Sender ID (up to 11 chars)
   * @returns {Promise<Object>} Response object
   * 
   * @example
   * const result = await driver.send({
   *   to: '+919876543210',
   *   message: 'Hello from AWS SNS!',
   *   smsType: 'Transactional'
   * });
   */
  async send(options) {
    try {
      const { to, message, smsType, senderId } = options;

      // Validate input
      if (!to || !message) {
        throw new Error('AWS SNS driver requires to and message');
      }

      if (!to.startsWith('+')) {
        throw new Error('Phone number must be in E.164 format (e.g., +919876543210)');
      }

      const client = await this.getClient();
      const { PublishCommand } = await import('@aws-sdk/client-sns');

      // Build message attributes
      const messageAttributes = {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: smsType || this.config.smsType || 'Transactional'
        }
      };

      // Add sender ID if provided
      if (senderId || this.config.senderId) {
        messageAttributes['AWS.SNS.SMS.SenderID'] = {
          DataType: 'String',
          StringValue: senderId || this.config.senderId
        };
      }

      const command = new PublishCommand({
        Message: message,
        PhoneNumber: to,
        MessageAttributes: messageAttributes
      });

      const result = await client.send(command);

      return {
        success: true,
        messageId: result.MessageId,
        provider: 'aws-sns',
        data: {
          messageId: result.MessageId,
          sequenceNumber: result.SequenceNumber,
          metadata: result.$metadata
        }
      };
    } catch (error) {
      return {
        success: false,
        messageId: null,
        provider: 'aws-sns',
        error: {
          message: error.message,
          code: error.name,
          statusCode: error.$metadata?.httpStatusCode
        }
      };
    }
  }

  /**
   * Send bulk SMS using SNS Topic
   * 
   * @param {Array<Object>} messages - Array of message objects
   * @returns {Promise<Array>} Array of results
   * 
   * @example
   * const results = await driver.sendBulk([
   *   { to: '+919876543210', message: 'Hello User 1' },
   *   { to: '+919876543211', message: 'Hello User 2' }
   * ]);
   */
  async sendBulk(messages) {
    const results = [];

    for (const msg of messages) {
      const result = await this.send(msg);
      results.push(result);
      
      // AWS SNS has rate limits - add small delay
      if (this.config.rateLimit) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  /**
   * Get SMS attributes (spending limit, monthly spend, etc.)
   * 
   * @returns {Promise<Object>} SMS attributes
   * 
   * @example
   * const attributes = await driver.getSmsAttributes();
   */
  async getSmsAttributes() {
    try {
      const client = await this.getClient();
      const { GetSMSAttributesCommand } = await import('@aws-sdk/client-sns');

      const command = new GetSMSAttributesCommand({
        attributes: [
          'MonthlySpendLimit',
          'DeliveryStatusIAMRole',
          'DeliveryStatusSuccessSamplingRate',
          'DefaultSenderID',
          'DefaultSMSType',
          'UsageReportS3Bucket'
        ]
      });

      const result = await client.send(command);

      return {
        success: true,
        attributes: result.attributes
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Set SMS attributes
   * 
   * @param {Object} attributes - SMS attributes to set
   * @returns {Promise<Object>} Result
   * 
   * @example
   * await driver.setSmsAttributes({
   *   DefaultSMSType: 'Transactional',
   *   MonthlySpendLimit: '10'
   * });
   */
  async setSmsAttributes(attributes) {
    try {
      const client = await this.getClient();
      const { SetSMSAttributesCommand } = await import('@aws-sdk/client-sns');

      const command = new SetSMSAttributesCommand({
        attributes
      });

      await client.send(command);

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default AwsSnsDriver;
