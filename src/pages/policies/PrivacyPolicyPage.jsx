import React, { useEffect } from 'react';
import { PolicyLayout } from './PolicyLayout';
import { ShieldCheck, Lock, Eye, Server, RefreshCw } from 'lucide-react';
import { siteConfig } from '../../config/siteConfig';

export const PrivacyPolicyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PolicyLayout
      title="Privacy Policy"
      subtitle="How Chandra Naturals collects, protects, and respectfully manages your personal and transactional information."
      lastUpdated="September 2026"
    >
      <div className="space-y-8">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-cream-warm flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-gold-antique shrink-0" />
            1. Overview & Commitment
          </h2>
          <p>
            At <strong>{siteConfig.brandName}</strong> ("we," "our," or "us"), we value the trust you place in our traditional pantry and handcrafted food products. This Privacy Policy details how we collect, process, store, and safeguard your personal information when you visit our website, register an account, or order our stone-milled thokkus, ghee, and traditional pantry essentials.
          </p>
          <p>
            We operate in strict adherence to the <em>Information Technology Act, 2000</em>, the <em>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</em>, and applicable Indian data protection frameworks.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-cream-warm flex items-center gap-2.5">
            <Eye className="w-5 h-5 text-gold-antique shrink-0" />
            2. Personal Data We Collect
          </h2>
          <p>We only collect information necessary to fulfill your artisanal food orders and deliver an authentic shopping experience:</p>
          <ul className="list-disc pl-5 space-y-2 text-cream-warm/80">
            <li>
              <strong>Identity & Contact Information:</strong> Your full name, mobile telephone number, email address, and account login password (stored cryptographically as a one-way salted hash).
            </li>
            <li>
              <strong>Delivery & Shipping Details:</strong> Recipient name, complete postal delivery address, landmark, PIN code, and contact phone number.
            </li>
            <li>
              <strong>Verification & Authentication Data:</strong> Secure, one-time passwords (OTP) transmitted via SMS or email for account verification and password resets.
            </li>
            <li>
              <strong>Order & Transaction Records:</strong> Products purchased, quantities, order reference numbers, transactional receipts, and payment method choices.
            </li>
            <li>
              <strong>Technical Browsing Data:</strong> IP address, device type, browser information, and theme preferences (dark/light) to maintain website security and optimal performance.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-cream-warm flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-gold-antique shrink-0" />
            3. Payment Security & Card Data (Razorpay)
          </h2>
          <div className="p-4 rounded-2xl bg-forest-ink/60 border border-gold-antique/25 space-y-2">
            <p className="font-semibold text-gold-antique">
              Zero Storage of Sensitive Card Credentials
            </p>
            <p className="text-xs sm:text-sm text-cream-warm/80">
              {siteConfig.brandName} does <strong>NOT</strong> collect, view, or store your credit card numbers, debit card PINs, CVV codes, or net banking passwords on our servers. All digital payments are processed through <strong>Razorpay Software Private Limited</strong>, an RBI-licensed, PCI-DSS Level 1 compliant payment gateway.
            </p>
          </div>
          <p>
            When completing an online transaction, your payment details are encrypted in transit via Transport Layer Security (TLS 1.3 / HTTPS) directly between your device and the payment gateway.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-cream-warm flex items-center gap-2.5">
            <Server className="w-5 h-5 text-gold-antique shrink-0" />
            4. How We Use Your Information
          </h2>
          <p>Your data is processed strictly for legitimate operational purposes:</p>
          <ul className="list-disc pl-5 space-y-2 text-cream-warm/80">
            <li>Handcrafting, packaging, and dispatching your food orders accurately.</li>
            <li>Sending transactional notifications, tracking links, and order confirmations via WhatsApp, SMS, or Email.</li>
            <li>Responding to customer service inquiries and delivery assistance requests.</li>
            <li>Protecting against fraud, unauthorized account access, and security breaches.</li>
            <li>Complying with FSSAI recordkeeping obligations and statutory tax requirements.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-cream-warm flex items-center gap-2.5">
            <RefreshCw className="w-5 h-5 text-gold-antique shrink-0" />
            5. Sharing with Third-Party Logistics Partners
          </h2>
          <p>
            We will <strong>never sell, rent, or trade</strong> your personal information to third-party marketing companies. We only disclose essential shipping information (recipient name, address, contact phone) to reputable logistics partners (such as India Post, Delhivery, or BlueDart) solely for completing your physical delivery.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-cream-warm">
            6. Cookies & Local Session Storage
          </h2>
          <p>
            We use browser cookies and local storage tokens to retain items placed in your shopping cart, remember your dark or light mode theme preference, and maintain your secure login session. You may disable cookies in your browser settings, though doing so may prevent adding items to your cart or completing online checkout.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-cream-warm">
            7. Your Rights & Account Deletion
          </h2>
          <p>
            You have the right to access, update, or correct your personal data at any time through your <a href="/account" className="text-gold-antique hover:underline">My Account</a> portal. If you wish to permanently delete your customer account or request deletion of personal records, please write to our support team at <a href={`mailto:${siteConfig.supportEmail}`} className="text-gold-antique hover:underline">{siteConfig.supportEmail}</a>.
          </p>
        </section>

      </div>
    </PolicyLayout>
  );
};

export default PrivacyPolicyPage;
