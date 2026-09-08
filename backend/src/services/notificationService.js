import 'dotenv/config';
import nodemailer from 'nodemailer';

/**
 * Chandra Naturals Unified Notification Service
 * Decouples SMS (MSG91) and Email (Nodemailer/SMTP) delivery.
 */
class NotificationService {
  constructor() {
    this.emailTransporter = null;
    this.initEmailTransporter();
  }

  /**
   * Get or dynamically initialize Nodemailer SMTP transporter
   */
  getEmailTransporter() {
    if (!this.emailTransporter) {
      this.initEmailTransporter();
    }
    return this.emailTransporter;
  }

  /**
   * Initialize Nodemailer SMTP transporter if credentials are provided
   */
  initEmailTransporter() {
    const user = process.env.EMAIL_USER;
    const rawPass = process.env.EMAIL_PASS || '';
    const pass = rawPass.replace(/\s+/g, ''); // Strips any spaces from Gmail App Passwords

    if (user && pass) {
      try {
        const isGmail = (process.env.EMAIL_HOST && process.env.EMAIL_HOST.includes('gmail')) || user.includes('@gmail.com');
        const transportConfig = isGmail
          ? {
              service: 'gmail',
              auth: { user, pass }
            }
          : {
              host: process.env.EMAIL_HOST || 'smtp.gmail.com',
              port: parseInt(process.env.EMAIL_PORT, 10) || 587,
              secure: process.env.EMAIL_SECURE === 'true',
              auth: { user, pass }
            };

        this.emailTransporter = nodemailer.createTransport(transportConfig);
        console.log(`📧 SMTP Email Transporter initialized (${isGmail ? 'Gmail Service' : transportConfig.host}).`);
      } catch (err) {
        console.error('❌ Failed to initialize Email Transporter:', err.message);
      }
    }
  }

  /**
   * Determine whether identifier is an email or a phone number
   */
  isEmail(identifier) {
    return String(identifier).includes('@');
  }

  /**
   * Send OTP via Email or SMS depending on identifier and configuration
   */
  async sendOTP({ identifier, otp, purpose = 'verification', recipientName = 'Valued Customer' }) {
    try {
      if (this.isEmail(identifier)) {
        return await this.sendEmailOTP({ email: identifier, otp, purpose, recipientName });
      } else {
        return await this.sendSmsOTP({ phone: identifier, otp, purpose, recipientName });
      }
    } catch (error) {
      // Log error safely without crashing the business flow
      console.error(`⚠️  [NotificationService] OTP delivery failure for ${identifier}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send Email OTP via MSG91 Email Service (v5 API)
   */
  async sendMsg91EmailOTP({ email, otp, purpose = 'registration', recipientName = 'Valued Customer' }) {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_EMAIL_TEMPLATE_ID || process.env.MSG91_TEMPLATE_ID;

    if (!authKey || !templateId) {
      throw new Error('MSG91 Auth Key or Email Template ID not configured');
    }

    const payload = {
      recipients: [
        {
          to: [
            {
              name: recipientName,
              email: email.trim()
            }
          ],
          variables: {
            OTP: otp,
            otp: otp,
            code: otp,
            name: recipientName,
            NAME: recipientName,
            company_name: 'Chandra Naturals',
            purpose: String(purpose).replace('_', ' ')
          }
        }
      ],
      from: {
        name: process.env.MSG91_EMAIL_FROM_NAME || 'Chandra Naturals',
        email: process.env.MSG91_EMAIL_FROM_EMAIL || 'hello@chandranaturals.com'
      },
      template_id: templateId
    };

    if (process.env.MSG91_EMAIL_DOMAIN) {
      payload.domain = process.env.MSG91_EMAIL_DOMAIN;
    }

    const response = await fetch('https://control.msg91.com/api/v5/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authkey: authKey
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || (data.status && data.status === 'error')) {
      throw new Error(data.message || `MSG91 Email API responded with status ${response.status}`);
    }

    console.log(`✉️  [MSG91 Email] Verification OTP sent successfully to ${email} (Template: ${templateId})`);
    return { success: true, channel: 'msg91_email', data };
  }

  /**
   * Send Email OTP - Prioritizes SMTP (Gmail/Brevo/Mailgun) with fallback to MSG91/Dev Simulator
   */
  async sendEmailOTP({ email, otp, purpose = 'registration', recipientName = 'Valued Customer' }) {
    const transporter = this.getEmailTransporter();

    // 1. Primary: Nodemailer SMTP if configured (e.g., Gmail App Password)
    if (transporter) {
      const subjectMap = {
        registration: 'Verify your Chandra Naturals Account',
        forgot_password: 'Password Reset Code - Chandra Naturals',
        login: 'Your Login Verification Code - Chandra Naturals'
      };

      const subject = subjectMap[purpose] || 'Your Chandra Naturals Verification Code';

      const htmlContent = `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #1F3623; color: #FAF7F0; border-radius: 16px; border: 1px solid #C9A24E;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #C9A24E; margin: 0; font-size: 28px; letter-spacing: 1px;">Chandra Naturals</h1>
          <p style="color: #E8D9AE; font-size: 13px; margin-top: 4px;">Tradition, preserved in every jar.</p>
        </div>
        <div style="background-color: #16281A; padding: 24px; border-radius: 12px; border: 1px solid rgba(201, 162, 78, 0.3);">
          <p style="font-size: 16px; margin-top: 0;">Namaste ${recipientName},</p>
          <p style="font-size: 14px; line-height: 1.6; color: #FAF7F0;">
            Use the following 6-digit one-time verification code to complete your ${purpose.replace('_', ' ')}.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; padding: 14px 32px; background-color: #C9A24E; color: #16281A; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 8px; font-family: monospace;">
              ${otp}
            </div>
          </div>
          <p style="font-size: 12px; color: #E8D9AE; text-align: center;">
            ⏳ This code expires in 10 minutes. Do not share this code with anyone.
          </p>
        </div>
        <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #8F9E92;">
          <p>Small-batch handcrafted goodness · Made with pure ingredients you can trust</p>
          <p>&copy; ${new Date().getFullYear()} Chandra Naturals. All rights reserved.</p>
        </div>
      </div>
    `;

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || '"Chandra Naturals" <hello@chandranaturals.com>',
          to: email,
          subject,
          html: htmlContent
        });
        console.log(`✉️  [Email SMTP] Verification OTP sent successfully to ${email}`);
        return { success: true, channel: 'email_smtp' };
      } catch (smtpErr) {
        console.warn(`⚠️  [Email SMTP] Delivery failed: ${smtpErr.message}. Checking backup channels...`);
      }
    }

    // 2. Secondary fallback: MSG91 Email Service if credentials are provided
    const hasMsg91 = Boolean(
      process.env.MSG91_AUTH_KEY &&
      (process.env.MSG91_EMAIL_TEMPLATE_ID || process.env.MSG91_TEMPLATE_ID)
    );

    if (hasMsg91) {
      try {
        return await this.sendMsg91EmailOTP({ email, otp, purpose, recipientName });
      } catch (msg91Error) {
        console.warn(`⚠️  [MSG91 Email] Delivery attempt failed: ${msg91Error.message}. Falling back to dev logger...`);
      }
    }

    // 3. Fallback: Local dev simulation logger
    const subjectMap = {
      registration: 'Verify your Chandra Naturals Account',
      forgot_password: 'Password Reset Code - Chandra Naturals',
      login: 'Your Login Verification Code - Chandra Naturals'
    };
    const subject = subjectMap[purpose] || 'Your Chandra Naturals Verification Code';
    console.log(`✉️  [DEV-MODE EMAIL SIMULATOR] To: ${email} | Subject: ${subject} | OTP: [${otp}]`);
    return { success: true, channel: 'email_dev_log' };
  }

  /**
   * Send SMS OTP via MSG91
   */
  async sendSmsOTP({ phone, otp, purpose, recipientName }) {
    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;

    if (authKey && templateId) {
      try {
        const payload = {
          template_id: templateId,
          short_url: '0',
          recipients: [
            {
              mobiles: `91${cleanPhone}`,
              otp: otp,
              name: recipientName
            }
          ]
        };

        const response = await fetch('https://control.msg91.com/api/v5/flow/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authkey: authKey
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log(`📱 [MSG91] SMS response for ${cleanPhone}:`, data.type || 'processed');
        return { success: true, channel: 'sms' };
      } catch (err) {
        console.error(`❌ [MSG91] Error sending SMS:`, err.message);
        throw err;
      }
    } else {
      // In development mode or when MSG91 credentials aren't set
      console.log(`📱 [DEV-MODE SMS SIMULATOR] To: +91${cleanPhone} | Purpose: ${purpose} | OTP: [${otp}]`);
      return { success: true, channel: 'sms_dev_log' };
    }
  }

  /**
   * Send Order Confirmation Notification
   */
  async sendOrderConfirmation({ order, customer }) {
    try {
      const subject = `Order Confirmed #${order.orderNumber} - Chandra Naturals`;
      console.log(`📦 [Notification] Order Confirmation generated for Order #${order.orderNumber} to ${customer.email || customer.phone}`);

      const transporter = this.getEmailTransporter();
      if (customer.email && transporter) {
        const itemsListHtml = order.items
          .map(
            item => `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #334e38;">${item.name} (${item.weight || ''})</td>
              <td style="padding: 8px; border-bottom: 1px solid #334e38; text-align: center;">x${item.quantity}</td>
              <td style="padding: 8px; border-bottom: 1px solid #334e38; text-align: right;">₹${item.price * item.quantity}</td>
            </tr>`
          )
          .join('');

        const html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #1F3623; color: #FAF7F0; padding: 24px; border-radius: 16px;">
            <h2 style="color: #C9A24E;">🌿 Thank you for your order!</h2>
            <p>Your order <strong>#${order.orderNumber}</strong> has been received and is being hand-packed with care.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
              <thead>
                <tr style="background: #16281A; color: #C9A24E;">
                  <th style="padding: 8px; text-align: left;">Item</th>
                  <th style="padding: 8px; text-align: center;">Qty</th>
                  <th style="padding: 8px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>${itemsListHtml}</tbody>
            </table>
            <p style="text-align: right; font-size: 16px; font-weight: bold; color: #C9A24E;">
              Total: ₹${order.total}
            </p>
          </div>
        `;

        await transporter.sendMail({
          from: process.env.EMAIL_FROM || '"Chandra Naturals" <hello@chandranaturals.com>',
          to: customer.email,
          subject,
          html
        });
      }
      return { success: true };
    } catch (err) {
      console.error('⚠️  Failed to dispatch order confirmation notification:', err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Send Order Dispatch / Consignment Tracking Notification
   */
  async sendOrderDispatched({ order, customer = {}, carrier, trackingNumber }) {
    try {
      const subject = `Your Order #${order.orderNumber} Has Been Dispatched! 🚚 - Chandra Naturals`;
      console.log(`🚚 [Notification] Dispatch email prepared for Order #${order.orderNumber} via ${carrier || 'Courier'}`);

      const transporter = this.getEmailTransporter();
      const recipientEmail = customer.email || order.shippingAddress?.email;

      if (recipientEmail && transporter) {
        const trackingLink = trackingNumber
          ? `https://www.google.com/search?q=${encodeURIComponent((carrier || '') + ' tracking ' + trackingNumber)}`
          : 'https://chandranaturals.com/account?tab=orders';

        const html = `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #1F3623; color: #FAF7F0; padding: 28px; border-radius: 16px; border: 1px solid #C9A24E;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #C9A24E; margin: 0; font-size: 26px;">Chandra Naturals</h1>
              <p style="color: #E8D9AE; font-size: 13px; margin-top: 4px;">Small-Batch Authentic Goodness</p>
            </div>
            <div style="background-color: #16281A; padding: 24px; border-radius: 12px; border: 1px solid rgba(201, 162, 78, 0.3);">
              <h2 style="color: #C9A24E; margin-top: 0; font-size: 20px;">🚚 Your Package is on the Way!</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #FAF7F0;">
                Namaste <strong>${customer.name || order.shippingAddress?.fullName || 'Valued Customer'}</strong>,<br/>
                Great news! Your handcrafted order <strong>#${order.orderNumber}</strong> has been freshly prepared and handed over to our courier partner.
              </p>
              
              <div style="background: rgba(201, 162, 78, 0.1); border-left: 4px solid #C9A24E; padding: 14px; margin: 20px 0; border-radius: 6px;">
                <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Courier Partner:</strong> ${carrier || 'Express Courier'}</p>
                ${trackingNumber ? `<p style="margin: 0; font-size: 13px;"><strong>AWB / Tracking No:</strong> <span style="font-family: monospace; font-weight: bold; color: #E8D9AE;">${trackingNumber}</span></p>` : ''}
              </div>

              <div style="text-align: center; margin: 24px 0;">
                <a href="${trackingLink}" style="display: inline-block; padding: 12px 28px; background-color: #C9A24E; color: #16281A; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                  Track Your Consignment
                </a>
              </div>
              
              <p style="font-size: 12px; color: #E8D9AE; text-align: center; margin-bottom: 0;">
                Deliveries typically arrive within 3-5 business days.
              </p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: process.env.EMAIL_FROM || '"Chandra Naturals" <hello@chandranaturals.com>',
          to: recipientEmail,
          subject,
          html
        });
        console.log(`✉️  [Email SMTP] Dispatch notification delivered to ${recipientEmail}`);
      }
      return { success: true };
    } catch (err) {
      console.error('⚠️  Failed to dispatch order shipping notification:', err.message);
      return { success: false, error: err.message };
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
