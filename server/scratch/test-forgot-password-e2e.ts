import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:5000/api';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('==================================================');
  console.log('STARTING FORGOT PASSWORD E2E TEST SUITE');
  console.log('==================================================\n');

  const testEmail = 'shalini.meshram@gmail.com';
  const invalidEmailFormat = 'invalid-email';
  const nonexistentEmail = 'nobody@example.com';
  const newPassword = 'newPassword123';

  // Keep track of the original password hash to restore it later
  let originalPasswordHash = '';
  const owner = await prisma.user.findUnique({ where: { email: testEmail } });
  if (owner) {
    originalPasswordHash = owner.password;
    console.log(`[INFO] Found owner account in DB. Saved original password hash.`);
  } else {
    console.error(`[FAIL] Owner account not found in DB! Seed data might be missing.`);
    process.exit(1);
  }

  // Clean up any old reset tokens for this email first
  await prisma.passwordResetToken.deleteMany({
    where: { email: testEmail }
  });

  // 1. Test invalid email format validation
  try {
    console.log('1. Testing validation for invalid email format...');
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: invalidEmailFormat })
    });
    
    const data: any = await res.json();
    if (res.status === 400) {
      console.log(`   [SUCCESS] Received 400 Bad Request. Error: "${data.error}"\n`);
    } else {
      console.error(`   [FAIL] Expected 400 Bad Request, got status ${res.status}:`, data);
    }
  } catch (err: any) {
    console.error('   [FAIL] Invalid email format test failed:', err.message);
  }

  // 2. Test account enumeration protection with nonexistent email
  try {
    console.log('2. Testing account enumeration protection with non-existent email...');
    
    // Count tokens before request
    const countBefore = await prisma.passwordResetToken.count();
    
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: nonexistentEmail })
    });
    
    const data: any = await res.json();
    const countAfter = await prisma.passwordResetToken.count();

    if (res.status === 200) {
      console.log(`   [SUCCESS] Received 200 OK.`);
      console.log(`   Response Message: "${data.message}"`);
      if (countBefore === countAfter) {
        console.log(`   [SUCCESS] Verified that NO reset token was generated in the DB.\n`);
      } else {
        console.error(`   [FAIL] A reset token was generated in the DB for a non-existent email!`);
      }
    } else {
      console.error(`   [FAIL] Expected 200 OK, got status ${res.status}:`, data);
    }
  } catch (err: any) {
    console.error('   [FAIL] Account enumeration test failed:', err.message);
  }

  // 3. Test successful forgot-password flow with registered email
  let activeToken = '';
  try {
    console.log('3. Testing forgot-password request for registered email...');
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    
    const data: any = await res.json();
    if (res.status === 200) {
      console.log(`   [SUCCESS] Received 200 OK.`);
      console.log(`   Response Message: "${data.message}"`);

      // Retrieve the generated token from the DB
      const tokenRecord = await prisma.passwordResetToken.findFirst({
        where: { email: testEmail, used: false },
        orderBy: { createdAt: 'desc' }
      });

      if (tokenRecord) {
        activeToken = tokenRecord.token;
        console.log(`   [SUCCESS] Retrieved active token from DB: "${activeToken}"`);
        console.log(`   [SUCCESS] Token expiry set: ${tokenRecord.expiresAt.toISOString()}\n`);
      } else {
        console.error(`   [FAIL] No active token found in DB for "${testEmail}"`);
      }
    } else {
      console.error(`   [FAIL] Expected 200 OK, got status ${res.status}:`, data);
    }
  } catch (err: any) {
    console.error('   [FAIL] Registered email test failed:', err.message);
  }

  // 4. Test validation on reset-password endpoint (short password, missing token)
  try {
    console.log('4. Testing validation constraints on reset-password endpoint...');
    
    // Short password
    const resShort = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: activeToken, password: '123' })
    });
    const dataShort: any = await resShort.json();
    if (resShort.status === 400) {
      console.log(`   [SUCCESS] Short password blocked (400 Bad Request). Error: "${dataShort.error}"`);
    } else {
      console.error(`   [FAIL] Expected 400 for short password, got status ${resShort.status}:`, dataShort);
    }

    // Missing token
    const resNoToken = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: '', password: newPassword })
    });
    const dataNoToken: any = await resNoToken.json();
    if (resNoToken.status === 400) {
      console.log(`   [SUCCESS] Missing token blocked (400 Bad Request). Error: "${dataNoToken.error}"\n`);
    } else {
      console.error(`   [FAIL] Expected 400 for missing token, got status ${resNoToken.status}:`, dataNoToken);
    }
  } catch (err: any) {
    console.error('   [FAIL] Reset password validation test failed:', err.message);
  }

  // 5. Test successful password reset with valid token
  try {
    console.log('5. Testing successful password reset using valid token...');
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: activeToken, password: newPassword })
    });
    
    const data: any = await res.json();
    if (res.status === 200) {
      console.log(`   [SUCCESS] Password reset returned 200 OK.`);
      console.log(`   Response Message: "${data.message}"`);

      // Verify that the token is marked as used in DB
      const tokenRecord = await prisma.passwordResetToken.findUnique({
        where: { token: activeToken }
      });
      if (tokenRecord?.used) {
        console.log(`   [SUCCESS] Verified token status in DB: "used = true"`);
      } else {
        console.error(`   [FAIL] Token was not marked as used in the DB!`);
      }

      // Verify that the password was updated in the DB
      const updatedUser = await prisma.user.findUnique({ where: { email: testEmail } });
      if (updatedUser && updatedUser.password !== originalPasswordHash) {
        console.log(`   [SUCCESS] Verified user password hash in DB has changed.\n`);
      } else {
        console.error(`   [FAIL] User password hash was not updated in the DB!`);
      }
    } else {
      console.error(`   [FAIL] Expected 200 OK, got status ${res.status}:`, data);
    }
  } catch (err: any) {
    console.error('   [FAIL] Valid token reset test failed:', err.message);
  }

  // 6. Test single-use constraint (re-use of token should fail)
  try {
    console.log('6. Testing single-use constraint (reusing same token)...');
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: activeToken, password: 'anotherNewPassword123' })
    });
    
    const data: any = await res.json();
    if (res.status === 400 || res.status === 500) {
      console.log(`   [SUCCESS] Re-use blocked successfully with status ${res.status}. Error: "${data.error}"\n`);
    } else {
      console.error(`   [FAIL] Expected failure for token re-use, got status ${res.status}:`, data);
    }
  } catch (err: any) {
    console.error('   [FAIL] Token re-use test failed:', err.message);
  }

  // 7. Test expired token block
  try {
    console.log('7. Testing expired token block...');
    
    // Create an expired token record in DB directly
    const expiredTokenStr = 'expired-mock-token-12345';
    const expiresAt = new Date(Date.now() - 5000); // 5 seconds ago
    
    await prisma.passwordResetToken.create({
      data: {
        email: testEmail,
        token: expiredTokenStr,
        expiresAt,
        used: false
      }
    });

    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: expiredTokenStr, password: 'expiredTokenPassword123' })
    });

    const data: any = await res.json();
    if (res.status === 400 || res.status === 500) {
      console.log(`   [SUCCESS] Expired token reset blocked with status ${res.status}. Error: "${data.error}"\n`);
    } else {
      console.error(`   [FAIL] Expected failure for expired token, got status ${res.status}:`, data);
    }

    // Clean up expired token
    await prisma.passwordResetToken.delete({
      where: { token: expiredTokenStr }
    });
  } catch (err: any) {
    console.error('   [FAIL] Expired token test failed:', err.message);
  }

  // 8. Restore original password in the database
  try {
    console.log('8. Restoring original password hash in the database...');
    await prisma.user.update({
      where: { email: testEmail },
      data: { password: originalPasswordHash }
    });
    console.log('   [SUCCESS] Original password hash restored.\n');
  } catch (err: any) {
    console.error('   [FAIL] Failed to restore original password hash:', err.message);
  }

  // 9. Test Rate Limiter (send > 100 requests to /api/auth/forgot-password)
  try {
    console.log('9. Testing rate limiter (sending 105 concurrent/rapid requests)...');
    
    const requests = Array.from({ length: 105 }).map(() =>
      fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
      })
    );

    const responses = await Promise.all(requests);
    const statuses = responses.map(r => r.status);
    const has429 = statuses.includes(429);
    const rateLimitCount = statuses.filter(s => s === 429).length;

    if (has429) {
      console.log(`   [SUCCESS] Rate limiter successfully triggered!`);
      console.log(`   Total requests sent: 105`);
      console.log(`   Number of 429 Too Many Requests responses: ${rateLimitCount}\n`);
    } else {
      console.error(`   [FAIL] Rate limiter was not triggered. Statuses received:`, statuses.reduce((acc: any, status) => {
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}));
    }
  } catch (err: any) {
    console.error('   [FAIL] Rate limiter test failed:', err.message);
  }

  console.log('==================================================');
  console.log('FORGOT PASSWORD E2E TEST SUITE EXECUTION COMPLETED');
  console.log('==================================================');
}

runTests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
