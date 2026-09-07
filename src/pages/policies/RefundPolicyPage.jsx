import React, { useEffect } from 'react';
import { PolicyLayout } from './PolicyLayout';
import { RotateCcw, AlertTriangle, CheckCircle2, Clock, HelpCircle, ShieldCheck } from 'lucide-react';
import { siteConfig } from '../../config/siteConfig';

export const RefundPolicyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PolicyLayout
      title="Cancellation & Refund Policy"
      subtitle="Transparent protocols for cancellations, transit damage claims, and hassle-free refunds."
      lastUpdated="September 2026"
    >
      <div className="space-y-8">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-cream-warm flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-gold-antique shrink-0" />
            1. Perishable Food Safety & Returns
          </h2>
          <p>
            Because <strong>{siteConfig.brandName}</strong> supplies freshly prepared, preservative-free artisanal food items (thokkus, bilona ghee, and grain health mixes), <strong>we cannot accept physical returns of opened or delivered food products</strong> due to strict FSSAI safety and hygiene compliance.
          </p>
          <div className="p-4 rounded-2xl bg-forest-ink/60 border border-gold-antique/25 space-y-2">
            <p className="font-semibold text-gold-antique">
              100% Quality & Arrival Guarantee
            </p>
            <p className="text-xs sm:text-sm text-cream-warm/80">
              While food items cannot be physically sent back, your satisfaction is unconditionally backed by our <strong>Damaged or Incorrect Item Replacement Guarantee</strong>. If your parcel arrives broken, leaking, defective, or incorrect, we will issue an immediate free replacement or full refund.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-cream-warm flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-gold-antique shrink-0" />
            2. Transit Damage & Defective Jar Claims
          </h2>
          <p>
            In the rare event that a glass jar breaks or the tamper-evident seal is compromised during courier handling:
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-cream-warm/80">
            <li>
              <strong>Notify Us Within 48 Hours:</strong> Please report the issue within 48 hours of parcel delivery by sending an email to <a href={`mailto:${siteConfig.supportEmail}`} className="text-gold-antique hover:underline">{siteConfig.supportEmail}</a> or WhatsApping our kitchen helpline at <strong>{siteConfig.phoneDisplay}</strong>.
            </li>
            <li>
              <strong>Attach Photographs/Video:</strong> Include a clear photograph or unboxing video displaying the damaged jar, outer box shipping label, and the issue.
            </li>
            <li>
              <strong>Instant Resolution:</strong> Upon quick review, we will either dispatch an express replacement jar at zero extra charge, or issue a 100% refund to your original payment method.
            </li>
          </ol>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-cream-warm flex items-center gap-2.5">
            <RotateCcw className="w-5 h-5 text-gold-antique shrink-0" />
            3. Order Cancellations
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-cream-warm/80">
            <li>
              <strong>Before Dispatch:</strong> You may cancel your order at any time before it has been handed over to the courier partner by visiting your <a href="/account?tab=orders" className="text-gold-antique hover:underline">My Account &gt; Orders</a> page or writing to our kitchen on WhatsApp. A full refund will be initiated immediately.
            </li>
            <li>
              <strong>After Dispatch:</strong> Once a consignment is in transit with the courier, orders cannot be cancelled mid-route because fresh food batches cannot be repurposed.
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-cream-warm flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-gold-antique shrink-0" />
            4. Refund Processing Timelines
          </h2>
          <p>
            Once an approved refund is initiated:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-forest-ink/60 border border-gold-antique/25 space-y-1">
              <span className="text-xs font-bold text-gold-antique uppercase tracking-wider font-sans">UPI / Net Banking Refunds</span>
              <p className="font-serif text-base font-bold text-cream-warm">24 to 48 Hours</p>
              <p className="text-xs text-cream-warm/75">Credited directly to the originating bank account/VPA.</p>
            </div>
            <div className="p-4 rounded-2xl bg-forest-ink/60 border border-gold-antique/25 space-y-1">
              <span className="text-xs font-bold text-gold-antique uppercase tracking-wider font-sans">Credit / Debit Card Refunds</span>
              <p className="font-serif text-base font-bold text-cream-warm">5 to 7 Business Days</p>
              <p className="text-xs text-cream-warm/75">Processed through Razorpay per standard banking cycles.</p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-cream-warm flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-gold-antique shrink-0" />
            5. Incorrect Item Received
          </h2>
          <p>
            If you receive an item different from what was ordered (e.g. Garlic Pepper Thokku instead of Tomato Mix), notify us with a photograph within 48 hours. We will rush the correct fresh item to you immediately at no extra cost.
          </p>
        </section>

      </div>
    </PolicyLayout>
  );
};

export default RefundPolicyPage;
