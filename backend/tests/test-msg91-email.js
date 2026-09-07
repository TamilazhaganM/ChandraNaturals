import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import app from '../src/app.js';
import notificationService from '../src/services/notificationService.js';
import OTPVerification from '../src/models/OTPVerification.js';

let server;
let baseUrl;

const runMsg91EmailTest = async () => {
  console.log('🧪 Testing MSG91 Email Verification Service...\n');
  await connectDB();

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}/api`;
      resolve();
    });
  });

  const testEmail = `msg91_test_${Date.now()}@example.com`;

  try {
    // Test 1: POST /api/auth/send-email-otp
    console.log('1. Testing POST /api/auth/send-email-otp...');
    const sendRes = await fetch(`${baseUrl}/auth/send-email-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, name: 'Ananya Sharma' })
    });

    const sendData = await sendRes.json();
    console.log('Response status:', sendRes.status, sendData);
    if (sendRes.status !== 200 || !sendData.data?.email) {
      throw new Error('Failed to send email OTP');
    }
    console.log('✅ POST /api/auth/send-email-otp succeeded!\n');

    // Test 2: Locate OTP from DB
    const otpDoc = await OTPVerification.findOne({
      identifier: testEmail,
      purpose: 'registration',
      isUsed: false
    });

    if (!otpDoc) throw new Error('OTP record not found in MongoDB');
    console.log('✅ Active OTP document found with hash length:', otpDoc.otpHash.length);

    // Test 3: Test invalid OTP code
    console.log('\n2. Testing invalid OTP verification rejection...');
    const invalidVerifyRes = await fetch(`${baseUrl}/auth/verify-email-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: '000000' })
    });
    console.log('Invalid OTP response status:', invalidVerifyRes.status);
    if (invalidVerifyRes.status !== 400) throw new Error('Should reject invalid OTP');
    console.log('✅ Invalid OTP was properly rejected!\n');

    // Test 4: notificationService.sendMsg91EmailOTP payload verification (unit test)
    console.log('3. Testing MSG91 email payload generation...');
    let interceptedFetch = null;
    const originalFetch = global.fetch;

    global.fetch = async (url, options) => {
      if (url === 'https://control.msg91.com/api/v5/email/send') {
        interceptedFetch = { url, options, body: JSON.parse(options.body) };
        return {
          ok: true,
          status: 200,
          json: async () => ({ status: 'success', message: 'Email queued' })
        };
      }
      return originalFetch(url, options);
    };

    // Temporarily set MSG91 env vars
    process.env.MSG91_AUTH_KEY = 'test_msg91_auth_key';
    process.env.MSG91_EMAIL_TEMPLATE_ID = 'test_template_123';
    process.env.MSG91_EMAIL_DOMAIN = 'mail.chandranaturals.com';

    const result = await notificationService.sendEmailOTP({
      email: 'customer@chandranaturals.com',
      otp: '654321',
      purpose: 'registration',
      recipientName: 'Lakshmi Narayanan'
    });

    global.fetch = originalFetch;

    if (!interceptedFetch) throw new Error('MSG91 API endpoint was not called');
    console.log('Intercepted MSG91 URL:', interceptedFetch.url);
    console.log('Headers authkey:', interceptedFetch.options.headers.authkey);
    console.log('Recipients:', JSON.stringify(interceptedFetch.body.recipients, null, 2));
    console.log('Variables passed:', interceptedFetch.body.recipients[0].variables);
    console.log('From name:', interceptedFetch.body.from.name);
    console.log('Template ID:', interceptedFetch.body.template_id);
    console.log('Result channel:', result.channel);

    if (result.channel !== 'msg91_email') throw new Error('Channel should be msg91_email');
    if (interceptedFetch.body.recipients[0].variables.OTP !== '654321') throw new Error('OTP mismatch');
    if (interceptedFetch.body.template_id !== 'test_template_123') throw new Error('Template ID mismatch');

    console.log('\n🎉 MSG91 Email Service Integration Verification: ALL TESTS PASSED!\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    await mongoose.connection.close();
  }
};

runMsg91EmailTest();
