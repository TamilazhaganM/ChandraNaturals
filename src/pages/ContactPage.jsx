import React, { useState } from 'react';
import { siteConfig } from '../config/siteConfig';
import { MapPin, Phone, Mail, MessageSquare, Clock, Send, CheckCircle2, ShieldCheck, HelpCircle, ChevronDown, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Order & Product Query',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) return;

    // Trigger WhatsApp inquiry URL
    const cleanNumber = siteConfig.whatsappNumber.replace(/[^0-9]/g, '');
    let msg = `🌿 *Inquiry via Website Contact Form — ${siteConfig.brandName}*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `• *Name:* ${formData.name}\n`;
    msg += `• *Phone:* ${formData.phone}\n`;
    if (formData.email) msg += `• *Email:* ${formData.email}\n`;
    msg += `• *Subject:* ${formData.subject}\n`;
    msg += `• *Message:* ${formData.message}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;

    const encoded = encodeURIComponent(msg);
    const waUrl = `https://wa.me/${cleanNumber}?text=${encoded}`;

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#C9A24E', '#E8D9AE', '#4CAF50']
      });
    } catch {}

    setSubmitted(true);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const faqs = [
    {
      q: "How long does delivery take?",
      a: "Orders within Chennai and Tamil Nadu are dispatched within 24 hours and delivered in 1-2 business days. Pan-India shipping takes 3-5 business days."
    },
    {
      q: "Are preservatives used in your thokku and ghee?",
      a: "No artificial chemical preservatives (like sodium benzoate or INS 211) are used. Our thokkus are naturally preserved using cold-pressed gingelly oil, rock salt, and tamarind."
    },
    {
      q: "Do you accept custom bulk or wedding gift orders?",
      a: "Yes! We prepare customized heritage gift hampers and micro-batch wedding favor jars. Please contact us on WhatsApp with your requirements."
    },
    {
      q: "How should I store the thokku once opened?",
      a: "Always use a clean, dry spoon. Ensure the top layer of oil remains lightly coated over the thokku. We recommend refrigerating after breaking the seal."
    }
  ];

  return (
    <div className="min-h-screen pt-28 pb-24 bg-botanical-mesh font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Page Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="font-caveat text-2xl sm:text-3xl text-gold-antique font-semibold block">
            We are here to assist you
          </span>
          <h1 className="font-fraunces text-4xl sm:text-5xl font-bold text-cream-warm">
            Contact Our Kitchen & Team
          </h1>
          <p className="font-sans text-sm sm:text-base text-cream-warm/80 leading-relaxed max-w-xl mx-auto">
            Have questions about ingredients, orders, or custom hampers? Reach out directly via WhatsApp, phone, or send us a message below.
          </p>
        </div>

        {/* 2-Column Grid: Contact Form (Left) & Direct Channels (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Interactive Contact Form (7 Cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-forest-deep border border-gold-antique/30 shadow-2xl space-y-6">
            <div className="space-y-1 border-b border-gold-antique/20 pb-4">
              <h2 className="font-fraunces text-2xl font-bold text-cream-warm">
                Send Us a Direct Message
              </h2>
              <p className="text-xs sm:text-sm text-cream-warm/75">
                Fill in your details and we will respond on WhatsApp or email promptly.
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-10 space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center mx-auto border border-[#25D366]/40">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="font-fraunces text-2xl font-bold text-cream-warm">
                  Message Sent to WhatsApp!
                </h3>
                <p className="text-xs sm:text-sm text-cream-warm/80 max-w-md mx-auto">
                  Thank you for reaching out to Chandra Naturals. Our team will review your inquiry and get back to you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-xl bg-gold-antique text-forest-ink font-bold text-xs uppercase tracking-wider font-sans cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-cream-warm">
                      Your Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/30 focus:border-gold-antique focus:outline-none text-cream-warm text-xs sm:text-sm transition-colors"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-cream-warm">
                      WhatsApp Phone Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/30 focus:border-gold-antique focus:outline-none text-cream-warm text-xs sm:text-sm transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-cream-warm">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. priya@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/30 focus:border-gold-antique focus:outline-none text-cream-warm text-xs sm:text-sm transition-colors"
                    />
                  </div>

                  {/* Subject */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-cream-warm">
                      Inquiry Topic
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/30 focus:border-gold-antique focus:outline-none text-cream-warm text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      <option value="Order & Product Query">Order & Product Query</option>
                      <option value="Bulk / Wedding Gifting">Bulk / Wedding Gifting</option>
                      <option value="Ingredients & Dietary Info">Ingredients & Dietary Info</option>
                      <option value="Delivery Tracking">Delivery Tracking</option>
                      <option value="Other Inquiries">Other Inquiries</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-cream-warm">
                    Your Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us what you are looking for or any questions you have..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/30 focus:border-gold-antique focus:outline-none text-cream-warm text-xs sm:text-sm transition-colors resize-none"
                  />
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-gold-antique hover:bg-gold-champagne text-forest-ink font-sans font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-gold-glow flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 fill-forest-ink" />
                  <span>Send Message via WhatsApp</span>
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-cream-warm/70 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-antique" />
                  <span>We reply promptly during operating hours (9:00 AM – 8:00 PM IST).</span>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Direct Reach Us Info & Cards (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Action WhatsApp Banner */}
            <div className="p-6 rounded-3xl bg-forest-deep border-2 border-dashed border-[#25D366]/50 shadow-xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center mx-auto border border-[#25D366]/40">
                <MessageSquare className="w-6 h-6 fill-[#25D366]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-fraunces text-xl font-bold text-cream-warm">
                  Direct WhatsApp Support
                </h3>
                <p className="text-xs text-cream-warm/80">
                  Instant response for orders, custom queries, and dispatch updates.
                </p>
              </div>
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent("Hello Chandra Naturals, I would like to connect with your team.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2 shadow-lg"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Chat Directly on WhatsApp</span>
              </a>
            </div>

            {/* Direct Cards */}
            <div className="p-6 rounded-3xl bg-forest-deep border border-gold-antique/30 shadow-xl space-y-5">
              <h3 className="font-fraunces text-lg font-bold text-cream-warm border-b border-gold-antique/20 pb-3">
                Kitchen & Office Locations
              </h3>

              <div className="space-y-4 text-xs font-sans">
                {/* Address */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-gold-antique/15 text-gold-antique flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-cream-warm block text-sm font-semibold mb-0.5">Kitchen & Dispatch Hub</strong>
                    <p className="text-cream-warm/75 leading-relaxed">
                      Chandra Naturals Heritage Kitchens,<br />
                      Anna Nagar & TTK Road Corridor, Chennai, Tamil Nadu 600040<br />
                      <span className="text-[11px] text-gold-antique">Heritage Kitchens: Madurai & Chennai</span>
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-gold-antique/15 text-gold-antique flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-cream-warm block text-sm font-semibold mb-0.5">Phone Call Support</strong>
                    <a href={`tel:${siteConfig.whatsappNumber}`} className="text-gold-antique hover:underline font-mono text-xs">
                      {siteConfig.phoneDisplay}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-gold-antique/15 text-gold-antique flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-cream-warm block text-sm font-semibold mb-0.5">Email Support</strong>
                    <a href={`mailto:${siteConfig.supportEmail}`} className="text-gold-antique hover:underline font-sans text-xs">
                      {siteConfig.supportEmail}
                    </a>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-gold-antique/15 text-gold-antique flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-cream-warm block text-sm font-semibold mb-0.5">Dispatch & Support Hours</strong>
                    <p className="text-cream-warm/75">
                      Monday to Saturday: 9:00 AM – 8:00 PM IST<br />
                      Sunday: 10:00 AM – 4:00 PM IST
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Section 3: Interactive Location & Map Section */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="font-caveat text-2xl sm:text-3xl text-gold-antique font-semibold block">
              Find Our Kitchen
            </span>
            <h2 className="font-fraunces text-3xl sm:text-4xl font-bold text-cream-warm">
              Regional Dispatch Hubs & Map
            </h2>
            <p className="text-xs sm:text-sm text-cream-warm/75">
              Operating across Tamil Nadu with primary dispatch centers in Chennai and Madurai.
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden border-2 border-gold-antique/40 shadow-2xl bg-forest-deep relative">
            {/* Embedded Google Map Iframe for Tamil Nadu / Chennai location */}
            <div className="aspect-[21/9] sm:aspect-[16/6] w-full min-h-[320px] relative">
              <iframe
                title="Chandra Naturals Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d124414.28678280658!2d80.14725354999999!3d13.0826802!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5265ea4f7d3361%3A0x6e61a70b6863d433!2sChennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1709123456789!5m2!1sen!2sin"
                className="w-full h-full border-0 filter contrast-105 opacity-90"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              
              {/* Map Floating Location Card */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 max-w-xs p-4 rounded-2xl bg-forest-ink/95 backdrop-blur-md border border-gold-antique shadow-2xl text-xs space-y-2 hidden sm:block">
                <div className="flex items-center gap-2 text-gold-antique font-bold">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>Chandra Naturals Central Hub</span>
                </div>
                <p className="text-cream-warm/80 text-[11px] leading-relaxed">
                  Fast, fresh dispatch across Chennai, Madurai, Coimbatore, Bangalore, and all Indian states.
                </p>
                <div className="pt-1 flex items-center justify-between text-[10px] text-gold-antique border-t border-gold-antique/20 font-semibold">
                  <span>FSSAI Lic. #{siteConfig.fssaiNumber.slice(0, 7)}</span>
                  <span>9AM - 8PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Quick FAQs Accordion */}
        <div className="max-w-4xl mx-auto space-y-8 pt-6">
          <div className="text-center space-y-2">
            <span className="font-caveat text-2xl text-gold-antique font-semibold block">
              Quick Answers
            </span>
            <h2 className="font-fraunces text-3xl font-bold text-cream-warm">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-forest-deep border border-gold-antique/30 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-fraunces text-base sm:text-lg font-bold text-cream-warm hover:text-gold-antique transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gold-antique transition-transform duration-300 flex-shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm font-sans text-cream-warm/80 leading-relaxed border-t border-gold-antique/15 animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
