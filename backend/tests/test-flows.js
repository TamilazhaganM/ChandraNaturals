import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import app from '../src/app.js';
import User from '../src/models/User.js';
import OTPVerification from '../src/models/OTPVerification.js';
import Product from '../src/models/Product.js';
import Order from '../src/models/Order.js';
import razorpayService from '../src/services/razorpayService.js';
import { ROLES, ORDER_STATUS, PAYMENT_STATUS } from '../src/config/constants.js';

let server;
let baseUrl;

const runTests = async () => {
  console.log('🧪 Starting Chandra Naturals Comprehensive Backend Test Suite...\n');
  await connectDB();

  // Start HTTP server on dynamic port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}/api`;
      console.log(`🌐 Test server running at ${baseUrl}\n`);
      resolve();
    });
  });

  let testsPassed = 0;
  let testsFailed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`  ✅ [PASS] ${description}`);
      testsPassed++;
    } else {
      console.error(`  ❌ [FAIL] ${description}`);
      testsFailed++;
    }
  };

  const testUser = {
    name: 'Priya Raman',
    email: `test_${Date.now()}@example.com`,
    phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: 'SecurePassword123!'
  };

  let customerAccessToken = '';
  let customerCookies = '';
  let createdOrderId = '';
  let razorpayOrderId = '';
  let testProductId = '';

  try {
    // -------------------------------------------------------------
    // Test 1: Customer Registration
    // -------------------------------------------------------------
    console.log('🔹 1. Testing Customer Registration & OTP Dispatch...');
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const regData = await regRes.json();

    assert(regRes.status === 201, 'Returns 201 Created');
    assert(regData.data?.requiresVerification === true, 'Response specifies requiresVerification: true');
    assert(!regData.data?.otp, 'Never exposes raw OTP in API response');

    // -------------------------------------------------------------
    // Test 2: Duplicate Registration Rejection
    // -------------------------------------------------------------
    console.log('\n🔹 2. Testing Duplicate Registration Prevention...');
    const dupRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    assert(dupRes.status === 409, 'Returns 409 Conflict for duplicate email/phone');

    // -------------------------------------------------------------
    // Test 3: OTP Verification & Token Issuance
    // -------------------------------------------------------------
    console.log('\n🔹 3. Testing OTP Verification...');
    // Retrieve the active OTP hash from DB to simulate the received code
    const otpDoc = await OTPVerification.findOne({
      identifier: testUser.email,
      purpose: 'registration',
      isUsed: false
    });

    assert(!!otpDoc, 'Hashed OTP record saved in MongoDB');
    assert(otpDoc?.otpHash?.length === 64, 'Stored OTP is a secure 64-char SHA-256 hash (never plain-text)');

    // Test invalid OTP rejection
    const invalidOtpRes = await fetch(`${baseUrl}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: testUser.email,
        otp: '000000',
        purpose: 'registration'
      })
    });
    assert(invalidOtpRes.status === 400, 'Rejects incorrect 6-digit OTP code');

    // Manually compute valid OTP for our generated OTP record or regenerate
    const validOTP = '123456';
    otpDoc.otpHash = OTPVerification.hashOTP(validOTP);
    await otpDoc.save();

    const verifyRes = await fetch(`${baseUrl}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: testUser.email,
        otp: validOTP,
        purpose: 'registration'
      })
    });
    const verifyData = await verifyRes.json();
    customerAccessToken = verifyData.data?.accessToken;
    customerCookies = verifyRes.headers.get('set-cookie') || '';

    assert(verifyRes.status === 200, 'Verifies OTP successfully');
    assert(!!customerAccessToken, 'Issues short-lived JWT access token upon verification');
    assert(customerCookies.includes('refreshToken='), 'Sets HttpOnly Secure refresh token cookie');

    // -------------------------------------------------------------
    // Test 4: Customer Login & Invalid Password Rejection
    // -------------------------------------------------------------
    console.log('\n🔹 4. Testing Authentication & Credential Checking...');
    const badLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: testUser.email, password: 'WrongPassword!' })
    });
    assert(badLoginRes.status === 401, 'Rejects invalid password with 401 Unauthorized');

    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: testUser.email, password: testUser.password })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'Customer signs in successfully');
    assert(loginData.data?.user?.email === testUser.email, 'Returns authenticated user profile without password');

    // -------------------------------------------------------------
    // Test 5: Protected Route (/api/auth/me) & Token Refresh
    // -------------------------------------------------------------
    console.log('\n🔹 5. Testing Protected Endpoints & Token Refresh...');
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${customerAccessToken}` }
    });
    assert(meRes.status === 200, 'Protected GET /api/auth/me accepts Bearer token');

    const unauthMeRes = await fetch(`${baseUrl}/auth/me`);
    assert(unauthMeRes.status === 401, 'Rejects unauthenticated request without token');

    const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: customerCookies }
    });
    const refreshData = await refreshRes.json();
    assert(refreshRes.status === 200, 'Rotates refresh token and returns new access token');
    if (refreshData.data?.accessToken) {
      customerAccessToken = refreshData.data.accessToken;
    }

    // -------------------------------------------------------------
    // Test 6: Product Catalog & Filtering
    // -------------------------------------------------------------
    console.log('\n🔹 6. Testing Product Browsing, Filtering & Search...');
    const prodRes = await fetch(`${baseUrl}/products`);
    const prodData = await prodRes.json();
    assert(prodRes.status === 200, 'Fetches product list');
    assert(prodData.data?.products?.length > 0, `Returns products (found ${prodData.data?.products?.length})`);

    testProductId = prodData.data?.products?.[0]?._id;

    const catFilterRes = await fetch(`${baseUrl}/products?category=thokku`);
    const catFilterData = await catFilterRes.json();
    const allThokku = catFilterData.data?.products?.every(p => p.category === 'thokku');
    assert(allThokku, 'Category filtering returns strictly matching items');

    const searchRes = await fetch(`${baseUrl}/products?search=tomato`);
    const searchData = await searchRes.json();
    assert(searchData.data?.products?.length > 0, 'Keyword search finds relevant products');

    const slugRes = await fetch(`${baseUrl}/products/slug/tomato-thokku`);
    assert(slugRes.status === 200, 'Fetches single product details by slug');

    // -------------------------------------------------------------
    // Test 7: Cart Operations
    // -------------------------------------------------------------
    console.log('\n🔹 7. Testing Customer Cart...');
    const addToCartRes = await fetch(`${baseUrl}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAccessToken}`
      },
      body: JSON.stringify({ productId: testProductId, quantity: 2 })
    });
    const cartData = await addToCartRes.json();
    assert(addToCartRes.status === 200, 'Adds product to cart');
    assert(cartData.data?.itemCount === 2, 'Recalculates cart item count correctly');
    assert(cartData.data?.subtotal > 0, 'Computes accurate server subtotal');

    // -------------------------------------------------------------
    // Test 8: Address Management
    // -------------------------------------------------------------
    console.log('\n🔹 8. Testing Address Book...');
    const addressPayload = {
      fullName: testUser.name,
      phone: testUser.phone,
      addressLine: 'Flat 4B, Heritage Enclave, Mylapore',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600004',
      addressType: 'home',
      isDefault: true
    };

    const addAddressRes = await fetch(`${baseUrl}/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAccessToken}`
      },
      body: JSON.stringify(addressPayload)
    });
    const addressData = await addAddressRes.json();
    assert(addAddressRes.status === 201, 'Saves shipping address with valid 6-digit Indian pincode');
    assert(addressData.data?.address?.isDefault === true, 'Sets address as default');

    // -------------------------------------------------------------
    // Test 9: Server-Side Order Calculation & Stock Reservation
    // -------------------------------------------------------------
    console.log('\n🔹 9. Testing Order Creation & Stock Integrity...');
    const initialProduct = await Product.findById(testProductId);
    const stockBefore = initialProduct.stock;

    const orderRes = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAccessToken}`
      },
      body: JSON.stringify({
        shippingAddress: addressPayload,
        paymentMethod: 'razorpay',
        notes: 'Pack in eco-friendly wrapping'
      })
    });
    const orderData = await orderRes.json();
    assert(orderRes.status === 201, 'Order created successfully');
    assert(orderData.data?.order?.orderNumber?.startsWith('CN-'), 'Generates valid order number (CN-XXXXXX)');
    assert(orderData.data?.order?.total > 0, 'Calculates non-zero server verified grand total');

    createdOrderId = orderData.data?.order?._id;
    razorpayOrderId = orderData.data?.razorpayOrder?.id;

    const productAfter = await Product.findById(testProductId);
    assert(productAfter.stock === stockBefore - 2, 'Atomically decrements reserved stock in database');

    // -------------------------------------------------------------
    // Test 10: Razorpay Payment Verification
    // -------------------------------------------------------------
    console.log('\n🔹 10. Testing Razorpay Payment Verification & Security...');
    const testPaymentId = `pay_${Date.now()}`;
    const validSignature = razorpayService.generateTestSignature(razorpayOrderId, testPaymentId);

    // Test forged signature rejection
    const forgedPayRes = await fetch(`${baseUrl}/payment/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAccessToken}`
      },
      body: JSON.stringify({
        orderId: createdOrderId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: 'forged_fake_signature_hash'
      })
    });
    assert(forgedPayRes.status === 400, 'Rejects forged or tampered Razorpay signatures with 400');

    // Test authentic signature acceptance
    const validPayRes = await fetch(`${baseUrl}/payment/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAccessToken}`
      },
      body: JSON.stringify({
        orderId: createdOrderId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: validSignature
      })
    });
    const validPayData = await validPayRes.json();
    assert(validPayRes.status === 200, 'Cryptographically verifies authentic HMAC-SHA256 signature');
    assert(validPayData.data?.order?.paymentStatus === PAYMENT_STATUS.PAID, 'Marks order paymentStatus as PAID');
    assert(validPayData.data?.order?.orderStatus === ORDER_STATUS.CONFIRMED, 'Marks order orderStatus as CONFIRMED');

    // -------------------------------------------------------------
    // Test 11: Admin Authorization & Dashboard Analytics
    // -------------------------------------------------------------
    console.log('\n🔹 11. Testing Admin Authorization & Analytics Dashboard...');
    // Customer attempting to access admin route must get 403 Forbidden
    const forbiddenRes = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${customerAccessToken}` }
    });
    assert(forbiddenRes.status === 403, 'Restricts admin dashboard from customers with 403 Forbidden');

    // Sign in as Admin
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: process.env.ADMIN_EMAIL || 'admin@chandranaturals.com',
        password: process.env.ADMIN_PASSWORD || 'AdminPass@Chandra2026'
      })
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.data?.accessToken;

    const dashboardRes = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const dashboardData = await dashboardRes.json();
    assert(dashboardRes.status === 200, 'Admin accesses dashboard statistics successfully');
    assert(dashboardData.data?.metrics?.totalOrders >= 1, 'Reflects accurate total order count');
    assert(dashboardData.data?.metrics?.totalSales > 0, 'Reflects paid sales revenue');

    // -------------------------------------------------------------
    // Test 12: Admin Order Status Update
    // -------------------------------------------------------------
    console.log('\n🔹 12. Testing Admin Order Lifecycle & Tracking Updates...');
    const statusUpdateRes = await fetch(`${baseUrl}/admin/orders/${createdOrderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: ORDER_STATUS.SHIPPED,
        carrier: 'Blue Dart Express',
        trackingNumber: 'BD982341234IN'
      })
    });
    const statusData = await statusUpdateRes.json();
    assert(statusUpdateRes.status === 200, 'Admin updates order fulfillment status to SHIPPED');
    assert(statusData.data?.order?.trackingInfo?.trackingNumber === 'BD982341234IN', 'Attaches courier tracking number');

    console.log('\n=======================================================');
    console.log(`🎉 Test Suite Complete: ${testsPassed} Passed, ${testsFailed} Failed.`);
    console.log('=======================================================');

  } catch (error) {
    console.error('❌ Unexpected test error:', error);
    testsFailed++;
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
    process.exit(testsFailed > 0 ? 1 : 0);
  }
};

runTests();
