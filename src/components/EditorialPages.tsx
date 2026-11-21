import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { FAQS, IMAGES, RITUAL_GUIDES } from '../data/catalog';
import { createSupportTicket } from '../services/firestoreService';
import { SafeImage } from './SafeImage';
import { ProductCard } from './ProductCard';

export const RitualGuidesPage: React.FC = () => {
  const { route, navigate, products } = useStore();
  const activeGuide = route.guideSlug
    ? RITUAL_GUIDES.find((g) => g.slug === route.guideSlug)
    : null;

  if (activeGuide) {
    const recommended = products.filter((p) => activeGuide.recommendedSlugs.includes(p.slug));
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-10">
        <button
          type="button"
          onClick={() => navigate({ page: 'guides' })}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#702F32] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Ritual Guides</span>
        </button>

        <header className="space-y-3">
          <p className="text-xs text-[#5C574F]">
            {activeGuide.category} · {activeGuide.readMinutes} min read
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#242320] leading-tight">
            {activeGuide.title}
          </h1>
          <p className="font-hi text-base text-[#B99357]">{activeGuide.titleHi}</p>
          <p className="text-base text-[#5C574F] leading-relaxed pt-2">{activeGuide.excerpt}</p>
        </header>

        <div className="aspect-[16/9] bg-[#F3EDE0] border border-[#E5DCCB] overflow-hidden">
          <SafeImage src={activeGuide.imageUrl} alt={activeGuide.title} className="w-full h-full object-cover" />
        </div>

        <section className="p-6 sm:p-8 bg-[#F3EDE0]/70 border border-[#E5DCCB] space-y-3">
          <h2 className="font-display text-2xl font-semibold text-[#242320]">Preparation Checklist</h2>
          <ul className="space-y-2 text-sm text-[#242320] list-disc pl-5">
            {activeGuide.preparationList.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-6">
          {activeGuide.steps.map((step) => (
            <div key={step.heading} className="pb-6 border-b border-[#E5DCCB] space-y-2">
              <h2 className="font-display text-2xl font-semibold text-[#242320]">{step.heading}</h2>
              <p className="text-sm sm:text-base text-[#5C574F] leading-relaxed">{step.detail}</p>
            </div>
          ))}
        </section>

        {recommended.length > 0 && (
          <section className="pt-4 space-y-6">
            <h2 className="font-display text-3xl font-semibold text-[#242320]">Recommended for This Ritual</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {recommended.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
      <div className="max-w-2xl space-y-3">
        <p className="text-xs tracking-[0.14em] text-[#702F32] font-medium">Ritual Guides & Journal</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#242320]">
          Clear, practical guidance for traditional Indian rituals
        </h1>
        <p className="text-sm sm:text-base text-[#5C574F] leading-relaxed">
          Written for modern households preparing daily worship, family kathas, housewarmings, and seasonal festivals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {RITUAL_GUIDES.map((guide) => (
          <article key={guide.slug} className="bg-white border border-[#E5DCCB] flex flex-col">
            <div className="aspect-[16/10] bg-[#F3EDE0] overflow-hidden">
              <SafeImage src={guide.imageUrl} alt={guide.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between gap-5">
              <div className="space-y-2">
                <p className="text-xs text-[#5C574F]">
                  {guide.category} · {guide.readMinutes} min read
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#242320] leading-snug">
                  {guide.title}
                </h2>
                <p className="font-hi text-xs text-[#B99357]">{guide.titleHi}</p>
                <p className="text-sm text-[#5C574F] leading-relaxed pt-1">{guide.excerpt}</p>
              </div>
              <button
                type="button"
                onClick={() => navigate({ page: 'guides', guideSlug: guide.slug })}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#702F32] hover:underline self-start"
              >
                <span>Read complete guide</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
};

export const AboutPage: React.FC = () => {
  const { navigate } = useStore();
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-14 lg:py-20 space-y-14">
      <div className="space-y-4 max-w-3xl">
        <p className="text-xs tracking-[0.14em] text-[#702F32] font-medium">About AKSHAT (अक्षत)</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#242320] leading-tight">
          Rooted in Tradition. Crafted for Today.
        </h1>
        <p className="text-base text-[#5C574F] leading-relaxed">
          In Sanskrit, <em>Akshat</em> means whole, unbroken, and enduring. We founded AKSHAT to bring dignity,
          transparency, and quiet modern design to Indian devotional essentials — making authentic pooja samagri and
          curated ritual kits accessible to every household without guesswork.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-5 aspect-[3/4] bg-[#F3EDE0] border border-[#E5DCCB] overflow-hidden">
          <SafeImage
            src={IMAGES.craftsmanship}
            alt="Artisan hand-finishing solid brass diya"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="md:col-span-7 space-y-6 text-sm sm:text-base text-[#5C574F] leading-relaxed">
          <h2 className="font-display text-3xl font-semibold text-[#242320]">What we set out to fix</h2>
          <p>
            Shopping for daily worship or a family ceremony often meant unlabelled packets with unknown dyes, missing
            samagri items discovered an hour before the priest arrived, and thin electroplated vessels that tarnished
            after one season.
          </p>
          <p>
            AKSHAT partners directly with regional makers: brass casters in Moradabad, coppersmiths in Pune’s Tambat
            Ali, bamboo-less dhoop workshops in Kannauj, and turmeric processors in Tamil Nadu. Every product carries
            exact net weights, declared ingredients, clear storage instructions, and transparent GST-inclusive pricing.
          </p>
          <button
            type="button"
            onClick={() => navigate({ page: 'shop' })}
            className="px-6 py-3 bg-[#702F32] text-[#FAF7F0] text-sm font-medium hover:bg-[#582225] transition-colors"
          >
            Explore the Catalog
          </button>
        </div>
      </div>
    </main>
  );
};

export const ContactPage: React.FC = () => {
  const { user, profile, showToast } = useStore();
  const [name, setName] = useState(profile?.displayName || user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || message.trim().length < 5) {
      showToast('Please complete all required fields.', 'error');
      return;
    }
    if (user) {
      await createSupportTicket({
        userId: user.uid,
        name,
        email,
        subject,
        message,
        orderNumber: orderNumber || undefined,
      });
    }
    setSent(true);
    showToast('Your message has been received by AKSHAT Care.', 'success');
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-14 lg:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-5">
          <p className="text-xs tracking-[0.14em] text-[#702F32] font-medium">Contact Us</p>
          <h1 className="font-display text-4xl font-semibold text-[#242320]">We are here to assist</h1>
          <p className="text-sm text-[#5C574F] leading-relaxed">
            Questions about ritual kit contents, order dispatch, temple bulk requirements, or wedding gifting hampers?
            Write to our care team directly.
          </p>
          <div className="pt-4 border-t border-[#E5DCCB] space-y-2 text-sm text-[#242320]">
            <p>Email: care@akshatrituals.in</p>
            <p>Hours: Monday – Saturday, 9:30 AM – 6:30 PM IST</p>
            <p>Fulfillment Studio: Pune, Maharashtra, India</p>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-[#E5DCCB] p-6 sm:p-8">
          {sent ? (
            <div className="space-y-3 py-8">
              <h2 className="font-display text-3xl font-semibold text-[#34483B]">Message Received</h2>
              <p className="text-sm text-[#5C574F]">
                Thank you for reaching out. Our customer care team responds within one business day.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="c-name" className="block text-xs font-medium mb-1">Full Name *</label>
                  <input id="c-name" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E5DCCB] text-sm" />
                </div>
                <div>
                  <label htmlFor="c-email" className="block text-xs font-medium mb-1">Email *</label>
                  <input id="c-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E5DCCB] text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="c-subject" className="block text-xs font-medium mb-1">Topic *</label>
                  <input id="c-subject" required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Order inquiry, bulk kits, product question..." className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E5DCCB] text-sm" />
                </div>
                <div>
                  <label htmlFor="c-order" className="block text-xs font-medium mb-1">Order Number (Optional)</label>
                  <input id="c-order" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="AKS-2611-XXXX" className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E5DCCB] text-sm" />
                </div>
              </div>
              <div>
                <label htmlFor="c-msg" className="block text-xs font-medium mb-1">Message *</label>
                <textarea id="c-msg" rows={5} required value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E5DCCB] text-sm" />
              </div>
              <button type="submit" className="px-6 py-3 bg-[#702F32] text-[#FAF7F0] text-sm font-medium hover:bg-[#582225] transition-colors">
                Send Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
};

export const FaqPage: React.FC = () => (
  <main className="max-w-4xl mx-auto px-4 sm:px-6 py-14 lg:py-20 space-y-10">
    <div className="space-y-3">
      <p className="text-xs tracking-[0.14em] text-[#702F32] font-medium">Help Centre</p>
      <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#242320]">Frequently Asked Questions</h1>
    </div>
    <div className="divide-y divide-[#E5DCCB] border-y border-[#E5DCCB]">
      {FAQS.map((item) => (
        <div key={item.question} className="py-6 space-y-2">
          <h2 className="font-display text-2xl font-semibold text-[#242320]">{item.question}</h2>
          <p className="text-sm sm:text-base text-[#5C574F] leading-relaxed">{item.answer}</p>
        </div>
      ))}
    </div>
  </main>
);

export const PolicyPage: React.FC<{
  type: 'shipping-policy' | 'returns-policy' | 'privacy-policy' | 'terms';
}> = ({ type }) => {
  const copy = {
    'shipping-policy': {
      eyebrow: 'Policies',
      title: 'Shipping Policy',
      sections: [
        {
          h: 'Dispatch & Delivery Timelines',
          p: 'Orders placed before 2:00 PM IST on business days are packed and handed to courier partners within 24 hours. Metro PIN codes typically deliver in 2–3 business days; regional PIN codes in 3–5 business days; remote regions in 6–8 business days.',
        },
        {
          h: 'Shipping Charges',
          p: 'Standard delivery across India is complimentary for orders of ₹799 and above (after discounts). Orders below ₹799 incur a flat ₹79 standard shipping fee. Express Air priority dispatch is available at ₹149.',
        },
        {
          h: 'Protective Packaging',
          p: 'Glass apothecary jars, brassware, and complete ritual boxes are cushioned in recyclable fluted kraft sleeves and inspected before dispatch.',
        },
      ],
    },
    'returns-policy': {
      eyebrow: 'Policies',
      title: 'Returns & Refunds Policy',
      sections: [
        {
          h: '7-Day Unopened Return Window',
          p: 'Unused devotional accessories (brass diyas, pooja thalis, copper kalash, bells) and factory-sealed pooja kits may be returned within 7 days of delivery.',
        },
        {
          h: 'Transit Damage or Missing Items',
          p: 'If a jar breaks in transit or any listed kit item is missing, submit a return request from your Customer Account within 48 hours of delivery for an immediate replacement or full refund.',
        },
        {
          h: 'Refund Processing',
          p: 'Approved prepaid refunds are initiated to your original UPI, card, or bank source within 3–5 business days. COD order refunds are transferred via UPI or NEFT.',
        },
      ],
    },
    'privacy-policy': {
      eyebrow: 'Policies',
      title: 'Privacy Policy',
      sections: [
        {
          h: 'Data Minimization & Isolation',
          p: 'AKSHAT collects only the contact, shipping, and order details required to fulfill your purchases and provide support. Personal profile records, saved addresses, and order histories are strictly scoped to your authenticated account.',
        },
        {
          h: 'Payment Security',
          p: 'We do not store full card numbers or UPI PINs. Online payments are designed to flow through PCI-DSS compliant Indian payment gateways.',
        },
        {
          h: 'Communication Preferences',
          p: 'Transactional order and shipment updates are sent strictly for active orders. Seasonal festival newsletters are opt-in only.',
        },
      ],
    },
    terms: {
      eyebrow: 'Policies',
      title: 'Terms & Conditions',
      sections: [
        {
          h: 'Transparent Pricing & Taxes',
          p: 'All prices on AKSHAT are quoted in Indian Rupees (INR) and represent Maximum Retail Price inclusive of applicable GST.',
        },
        {
          h: 'Handcrafted Variations',
          p: 'Solid brass and hand-hammered copper items crafted by Indian artisans may show subtle natural variations in finish and weight (±5%), which reflect authentic handwork rather than defects.',
        },
        {
          h: 'Order Cancellations',
          p: 'Confirmed orders may be cancelled directly from your Customer Account prior to packing and courier handover.',
        },
      ],
    },
  }[type];

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-14 lg:py-20 space-y-10">
      <div className="space-y-2">
        <p className="text-xs tracking-[0.14em] text-[#702F32] font-medium">{copy.eyebrow}</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#242320]">{copy.title}</h1>
      </div>
      <div className="space-y-8 border-t border-[#E5DCCB] pt-8">
        {copy.sections.map((s) => (
          <section key={s.h} className="space-y-2">
            <h2 className="font-display text-2xl font-semibold text-[#242320]">{s.h}</h2>
            <p className="text-sm sm:text-base text-[#5C574F] leading-relaxed">{s.p}</p>
          </section>
        ))}
      </div>
    </main>
  );
};
