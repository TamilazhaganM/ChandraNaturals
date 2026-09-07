import React, { useEffect } from 'react';
import { PolicyLayout } from './PolicyLayout';
import { FileText, Sparkles, Scale, AlertCircle } from 'lucide-react';
import { siteConfig } from '../../config/siteConfig';

export const TermsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PolicyLayout
      title="Terms & Conditions"
      subtitle="The contractual guidelines governing your browsing, orders, and interactions with Chandra Naturals."
      lastUpdated="September 2026"
    >
      <div className="space-y-8">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-cream-warm flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-gold-antique shrink-0" />
            1. Agreement to Terms
          </h2>
          <p>
            Welcome to <strong>{siteConfig.brandName}</strong>. By accessing our website, browsing our product catalog, registering an account, or placing an order, you agree to be bound by these Terms and Conditions and our Privacy Policy.
          </p>
          <p>
            If you do not agree with any part of these terms, please refrain from using our website or submitting orders. These terms constitute a legally binding electronic agreement under the <em>Information Technology Act, 2000</em>.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-cream-warm flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-gold-antique shrink-0" />
            2. Artisanal Character & Natural Variations
          </h2>
          <div className="p-4 rounded-2xl bg-forest-ink/60 border border-gold-antique/25 space-y-2">
            <p className="font-semibold text-gold-antique">
              The Pure Nature of Small-Batch Foods
            </p>
            <p className="text-xs sm:text-sm text-cream-warm/80">
              Our thokkus, ghee, spice mixes, and health flours are prepared in limited artisanal batches without artificial stabilizers, synthetic food colors, or chemical emulsifiers. Slight natural variations in color, texture, viscosity, or aroma across harvest seasons are genuine hallmarks of authentic, traditional food preparation.
            </p>
          </div>
          <p>
            Photographs and illustrations displayed on the website are representative of our handcrafted products; packaging presentation or bottle labels may receive minor updates to reflect seasonal harvest details.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-cream-warm">
            3. Account Registration & Security
          </h2>
          <p>
            When registering an account with {siteConfig.brandName}, you are responsible for maintaining the confidentiality of your login credentials and one-time password (OTP) verifications. You agree to provide true, accurate, and current contact information, and promptly update your profile if your mobile phone number or shipping destination changes.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-cream-warm">
            4. Pricing & Payments
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-cream-warm/80">
            <li>All prices listed on the website are in Indian Rupees (INR ₹) and are inclusive of applicable Goods and Services Tax (GST).</li>
            <li>We accept secure online payments through Razorpay (UPI, Credit/Debit Cards, Net Banking, and Verified Wallets) as well as assisted kitchen ordering via WhatsApp.</li>
            <li>Prices are subject to revision without prior notice to reflect changes in raw ingredient farm prices; confirmed orders will be fulfilled at the price active during checkout.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-cream-warm flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-gold-antique shrink-0" />
            5. Food Safety, Allergens & Storage
          </h2>
          <p>
            Our pantry products comply with the standards prescribed by the <strong>Food Safety and Standards Authority of India (FSSAI)</strong> under License No. <code>{siteConfig.fssaiNumber}</code>.
          </p>
          <p>
            Customers are advised to review product ingredient lists carefully for potential personal food allergens (e.g., sesame seeds/gingelly oil, mustard, garlic, or pulses). Since our foods contain no chemical preservatives, please follow the stated storage instructions: <em>always use a completely dry, clean spoon and store jars in a cool, dry place away from direct heat or humidity</em>.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-cream-warm flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-gold-antique shrink-0" />
            6. Limitation of Liability & Governing Law
          </h2>
          <p>
            In no event shall {siteConfig.brandName}, its founders, chefs, or affiliates be liable for indirect, punitive, or consequential damages arising from improper storage, delayed courier delivery beyond our reasonable control, or transit disruptions caused by force majeure events. Our maximum aggregate liability shall not exceed the monetary amount paid by you for the specific order in question.
          </p>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising in connection with our services shall be subject to the exclusive jurisdiction of the competent courts in <strong>Madurai / Chennai, Tamil Nadu</strong>.
          </p>
        </section>

      </div>
    </PolicyLayout>
  );
};

export default TermsPage;
