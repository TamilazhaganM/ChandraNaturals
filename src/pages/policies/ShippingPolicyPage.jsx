import React, { useEffect } from 'react';
import { PolicyLayout } from './PolicyLayout';
import { Truck, PackageCheck, Clock, MapPin, ShieldAlert, Sparkles } from 'lucide-react';
import { siteConfig } from '../../config/siteConfig';

export const ShippingPolicyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PolicyLayout
      title="Shipping & Delivery Policy"
      subtitle="How we prepare, cushion, and safely deliver your fresh small-batch pantry orders right to your doorstep."
      lastUpdated="September 2026"
    >
      <div className="space-y-8">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-cream-warm flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-gold-antique shrink-0" />
            1. Fresh Handcrafting & Dispatch Schedule
          </h2>
          <p>
            Because we do not maintain aged warehouse inventories, every jar of thokku, bilona ghee, and stone-ground mix is prepared in limited artisan batches.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-forest-ink/60 border border-gold-antique/25 space-y-1">
              <span className="text-xs font-bold text-gold-antique uppercase tracking-wider font-sans">Kitchen Preparation Time</span>
              <p className="font-serif text-lg font-bold text-cream-warm">1 to 2 Business Days</p>
              <p className="text-xs text-cream-warm/75">Simmering, cooling, quality checks, and vacuum sealing.</p>
            </div>
            <div className="p-4 rounded-2xl bg-forest-ink/60 border border-gold-antique/25 space-y-1">
              <span className="text-xs font-bold text-gold-antique uppercase tracking-wider font-sans">Pan-India Transit Time</span>
              <p className="font-serif text-lg font-bold text-cream-warm">5 to 7 Working Days</p>
              <p className="text-xs text-cream-warm/75">Delivered via premier air and surface express couriers.</p>
            </div>
          </div>
          <p className="text-xs text-cream-warm/75 pt-1">
            *Orders placed on Sundays or national public holidays are queued for fresh small-batch preparation on the following business day.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-cream-warm flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-gold-antique shrink-0" />
            2. Shipping Rates & Free Delivery Tiers
          </h2>
          <div className="overflow-hidden rounded-2xl border border-gold-antique/25">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-forest-ink/80 text-gold-antique font-sans uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Order Value Tier</th>
                  <th className="p-3.5">Destination</th>
                  <th className="p-3.5">Shipping Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-antique/15 text-cream-warm/85">
                <tr>
                  <td className="p-3.5 font-semibold">Orders Above ₹3,000</td>
                  <td className="p-3.5">All Over India (Any PIN Code)</td>
                  <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400 uppercase">FREE SHIPPING</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold">Orders Above ₹600 (Local TN)</td>
                  <td className="p-3.5">Chennai & Madurai Metro Zones</td>
                  <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400 uppercase">FREE LOCAL DELIVERY</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold">Standard Orders (Below ₹3,000)</td>
                  <td className="p-3.5">Pan-India Courier Network</td>
                  <td className="p-3.5 font-semibold">Flat ₹99 (includes glass protection)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-cream-warm flex items-center gap-2.5">
            <PackageCheck className="w-5 h-5 text-gold-antique shrink-0" />
            3. Protective Artisanal Packaging
          </h2>
          <p>
            Glass jars require meticulous transit care. We utilize multi-layer corrugated outer boxes, cushioned shock-absorbing honeycomb wrapping, and moisture-resistant tamper seals. Every consignment is sealed with an FSSAI-compliant tamper-evident guarantee strip.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-cream-warm flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-gold-antique shrink-0" />
            4. Real-Time Order Tracking
          </h2>
          <p>
            As soon as your parcel is handed over to our logistics partner (Delhivery, BlueDart, DTDC, or Speed Post), you will receive an automated dispatch notification on WhatsApp and Email containing:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-cream-warm/80">
            <li>The Courier Partner Name (e.g., Delhivery Surface / BlueDart Express).</li>
            <li>Your unique Air Waybill (AWB) consignment tracking number.</li>
            <li>A direct link to monitor the live transit journey of your parcel.</li>
          </ul>
          <p>
            You can also check real-time progress anytime through your <a href="/account?tab=orders" className="text-gold-antique hover:underline font-semibold">My Account &gt; Orders</a> page.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-cream-warm flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-gold-antique shrink-0" />
            5. Delivery Attempts & Unserviceable Locations
          </h2>
          <p>
            Our delivery partners will attempt delivery up to <strong>three (3) times</strong>. If the recipient is unavailable, unreachable on phone, or refuses delivery without cause, the parcel will be returned to our dispatch center. Please ensure your mobile phone number and complete street address with landmarks are accurate during checkout.
          </p>
        </section>

      </div>
    </PolicyLayout>
  );
};

export default ShippingPolicyPage;
