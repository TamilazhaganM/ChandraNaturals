import 'dotenv/config';
import Razorpay from 'razorpay';
import crypto from 'crypto';

class RazorpayService {
  constructor() {
    this.client = null;
    this.initClient();
  }

  getKeyId() {
    return process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag';
  }

  getKeySecret() {
    return process.env.RAZORPAY_KEY_SECRET || 'test_secret_mock';
  }

  getWebhookSecret() {
    return process.env.RAZORPAY_WEBHOOK_SECRET || 'test_webhook_secret_mock';
  }

  initClient() {
    const keyId = this.getKeyId();
    const keySecret = this.getKeySecret();

    if (keyId && keySecret && !keySecret.includes('mock')) {
      try {
        this.client = new Razorpay({
          key_id: keyId,
          key_secret: keySecret
        });
        console.log(`💳 Razorpay client initialized with Key ID: ${keyId}`);
      } catch (err) {
        console.warn('⚠️  Razorpay client initialization warning:', err.message);
        this.client = null;
      }
    }
    return this.client;
  }

  getClient() {
    if (!this.client || !this.client.key_id || this.client.key_id !== this.getKeyId()) {
      this.initClient();
    }
    return this.client;
  }

  /**
   * Create Razorpay Order with amount strictly in paise (INR)
   */
  async createOrder({ amount, currency = 'INR', receipt, notes = {} }) {
    const client = this.getClient();
    const keyId = this.getKeyId();
    const keySecret = this.getKeySecret();
    const amountInPaise = Math.round(amount * 100);

    // If using live or real test keys with Razorpay API
    if (client && !keySecret.includes('mock')) {
      try {
        const order = await client.orders.create({
          amount: amountInPaise,
          currency,
          receipt,
          notes
        });
        return {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: keyId
        };
      } catch (err) {
        console.error('❌ Razorpay order creation failed:', err.message);
        throw new Error(`Razorpay API Error: ${err.message}`);
      }
    } else {
      // In development mode or automated tests with mock keys
      const mockOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
      console.log(`💳 [DEV RAZORPAY SIMULATOR] Order created: ${mockOrderId} for ₹${amount} (${amountInPaise} paise)`);
      return {
        id: mockOrderId,
        amount: amountInPaise,
        currency,
        keyId: keyId
      };
    }
  }

  /**
   * Verify Razorpay Payment Signature
   * Signature algorithm: HMAC-SHA256(order_id + '|' + payment_id, secret)
   */
  verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return false;
    }

    try {
      const keySecret = this.getKeySecret();
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      // Use timing-safe comparison to prevent timing attacks
      const signatureBuffer = Buffer.from(razorpay_signature, 'utf-8');
      const expectedBuffer = Buffer.from(generatedSignature, 'utf-8');

      if (signatureBuffer.length !== expectedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    } catch (err) {
      console.error('❌ Signature verification error:', err.message);
      return false;
    }
  }

  /**
   * Generate valid signature helper (useful for automated testing)
   */
  generateTestSignature(orderId, paymentId) {
    return crypto
      .createHmac('sha256', this.getKeySecret())
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
  }

  /**
   * Verify Razorpay Webhook Signature
   */
  verifyWebhookSignature(rawBody, receivedSignature) {
    if (!rawBody || !receivedSignature) return false;

    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.getWebhookSecret())
        .update(rawBody)
        .digest('hex');

      const receivedBuffer = Buffer.from(receivedSignature, 'utf-8');
      const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');

      if (receivedBuffer.length !== expectedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
    } catch (err) {
      console.error('❌ Webhook signature verification error:', err.message);
      return false;
    }
  }
}

export const razorpayService = new RazorpayService();
export default razorpayService;
