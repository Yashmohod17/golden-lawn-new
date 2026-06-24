import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { EmailService } from '../src/services/email.service';

async function runTests() {
  console.log('==================================================');
  console.log('STARTING TRANSACTIONAL EMAIL SYSTEM TEST SUITE');
  console.log('==================================================\n');

  const originalApiKey = process.env.RESEND_API_KEY;
  // Always force 'mock' mode first to test template formatting and mock log writing
  process.env.RESEND_API_KEY = 'mock';

  const logFilePath = path.join(__dirname, 'email-logs.txt');

  // Clear existing logs to isolate this test run
  if (fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, '');
    console.log(`[INFO] Cleared existing email logs at ${logFilePath}`);
  }

  // 1. Test HTML Layout Wrapper & Transactional Methods
  try {
    console.log('\n1. Testing transactional email template dispatches...');

    // Flow A: Inquiry / Contact Acknowledgement (Phase 4)
    console.log('   - Dispatching Inquiry Acknowledgement to Customer...');
    await EmailService.sendInquiryAcknowledgement('customer@example.com', {
      customerName: 'Aishwarya Rai',
      eventType: 'Wedding Reception',
      eventDate: '2026-10-12',
      guests: 400,
      notes: 'Require pure-vegetarian catering and royal gold staging themes.'
    });

    console.log('   - Dispatching Owner Inquiry Notification...');
    await EmailService.sendOwnerInquiryNotification({
      customerName: 'Aishwarya Rai',
      customerEmail: 'customer@example.com',
      customerPhone: '+91 99887 76655',
      eventType: 'Wedding Reception',
      eventDate: '2026-10-12',
      guests: 400,
      notes: 'Require pure-vegetarian catering and royal gold staging themes.'
    });

    // Flow B: Date Reserved Hold Email & Owner Notification
    console.log('   - Dispatching Date Reserved Notification to Customer...');
    await EmailService.sendDateReserved('customer@example.com', {
      customerName: 'Aishwarya Rai',
      bookingId: 'GC-2026-1012',
      eventDate: '2026-10-12',
      amountPaid: 500,
      expiresAt: '26 Jun 2026, 11:30 PM',
      contactPhone: '+91 98877 66554',
      contactEmail: 'shalini.meshram@gmail.com'
    });

    console.log('   - Dispatching Owner Booking Notification...');
    await EmailService.sendOwnerBookingNotification({
      customerName: 'Aishwarya Rai',
      customerEmail: 'customer@example.com',
      customerPhone: '+91 99887 76655',
      eventDate: '2026-10-12',
      eventType: 'Wedding Reception',
      bookingId: 'GC-2026-1012',
      amountPaid: 500
    });

    // Flow C: Payment Receipt (Phase 6)
    console.log('   - Dispatching Payment Receipt...');
    await EmailService.sendPaymentReceipt('customer@example.com', {
      customerName: 'Aishwarya Rai',
      bookingId: 'GC-2026-1012',
      transactionId: 'pay_reserve_987654',
      amount: 500,
      remainingBalance: 249500,
      paymentDate: '2026-06-24'
    });

    // Flow D: Booking Cancellation Notice
    console.log('   - Dispatching Booking Cancellation Notice...');
    await EmailService.sendBookingCancellation('customer@example.com', {
      customerName: 'Aishwarya Rai',
      bookingId: 'GC-2026-1012',
      eventDate: '2026-10-12',
      eventType: 'Wedding Reception',
      refundInfo: 'Processed cancellation for booking with ₹500 paid. Refund is subject to cancellation terms.'
    });

    // Flow E: Password Reset Email (Phase 5)
    console.log('   - Dispatching Password Reset Link...');
    await EmailService.sendPasswordReset('customer@example.com', {
      resetLink: 'http://localhost:4000/auth/reset-password?token=mock_reset_token_xyz',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    });

    console.log('   [SUCCESS] All dispatches invoked successfully.');
  } catch (err: any) {
    console.error('   [FAIL] Transactional dispatch test failed:', err.message);
  }

  // 2. Validate written contents of email-logs.txt
  try {
    console.log('\n2. Verifying written contents of email-logs.txt...');
    if (!fs.existsSync(logFilePath)) {
      throw new Error('Logs file was not created!');
    }
    const logContent = fs.readFileSync(logFilePath, 'utf-8');

    const expectedSnippets = [
      'Subject: Thank You for Your Inquiry - Golden Celebrations Lawn',
      'Subject: [INQUIRY] New Event Inquiry - Aishwarya Rai',
      'Subject: Date Reserved Successfully – Action Required Within 48 Hours',
      'Reservation ID',
      'Reservation Amount Paid',
      'Reservation Valid Until',
      'released automatically',
      'Subject: [ALERT] New Confirmed Booking - Aishwarya Rai',
      'Subject: Payment Receipt - Golden Celebrations Lawn',
      'Subject: Booking Cancellation: Event ID GC-2026-1012',
      'Subject: Password Reset Request - Golden Celebrations',
      'Where Every Milestone Glimmers', // Tagline check
      'Near Hudkeshwar, Nagpur', // Footer address check
      'pay_reserve_987654', // Specific data verification
      'Remaining Balance Due', // Remaining balance header
      '2,49,500', // Remaining balance amount formatted
      'Refund Details', // Refund status header
      'Refund is subject to cancellation terms', // Cancellation reason
      '+91 99887 76655' // Phone check in owner notification
    ];

    let allFound = true;
    for (const snippet of expectedSnippets) {
      if (logContent.includes(snippet)) {
        console.log(`   [PASS] Found snippet: "${snippet}"`);
      } else {
        console.error(`   [FAIL] Missing snippet: "${snippet}"`);
        allFound = false;
      }
    }

    if (allFound) {
      console.log('   [SUCCESS] Logs verification passed successfully.\n');
    } else {
      console.error('   [FAIL] Logs verification failed.\n');
    }
  } catch (err: any) {
    console.error('   [FAIL] Log validation failed:', err.message);
  }

  // 3. Test Email Retry Logic with Backoff (Mocking network failures)
  try {
    console.log('3. Testing retry mechanism with exponential backoff...');
    const originalSendEmail = EmailService.sendEmail;

    let callsCount = 0;
    // Mock low-level send to fail the first 2 times, then succeed
    EmailService.sendEmail = async function(options) {
      callsCount++;
      if (callsCount < 3) {
        return { success: false, error: 'Simulated temporary Resend API network gateway error' };
      }
      return { success: true, messageId: 'msg-success-mock-retry' };
    };

    console.log('   - Dispatching with mock failing API (should retry and succeed on attempt 3)...');
    const result = await (EmailService as any).sendEmailWithRetry({
      to: 'retry@example.com',
      subject: 'Retry Test',
      body: 'Retrying...'
    }, 3, 100); // 100ms base delay

    console.log(`   - Total attempts: ${callsCount}`);
    if (result.success && callsCount === 3) {
      console.log('   [SUCCESS] Retry mechanism successfully recovered on attempt 3!\n');
    } else {
      console.error(`   [FAIL] Retry test failed. Success: ${result.success}, Calls: ${callsCount}\n`);
    }

    // Restore original method
    EmailService.sendEmail = originalSendEmail;
  } catch (err: any) {
    console.error('   [FAIL] Retry mechanism test failed:', err.message);
  }

  // 4. Test Live Resend API delivery if real key is configured
  if (originalApiKey && originalApiKey !== 'mock' && originalApiKey !== 'YOUR_RESEND_API_KEY') {
    try {
      console.log('\n4. Testing live Resend API delivery (Sandbox Mode)...');
      // Restore original API Key
      process.env.RESEND_API_KEY = originalApiKey;
      
      // Override owner emails programmatically to target the verified Sandbox address
      const sandboxEmail = 'goldencelebrationlawn@gmail.com';
      process.env.OWNER_NOTIFICATION_EMAIL = sandboxEmail;
      process.env.OWNER_EMAIL = sandboxEmail;

      console.log(`   - Sending Live Inquiry Acknowledgment to ${sandboxEmail}...`);
      const result = await EmailService.sendInquiryAcknowledgement(sandboxEmail, {
        customerName: 'Aishwarya Rai (Live Sandbox Test)',
        eventType: 'Wedding Reception',
        eventDate: '2026-10-12',
        guests: 400,
        notes: 'Live verification of API Key authorization.'
      });

      if (result.success) {
        console.log(`   [SUCCESS] Live Sandbox email accepted by Resend! Message ID: ${result.messageId}`);
      } else {
        console.error(`   [FAIL] Resend API rejected delivery: ${result.error}`);
      }
    } catch (err: any) {
      console.error('   [FAIL] Live Resend API test caught error:', err.message);
    } finally {
      // Restore mock key state for environment safety
      process.env.RESEND_API_KEY = originalApiKey;
    }
  } else {
    console.log('\n4. Skipping live Resend API test (no valid RESEND_API_KEY found in environment).');
  }

  console.log('==================================================');
  console.log('TRANSACTIONAL EMAIL SYSTEM TEST SUITE COMPLETED');
  console.log('==================================================');
}

runTests().catch(console.error);
