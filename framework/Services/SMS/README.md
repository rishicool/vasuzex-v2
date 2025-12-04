# SMS Service Documentation

## 📱 Laravel-Style SMS Service for Node.js

Complete SMS service implementation following Laravel's design patterns.

### Supported Drivers

- **Twilio** - Global SMS service
- **AWS SNS** - Amazon Simple Notification Service
- **2Factor** - India-focused SMS provider with OTP support
- **Vonage** - Formerly Nexmo, global communications
- **Log** - Development/testing driver

---

## 🚀 Quick Start

### 1. Configuration

Create `.env` file:

```env
# Default driver
SMS_DRIVER=twilio

# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+1234567890

# AWS SNS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# 2Factor (India)
TWOFACTOR_API_KEY=your_api_key
TWOFACTOR_SENDER_ID=MYAPP

# Vonage
VONAGE_API_KEY=your_api_key
VONAGE_API_SECRET=your_secret
VONAGE_FROM=MyApp
```

### 2. Basic Usage

```javascript
import { SMS } from 'vasuzex';

// Send SMS
await SMS.send({
  to: '+919876543210',
  message: 'Hello from Neastore!'
});

// Send OTP
await SMS.sendOtp('+919876543210', '123456');

// Send verification code
await SMS.sendVerificationCode('+919876543210', 'ABC123');

// Send notification
await SMS.notify('+919876543210', 'Your order has shipped!');
```

### 3. Using Specific Drivers

```javascript
// Use Twilio
await SMS.driver('twilio').send({
  to: '+919876543210',
  message: 'Via Twilio'
});

// Use AWS SNS
await SMS.driver('aws_sns').send({
  to: '+919876543210',
  message: 'Via AWS SNS',
  smsType: 'Transactional'
});

// Use 2Factor (India)
await SMS.driver('twofactor').send({
  to: '+919876543210',
  message: 'Via 2Factor'
});
```

---

## 📚 API Reference

### SmsManager

#### `send(options)`

Send SMS message.

```javascript
await SMS.send({
  to: '+919876543210',        // Required: E.164 format
  message: 'Hello World!',    // Required
  from: '+1234567890'         // Optional: override sender
});

// Returns:
{
  success: true,
  messageId: 'SM1234567890',
  provider: 'twilio',
  data: { /* provider-specific data */ }
}
```

#### `sendOtp(to, otp, options)`

Send OTP SMS with formatted message.

```javascript
await SMS.sendOtp('+919876543210', '123456', {
  appName: 'MyApp',           // Optional: defaults to config
  expiryMinutes: 10,          // Optional: defaults to 10
  from: '+1234567890'         // Optional
});

// Sends: "Your MyApp OTP is: 123456. Valid for 10 minutes. Do not share with anyone."
```

#### `sendVerificationCode(to, code, options)`

Send verification code.

```javascript
await SMS.sendVerificationCode('+919876543210', 'ABC123', {
  appName: 'MyApp',
  from: '+1234567890'
});

// Sends: "Your MyApp verification code is: ABC123. Please use this to verify your account."
```

#### `notify(to, message, options)`

Send notification message.

```javascript
await SMS.notify('+919876543210', 'Your order #123 has been shipped!', {
  from: '+1234567890'
});
```

#### `driver(name)`

Get specific driver instance.

```javascript
const twilioDriver = SMS.driver('twilio');
await twilioDriver.send({...});
```

#### `availableDrivers()`

Get list of configured drivers.

```javascript
const drivers = SMS.availableDrivers();
// Returns: ['twilio', 'aws_sns', 'twofactor', 'vonage', 'log']
```

---

## 🔧 Driver-Specific Features

### Twilio Driver

```javascript
const driver = SMS.driver('twilio');

// Send SMS
await driver.send({
  to: '+919876543210',
  message: 'Hello',
  from: '+1234567890'  // or messaging service SID
});

// Get message status
await driver.getStatus('SM1234567890');

// Send bulk
await driver.sendBulk([
  { to: '+919876543210', message: 'Msg 1' },
  { to: '+919876543211', message: 'Msg 2' }
]);
```

### AWS SNS Driver

```javascript
const driver = SMS.driver('aws_sns');

// Send transactional SMS
await driver.send({
  to: '+919876543210',
  message: 'Your OTP is 123456',
  smsType: 'Transactional',  // Higher priority
  senderId: 'MYAPP'           // Optional
});

// Send promotional SMS
await driver.send({
  to: '+919876543210',
  message: 'Check our offers!',
  smsType: 'Promotional'      // Lower cost
});

// Get SMS attributes
await driver.getSmsAttributes();

// Set SMS attributes
await driver.setSmsAttributes({
  DefaultSMSType: 'Transactional',
  MonthlySpendLimit: '10'
});
```

### 2Factor Driver (India)

```javascript
const driver = SMS.driver('twofactor');

// Send regular SMS
await driver.send({
  to: '+919876543210',
  message: 'Hello',
  senderId: 'MYAPP'
});

// Send auto-generated OTP (2Factor generates OTP)
const result = await driver.sendAutoOtp('+919876543210', {
  otpLength: 6  // 4 or 6
});

const sessionId = result.sessionId;

// Later, verify OTP
const verified = await driver.verifyOtp(sessionId, '123456');

if (verified.verified) {
  console.log('OTP verified!');
}

// Get delivery report
await driver.getDeliveryReport(sessionId);
```

### Vonage Driver

```javascript
const driver = SMS.driver('vonage');

// Send SMS
await driver.send({
  to: '+919876543210',
  message: 'Hello',
  from: 'MyApp',
  type: 'unicode'  // or 'text'
});

// Get account balance
const balance = await driver.getBalance();
console.log(`Balance: ${balance.balance}`);
```

### Log Driver (Testing)

```javascript
const driver = SMS.driver('log');

// Send SMS (logs to console)
await driver.send({
  to: '+919876543210',
  message: 'Test message'
});

// Get all logged messages
const messages = driver.getAllMessages();

// Get messages to specific number
const userMessages = driver.getMessagesTo('+919876543210');

// Clear logs
driver.clear();
```

---

## 🎯 Advanced Usage

### Custom Driver

Create your own SMS driver:

```javascript
// app/SMS/CustomDriver.js
export class CustomDriver {
  constructor(config) {
    this.config = config;
  }

  async send(options) {
    const { to, message } = options;
    
    // Your custom SMS logic here
    
    return {
      success: true,
      messageId: 'custom_123',
      provider: 'custom',
      data: {}
    };
  }
}

// Register in service provider
import { SmsManager } from 'vasuzex';

const sms = new SmsManager(app);

sms.extend('custom', (app, config) => {
  return new CustomDriver(config);
});
```

### Queue Integration

Send SMS asynchronously using queues:

```javascript
import { Queue, SMS } from 'vasuzex';

// Create SMS job
class SendSmsJob {
  constructor(to, message) {
    this.to = to;
    this.message = message;
  }

  async handle() {
    await SMS.send({
      to: this.to,
      message: this.message
    });
  }
}

// Dispatch to queue
await Queue.dispatch(new SendSmsJob('+919876543210', 'Hello!'));
```

### Event Handling

Listen to SMS events:

```javascript
import { Event, SMS } from 'vasuzex';

// Listen for SMS sent
Event.listen('sms.sent', (data) => {
  console.log(`SMS sent to ${data.to}`);
  // Log to database, analytics, etc.
});

// Listen for SMS failed
Event.listen('sms.failed', (data) => {
  console.error(`SMS failed: ${data.error}`);
  // Retry logic, alerting, etc.
});
```

---

## 🧪 Testing

### Using Log Driver

```javascript
// config/sms.cjs
module.exports = {
  default: 'log',
  // ...
};

// In tests
import { SMS } from 'vasuzex';

test('sends OTP SMS', async () => {
  await SMS.sendOtp('+919876543210', '123456');
  
  const driver = SMS.driver('log');
  const messages = driver.getMessagesTo('+919876543210');
  
  expect(messages).toHaveLength(1);
  expect(messages[0].message).toContain('123456');
});
```

### Mocking

```javascript
// tests/mocks/sms.mock.js
export class MockSmsDriver {
  constructor() {
    this.messages = [];
  }

  async send(options) {
    this.messages.push(options);
    return { success: true, messageId: 'mock_123' };
  }
}

// In tests
import { SmsManager } from 'vasuzex';

const sms = new SmsManager(app);
sms.extend('mock', () => new MockSmsDriver());

// Use mock driver
await SMS.driver('mock').send({...});
```

---

## 🌍 International SMS

### Phone Number Format

Always use E.164 format:

```
+[country code][number]

Examples:
India: +919876543210
USA: +11234567890
UK: +447123456789
```

### Country-Specific Drivers

- **India**: Use `twofactor` for best local rates
- **USA/Canada**: Use `twilio` or `vonage`
- **Global**: Use `aws_sns` or `twilio`

---

## 💰 Cost Optimization

### Choose Right Driver

- **Transactional** (OTP, alerts): Use `aws_sns` (Transactional) or `twilio`
- **Promotional**: Use `aws_sns` (Promotional) for lower cost
- **India**: Use `twofactor` for lowest local rates

### Batch Sending

```javascript
// Instead of individual sends
for (const user of users) {
  await SMS.send({ to: user.phone, message: 'Hello' });
}

// Use bulk sending
const messages = users.map(user => ({
  to: user.phone,
  message: 'Hello'
}));

await SMS.driver().sendBulk(messages);
```

### Queue Non-Critical Messages

```javascript
// Critical (immediate)
await SMS.sendOtp(phone, otp);

// Non-critical (queue)
await Queue.dispatch(new SendPromotionalSms(phone, message));
```

---

## 🔐 Security Best Practices

### 1. Environment Variables

Never hardcode credentials:

```javascript
// ❌ Bad
const config = {
  apiKey: 'your-api-key-here'
};

// ✅ Good
const config = {
  apiKey: process.env.TWILIO_AUTH_TOKEN
};
```

### 2. Rate Limiting

Prevent abuse:

```javascript
import { RateLimiter } from 'vasuzex';

// Limit SMS to 5 per hour per user
await RateLimiter.attempt(
  `sms:${userId}`,
  5,  // max attempts
  3600  // per hour
);

await SMS.send({...});
```

### 3. Validate Phone Numbers

```javascript
import { Validator } from 'vasuzex';

const validator = Validator.make({
  phone: '+919876543210'
}, {
  phone: 'required|regex:/^\+[1-9]\d{1,14}$/'
});

if (validator.fails()) {
  throw new Error('Invalid phone number');
}
```

### 4. Log All SMS

```javascript
import { Log } from 'vasuzex';

const result = await SMS.send({...});

Log.info('SMS sent', {
  to: options.to,
  messageId: result.messageId,
  provider: result.provider
});
```

---

## 📊 Monitoring

### Track Delivery

```javascript
// Send SMS
const result = await SMS.send({
  to: '+919876543210',
  message: 'Test'
});

// Store message ID for tracking
await DB.table('sms_logs').insert({
  message_id: result.messageId,
  to: options.to,
  status: 'sent',
  provider: result.provider
});

// Later, check status (Twilio example)
const status = await SMS.driver('twilio').getStatus(messageId);
```

### Analytics

```javascript
import { Event } from 'vasuzex';

Event.listen('sms.sent', async (data) => {
  await DB.table('sms_analytics').insert({
    provider: data.provider,
    sent_at: new Date(),
    country: getCountryFromPhone(data.to)
  });
});
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Phone number format error**
```
Error: Phone number must be in E.164 format
```
Solution: Use `+` prefix and country code

**2. Driver not configured**
```
Error: SMS driver [twilio] is not configured
```
Solution: Check `.env` file and `config/sms.cjs`

**3. Rate limit exceeded**
```
Error: Too many requests
```
Solution: Implement queue or add delays

**4. Invalid credentials**
```
Error: Authentication failed
```
Solution: Verify API keys in `.env`

---

## 📝 Example: Complete OTP Flow

```javascript
import { SMS, Cache, Validator } from 'vasuzex';
import { randomInt } from 'crypto';

// 1. Generate and send OTP
export async function sendOtp(phone) {
  // Validate phone
  const validator = Validator.make({ phone }, {
    phone: 'required|regex:/^\+[1-9]\d{1,14}$/'
  });

  if (validator.fails()) {
    throw new Error('Invalid phone number');
  }

  // Generate OTP
  const otp = randomInt(100000, 999999).toString();

  // Store in cache (10 minutes)
  await Cache.put(`otp:${phone}`, otp, 600);

  // Send SMS
  const result = await SMS.sendOtp(phone, otp, {
    appName: 'MyApp',
    expiryMinutes: 10
  });

  if (!result.success) {
    throw new Error('Failed to send OTP');
  }

  return {
    messageId: result.messageId,
    expiresAt: Date.now() + (10 * 60 * 1000)
  };
}

// 2. Verify OTP
export async function verifyOtp(phone, otp) {
  const storedOtp = await Cache.get(`otp:${phone}`);

  if (!storedOtp) {
    return { verified: false, error: 'OTP expired' };
  }

  if (storedOtp !== otp) {
    return { verified: false, error: 'Invalid OTP' };
  }

  // Delete used OTP
  await Cache.forget(`otp:${phone}`);

  return { verified: true };
}
```

---

## 🚀 Production Checklist

- [ ] Environment variables configured
- [ ] Driver credentials tested
- [ ] Rate limiting implemented
- [ ] Phone number validation added
- [ ] SMS logging enabled
- [ ] Queue setup for async sending
- [ ] Error handling implemented
- [ ] Monitoring/analytics configured
- [ ] Cost tracking enabled
- [ ] Backup driver configured

---

**Built with ❤️ for Laravel developers by the Neastore team**
