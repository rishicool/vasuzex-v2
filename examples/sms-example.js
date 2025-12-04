/**
 * SMS Service Example App
 * 
 * Demonstrates all SMS features including:
 * - Basic SMS sending
 * - OTP flow (send & verify)
 * - Multiple drivers
 * - Bulk sending
 * - Queue integration
 * 
 * Run: node examples/sms-example.js
 */

import { Application } from 'vasuzex/Foundation/Application';
import { SMS, Queue, Cache, Validator } from 'vasuzex/Support/Facades';
import { randomInt } from 'crypto';

// Initialize application
const app = new Application(process.cwd());

// Load configuration
app.loadConfig();

// Register service providers
const { SmsServiceProvider } = await import('../framework/Services/SMS/SmsServiceProvider.js');
app.register(new SmsServiceProvider());

// Boot application
await app.boot();

console.log('📱 SMS Service Example App\n');

// =============================================================================
// Example 1: Basic SMS Sending
// =============================================================================

async function example1_BasicSending() {
  console.log('1️⃣  Basic SMS Sending');
  console.log('─'.repeat(50));

  try {
    const result = await SMS.send({
      to: '+919876543210',
      message: 'Hello from Neastore Framework! 🚀'
    });

    console.log('✅ SMS sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Provider:', result.provider);
    console.log();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// =============================================================================
// Example 2: Send OTP
// =============================================================================

async function example2_SendOTP() {
  console.log('2️⃣  Send OTP');
  console.log('─'.repeat(50));

  try {
    const otp = randomInt(100000, 999999).toString();
    
    const result = await SMS.sendOtp('+919876543210', otp, {
      appName: 'Neastore',
      expiryMinutes: 10
    });

    console.log('✅ OTP sent successfully!');
    console.log('OTP:', otp);
    console.log('Message ID:', result.messageId);
    console.log();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// =============================================================================
// Example 3: Complete OTP Flow
// =============================================================================

async function example3_OTPFlow() {
  console.log('3️⃣  Complete OTP Flow (Send + Verify)');
  console.log('─'.repeat(50));

  const phone = '+919876543210';
  
  try {
    // Generate OTP
    const otp = randomInt(100000, 999999).toString();
    console.log('Generated OTP:', otp);

    // Store in cache
    await Cache.put(`otp:${phone}`, otp, 600); // 10 minutes
    console.log('✅ OTP stored in cache');

    // Send OTP via SMS
    const result = await SMS.sendOtp(phone, otp);
    console.log('✅ OTP sent via SMS');
    console.log('Message ID:', result.messageId);

    // Simulate user entering OTP
    console.log('\n📱 User enters OTP...');
    const userOtp = otp; // Simulating correct OTP

    // Verify OTP
    const storedOtp = await Cache.get(`otp:${phone}`);
    
    if (storedOtp === userOtp) {
      console.log('✅ OTP verified successfully!');
      await Cache.forget(`otp:${phone}`);
      console.log('✅ OTP removed from cache');
    } else {
      console.log('❌ Invalid OTP');
    }
    console.log();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// =============================================================================
// Example 4: Multiple Drivers
// =============================================================================

async function example4_MultipleDrivers() {
  console.log('4️⃣  Using Multiple Drivers');
  console.log('─'.repeat(50));

  const message = {
    to: '+919876543210',
    message: 'Testing different drivers'
  };

  try {
    // Get available drivers
    const drivers = SMS.availableDrivers();
    console.log('Available drivers:', drivers.join(', '));
    console.log();

    // Send via default driver
    console.log('📤 Sending via default driver...');
    const result1 = await SMS.send(message);
    console.log('✅ Sent via:', result1.provider);

    // Send via specific driver (log)
    console.log('\n📤 Sending via log driver...');
    const result2 = await SMS.driver('log').send(message);
    console.log('✅ Sent via:', result2.provider);

    // If Twilio is configured
    if (drivers.includes('twilio')) {
      console.log('\n📤 Sending via Twilio...');
      const result3 = await SMS.driver('twilio').send(message);
      console.log('✅ Sent via:', result3.provider);
    }
    
    console.log();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// =============================================================================
// Example 5: Bulk SMS Sending
// =============================================================================

async function example5_BulkSending() {
  console.log('5️⃣  Bulk SMS Sending');
  console.log('─'.repeat(50));

  const users = [
    { phone: '+919876543210', name: 'User 1' },
    { phone: '+919876543211', name: 'User 2' },
    { phone: '+919876543212', name: 'User 3' },
  ];

  try {
    const messages = users.map(user => ({
      to: user.phone,
      message: `Hello ${user.name}! Welcome to Neastore.`
    }));

    console.log(`📤 Sending ${messages.length} messages...`);
    
    const driver = SMS.driver('log');
    const results = await driver.sendBulk(messages);

    const successful = results.filter(r => r.success).length;
    console.log(`✅ ${successful}/${results.length} messages sent successfully`);
    console.log();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// =============================================================================
// Example 6: Phone Number Validation
// =============================================================================

async function example6_PhoneValidation() {
  console.log('6️⃣  Phone Number Validation');
  console.log('─'.repeat(50));

  const testNumbers = [
    '+919876543210',  // Valid
    '9876543210',     // Missing +
    '+91987654',      // Too short
    'invalid',        // Invalid
  ];

  for (const phone of testNumbers) {
    const validator = await Validator.make(
      { phone },
      { phone: 'required|regex:/^\\+[1-9]\\d{1,14}$/' }
    );

    const isValid = !validator.fails();
    console.log(
      phone.padEnd(20),
      isValid ? '✅ Valid' : '❌ Invalid'
    );
  }
  
  console.log();
}

// =============================================================================
// Example 7: 2Factor Auto OTP (India-specific)
// =============================================================================

async function example7_TwoFactorAutoOTP() {
  console.log('7️⃣  2Factor Auto OTP (India)');
  console.log('─'.repeat(50));

  try {
    const driver = SMS.driver('twofactor');

    // Send auto-generated OTP
    console.log('📤 Sending auto-generated OTP...');
    const result = await driver.sendAutoOtp('+919876543210', {
      otpLength: 6
    });

    if (result.success) {
      console.log('✅ OTP sent successfully!');
      console.log('Session ID:', result.sessionId);

      // Simulate user entering OTP
      const userOtp = '123456'; // User would enter this

      // Verify OTP
      console.log('\n🔐 Verifying OTP...');
      const verified = await driver.verifyOtp(result.sessionId, userOtp);

      if (verified.verified) {
        console.log('✅ OTP verified!');
      } else {
        console.log('❌ Invalid OTP');
      }
    }
    
    console.log();
  } catch (error) {
    console.log('⚠️  2Factor not configured or unavailable');
    console.log('   Configure TWOFACTOR_API_KEY in .env to test');
    console.log();
  }
}

// =============================================================================
// Example 8: Log Driver Testing
// =============================================================================

async function example8_LogDriverTesting() {
  console.log('8️⃣  Log Driver for Testing');
  console.log('─'.repeat(50));

  const driver = SMS.driver('log');

  // Send multiple messages
  await driver.send({ to: '+919876543210', message: 'Message 1' });
  await driver.send({ to: '+919876543210', message: 'Message 2' });
  await driver.send({ to: '+919876543211', message: 'Message 3' });

  // Get all messages
  const allMessages = driver.getAllMessages();
  console.log(`📧 Total messages logged: ${allMessages.length}`);

  // Get messages for specific number
  const userMessages = driver.getMessagesTo('+919876543210');
  console.log(`📧 Messages to +919876543210: ${userMessages.length}`);

  // Get specific message
  const firstMessage = allMessages[0];
  console.log('\n📄 First message:');
  console.log('  To:', firstMessage.to);
  console.log('  Message:', firstMessage.message);
  console.log('  Timestamp:', firstMessage.timestamp);

  // Clear logs
  driver.clear();
  console.log('\n🗑️  Logs cleared');
  console.log(`📧 Messages after clear: ${driver.getAllMessages().length}`);
  console.log();
}

// =============================================================================
// Example 9: Error Handling
// =============================================================================

async function example9_ErrorHandling() {
  console.log('9️⃣  Error Handling');
  console.log('─'.repeat(50));

  // Test invalid phone number
  try {
    await SMS.send({
      to: 'invalid',
      message: 'Test'
    });
  } catch (error) {
    console.log('❌ Caught error:', error.message);
  }

  // Test missing message
  try {
    await SMS.send({
      to: '+919876543210'
      // message missing
    });
  } catch (error) {
    console.log('❌ Caught error:', error.message);
  }

  // Test non-existent driver
  try {
    await SMS.driver('nonexistent').send({
      to: '+919876543210',
      message: 'Test'
    });
  } catch (error) {
    console.log('❌ Caught error:', error.message);
  }

  console.log('\n✅ All errors handled gracefully');
  console.log();
}

// =============================================================================
// Example 10: Helper Methods
// =============================================================================

async function example10_HelperMethods() {
  console.log('🔟 Helper Methods');
  console.log('─'.repeat(50));

  // Send OTP
  console.log('📤 Sending OTP...');
  await SMS.sendOtp('+919876543210', '123456');
  console.log('✅ Sent');

  // Send verification code
  console.log('\n📤 Sending verification code...');
  await SMS.sendVerificationCode('+919876543210', 'ABC123');
  console.log('✅ Sent');

  // Send notification
  console.log('\n📤 Sending notification...');
  await SMS.notify('+919876543210', 'Your order #123 has shipped!');
  console.log('✅ Sent');

  console.log();
}

// =============================================================================
// Run All Examples
// =============================================================================

async function runAllExamples() {
  await example1_BasicSending();
  await example2_SendOTP();
  await example3_OTPFlow();
  await example4_MultipleDrivers();
  await example5_BulkSending();
  await example6_PhoneValidation();
  await example7_TwoFactorAutoOTP();
  await example8_LogDriverTesting();
  await example9_ErrorHandling();
  await example10_HelperMethods();

  console.log('═'.repeat(50));
  console.log('✅ All examples completed!');
  console.log('═'.repeat(50));
}

// Run examples
runAllExamples().catch(console.error);
