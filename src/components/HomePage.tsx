import React, { useState } from 'react';
import { ArrowRight, Check, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { IMAGES, RITUAL_GUIDES } from '../data/catalog';
import { ProductCard } from './ProductCard';
import { SafeImage } from './SafeImage';
import { formatInr } from '../utils/commerce';
import { subscribeNewsletterDoc } from '../services/firestoreService';
import {
  HERITAGE_THEME_LIST,
  getHeritageThemeSpec,
  type HeritageThemeId,
} from '../utils/heritageThemes';
import {
  CarvedTempleBracket,
  CraftCornerOrnament,
  HeritageBorderFrieze,
  LotusMedallion,
  OrnamentalTapestryStrip,
  PaintedToranaCanopy,
  ParchmentMandalaCrest,
  RoyalGoldMandalaSvg,
  ScallopedHeroCorner,
} from './IndianMotifs';
import {
  BlurTextReveal,
  CulturalCraftMarquee,
  ShinyHeritageButton,
  SpotlightHeritageCard,
  TiltedHeritageArch,
} from './HeritageMotion';

export const HomePage: React.FC = () => {
  const {
    navigate,
    categories,
    products,
    homepageConfig,
    reviews,
    user,
    showToast,
    heritageTheme,
    setHeritageTheme,
  } = useStore();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);

  const activeThemeSpec = getHeritageThemeSpec(heritageTheme);
  const coreCategories = categories.filter((c) => c.isActive && !c.isFestival).slice(0, 4);
  const festivals = categories.filter((c) => c.isActive && c.isFestival);
  const bestsellers = products.filter((p) => p.isActive && p.isBestseller).slice(0, 4);
  const curatedKits = products.filter((p) => p.isActive && p.categorySlug === 'pooja-kits').slice(0, 3);
  const recentReviews = reviews.slice(0, 3);

  const activeTapestry =
    heritageTheme === 'madhubani'
      ? 'paisley'
      : heritageTheme === 'pichwai'
      ? 'peacock'
      : 'lotus';

  const handleSelectTheme = (id: HeritageThemeId) => {
    setHeritageTheme(id);
    const spec = getHeritageThemeSpec(id);
    showToast(`${spec.name} (${spec.nameHi}) cultural theme applied.`, 'neutral');
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newsletterEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    if (user) {
      await subscribeNewsletterDoc(user.uid, trimmed);
    }
    setNewsletterDone(true);
    setNewsletterEmail('');
    showToast('Subscribed to AKSHAT seasonal ritual notes.', 'success');
  };

  return (
    <main>
      {/* 1. Royal Split-Color Indian Heritage Hero (Deep Maroon + Deep Temple Olive + Center Golden Mandala) */}
      <section className="relative overflow-hidden border-b-2 border-[var(--theme-gold)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 relative min-h-[540px] lg:min-h-[600px]">
          {/* Center Golden Mandala bridging the Maroon & Temple Olive halves (desktop) */}
          <div
            aria-hidden="true"
            className="hidden lg:flex items-center justify-center pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <RoyalGoldMandalaSvg className="w-[340px] h-[340px] opacity-85 mandala-gentle-spin drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]" />
          </div>

          {/* Left Half: Deep Royal Maroon Sanctuary */}
          <div className="relative bg-[var(--theme-primary)] text-[#F6E9D2] px-6 sm:px-10 lg:px-14 xl:px-20 py-14 lg:py-20 flex flex-col justify-center overflow-hidden transition-colors duration-300">
            {/* Subtle vintage botanical watermark on dark maroon */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-screen"
              style={{
                backgroundImage: 'url("/assets/aistudio/image_4e24787a.png")',
                backgroundSize: '420px auto',
              }}
            />
            <ScallopedHeroCorner position="tl" />
            <ScallopedHeroCorner position="bl" />

            <div className="relative z-20 max-w-lg space-y-5 lg:pr-16">
              {/* Devanagari Shloka & Heritage Eyebrow */}
              <div className="space-y-1.5">
                <p className="font-hi-display text-xl sm:text-2xl text-[var(--theme-gold-bright)] tracking-wide">
                  {activeThemeSpec.shloka}
                </p>
                <p className="text-xs tracking-[0.14em] text-[#F6E9D2]/75 font-medium">
                  {homepageConfig.heroEyebrow}
                </p>
              </div>

              {/* Gleaming Antique Gold Editorial Headline (React Bits BlurTextReveal) */}
              <BlurTextReveal
                key={homepageConfig.heroHeadline}
                text={homepageConfig.heroHeadline}
                as="h1"
                className="font-display text-4xl sm:text-5xl lg:text-[3.15rem] font-semibold text-[#F4D99E] leading-[1.08]"
              />

              {/* Ornate Gold Lotus Rule */}
              <div className="flex items-center gap-3 text-[var(--theme-gold-bright)]/80 py-0.5" aria-hidden="true">
                <span className="h-px w-14 bg-gradient-to-r from-transparent to-[var(--theme-gold-bright)]" />
                <LotusMedallion className="w-6 h-4" />
                <span className="h-px w-14 bg-gradient-to-l from-transparent to-[var(--theme-gold-bright)]" />
              </div>

              <p className="text-sm sm:text-[15px] text-[#F6E9D2]/85 leading-relaxed max-w-md">
                {homepageConfig.heroSubheadline}
              </p>

              {/* Royal Gold-Outlined Filigree CTA + Secondary Action */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate({ page: 'shop' })}
                  className="group relative overflow-hidden inline-flex items-center gap-2.5 px-7 py-3 rounded-full border border-[var(--theme-gold-bright)] bg-[var(--theme-primary-dark)]/70 text-[#F8E7C2] text-sm font-medium tracking-wide hover:bg-[var(--theme-gold)] hover:text-[var(--theme-primary-dark)] transition-colors whitespace-nowrap"
                >
                  <LotusMedallion className="w-4 h-3 opacity-85" />
                  <span>{homepageConfig.heroCtaLabel}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate({ page: 'shop', category: 'pooja-kits' })}
                  className="px-4 py-2.5 text-sm font-medium text-[#F6E9D2]/90 hover:text-[var(--theme-gold-bright)] underline underline-offset-4 decoration-[var(--theme-gold)]/60 transition-colors whitespace-nowrap"
                >
                  Shop Pooja Kits
                </button>
              </div>

              {/* Compact Interactive Indian Art Theme Selector */}
              <div className="pt-5 border-t border-[var(--theme-gold)]/25 space-y-2">
                <p className="text-[11px] tracking-[0.12em] text-[#F6E9D2]/70 flex items-center gap-2">
                  <span>Art Tradition</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-hi-serif text-[var(--theme-gold-bright)]">भारतीय कला शैली</span>
                </p>
                <div
                  role="group"
                  aria-label="Select Indian cultural art theme"
                  className="inline-flex flex-wrap items-center gap-1.5"
                >
                  {HERITAGE_THEME_LIST.map((theme) => {
                    const active = heritageTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => handleSelectTheme(theme.id)}
                        className={`px-3 py-1.5 text-xs transition-colors whitespace-nowrap flex items-center gap-1.5 border ${
                          active
                            ? 'bg-[var(--theme-gold)] text-[var(--theme-primary-dark)] border-[var(--theme-gold-bright)] font-semibold'
                            : 'bg-[#FAF3E5]/5 text-[#F6E9D2]/85 border-[#F6E9D2]/25 hover:border-[var(--theme-gold-bright)]'
                        }`}
                      >
                        <span>{theme.name}</span>
                        <span className="font-hi-serif">{theme.nameHi}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Half: Deep Temple Olive-Green Studio Stage */}
          <div className="relative bg-[var(--theme-secondary)] px-6 sm:px-10 lg:pl-24 lg:pr-12 py-12 lg:py-16 flex items-center justify-center overflow-hidden transition-colors duration-300">
            <ScallopedHeroCorner position="tr" />
            <ScallopedHeroCorner position="br" />

            <TiltedHeritageArch className="relative z-10 w-full max-w-xl">
              <div className="relative aspect-[4/3] w-full overflow-hidden border-2 border-[var(--theme-gold)]/75 shadow-[0_24px_60px_rgba(0,0,0,0.45)] bg-[var(--theme-secondary-deep)]">
                <SafeImage
                  src={IMAGES.hero}
                  alt="Serene Indian home pooja arrangement with brushed brass diya, copper kalash, kumkum, haldi, and unbroken akshat rice"
                  loading="eager"
                  className="w-full h-full object-cover object-[66%_center]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#1D1711]/70 via-transparent to-[#1D1711]/15 pointer-events-none"
                />
                <CraftCornerOrnament position="tl" />
                <CraftCornerOrnament position="tr" />
                <CraftCornerOrnament position="bl" />
                <CraftCornerOrnament position="br" />

                {/* Active Craft Provenance Plaque */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 z-10">
                  <div className="flex items-center gap-3 bg-[var(--theme-primary-dark)]/90 border border-[var(--theme-gold)]/70 p-2 pr-4">
                    <div className="w-11 h-9 shrink-0 overflow-hidden border border-[var(--theme-gold)]/60">
                      <SafeImage
                        src={activeThemeSpec.artImageUrl}
                        alt={`${activeThemeSpec.name} traditional Indian artwork swatch`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-hi-display text-sm text-[var(--theme-gold-bright)] leading-tight truncate">
                        {activeThemeSpec.nameHi} · {activeThemeSpec.name}
                      </p>
                      <p className="text-[11px] text-[#F6E9D2]/80 truncate">
                        {activeThemeSpec.region}
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:block text-right text-[11px] text-[#F6E9D2]/90">
                    <p className="font-medium">MRP inclusive of GST</p>
                    <p className="text-[var(--theme-gold-bright)]">Pan-India Delivery</p>
                  </div>
                </div>
              </div>
            </TiltedHeritageArch>
          </div>
        </div>
      </section>

      {/* Woven Ornamental Indian Tapestry Border Ribbon */}
      <OrnamentalTapestryStrip variant={activeTapestry} />

      {/* 2. Parchment Editorial Showcase + Iconic 4-Column Alternating Architectural Category Blocks */}
      <section className="sanganeri-parchment-bg border-b border-[var(--theme-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 space-y-10">
          {/* Dual-Title Royal Header with Centered Golden Mandala Crest (Matching Reference #6) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 text-center">
            <div className="space-y-0.5">
              <p className="font-hi-serif text-xs text-[var(--theme-accent)]">दैनिक पूजा सामग्री</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--theme-ink)]">
                Pure Pooja Essentials
              </h2>
            </div>

            <ParchmentMandalaCrest className="w-16 h-16 sm:w-20 sm:h-20 shrink-0" />

            <div className="space-y-0.5">
              <p className="font-hi-serif text-xs text-[var(--theme-accent)]">संपूर्ण पूजा एवं पीतल पात्र</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--theme-ink)]">
                Best Sellers & Kits
              </h2>
            </div>
          </div>

          {/* 3-Panel Editorial Photography Row (Matching Reference #6) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <button
              type="button"
              onClick={() => navigate({ page: 'shop', category: 'daily-pooja-essentials' })}
              className="group md:col-span-5 relative aspect-[16/10] md:aspect-auto md:h-64 overflow-hidden border border-[var(--theme-gold)]/70 bg-[var(--theme-surface)] text-left"
            >
              <SafeImage
                src={IMAGES.dailyEssentials}
                alt="Daily Pooja Essentials collection"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#241112]/75 via-[#241112]/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-2">
                <div>
                  <p className="font-hi-serif text-xs text-[var(--theme-gold-bright)]">नित्य पूजा</p>
                  <p className="font-display text-2xl font-semibold text-[#FAF3E5]">Daily Samagri</p>
                </div>
                <span className="text-xs text-[var(--theme-gold-bright)] inline-flex items-center gap-1">
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate({ page: 'shop', category: 'pooja-kits' })}
              className="group md:col-span-4 relative aspect-[16/10] md:aspect-auto md:h-64 overflow-hidden border border-[var(--theme-gold)]/70 bg-[var(--theme-surface)]"
            >
              <SafeImage
                src={IMAGES.poojaKits}
                alt="Curated Satyanarayan and Griha Pravesh Pooja Kits"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-[#2C1011]/35 group-hover:bg-[#2C1011]/45 transition-colors flex items-center justify-center p-4">
                <div className="bg-[var(--theme-primary-dark)]/85 border border-[var(--theme-gold)]/80 px-5 py-2.5 text-center">
                  <p className="font-display text-xl font-semibold text-[#F6E9D2]">Curated Ritual Kits</p>
                  <p className="font-hi-serif text-xs text-[var(--theme-gold-bright)]">संपूर्ण पूजा किट</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate({ page: 'shop', category: 'devotional-accessories' })}
              className="group md:col-span-3 relative aspect-[16/10] md:aspect-auto md:h-64 overflow-hidden border border-[var(--theme-gold)]/70 bg-[var(--theme-surface)]"
            >
              <SafeImage
                src={IMAGES.brassAccessories}
                alt="Moradabad solid brass diyas and copper kalash"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-[#2C1011]/30 group-hover:bg-[#2C1011]/45 transition-colors flex items-center justify-center p-4">
                <div className="bg-[var(--theme-primary-dark)]/85 border border-[var(--theme-gold)]/80 px-4 py-2.5 text-center">
                  <p className="font-display text-xl font-semibold text-[#F6E9D2]">Brass & Copper</p>
                  <p className="font-hi-serif text-xs text-[var(--theme-gold-bright)]">पीतल एवं तांबा पात्र</p>
                </div>
              </div>
            </button>
          </div>

          {/* Signature 4-Column Alternating Architectural Category Cards (2 Warm Sand Gold + 2 Deep Royal Maroon) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
            {coreCategories.map((cat, idx) => {
              const isDarkTile = idx >= 2;
              return (
                <div
                  key={cat.id}
                  className={`relative p-7 sm:p-8 flex flex-col justify-between text-center border transition-transform duration-200 hover:-translate-y-1 ${
                    isDarkTile
                      ? 'bg-[var(--theme-primary)] text-[#F6E9D2] border-[var(--theme-gold)]/55'
                      : 'bg-[var(--theme-sand-tile)] text-[var(--theme-ink)] border-[var(--theme-gold)]/65'
                  }`}
                >
                  <CraftCornerOrnament position="tl" />
                  <CraftCornerOrnament position="tr" />
                  <CraftCornerOrnament position="bl" />
                  <CraftCornerOrnament position="br" />

                  <div className="space-y-3">
                    {cat.nameHi && (
                      <p
                        className={`font-hi-serif text-sm ${
                          isDarkTile ? 'text-[var(--theme-gold-bright)]' : 'text-[var(--theme-primary)]'
                        }`}
                      >
                        {cat.nameHi}
                      </p>
                    )}
                    <h3
                      className={`font-display text-3xl font-semibold leading-tight ${
                        isDarkTile ? 'text-[#F5DDA7]' : 'text-[var(--theme-primary-dark)]'
                      }`}
                    >
                      {cat.name}
                    </h3>
                    <p
                      className={`text-xs leading-relaxed ${
                        isDarkTile ? 'text-[#F6E9D2]/80' : 'text-[var(--theme-ink-muted)]'
                      }`}
                    >
                      {cat.description}
                    </p>
                  </div>

                  <div className="pt-6">
                    <button
                      type="button"
                      onClick={() =>
                        cat.slug === 'festival-collections'
                          ? navigate({ page: 'shop', festival: 'diwali' })
                          : navigate({ page: 'shop', category: cat.slug })
                      }
                      className={`px-6 py-2 rounded-full text-xs font-medium tracking-wide transition-colors whitespace-nowrap ${
                        isDarkTile
                          ? 'bg-[var(--theme-accent)] text-[#FAF3E5] hover:bg-[var(--theme-gold)] hover:text-[var(--theme-primary-dark)]'
                          : 'bg-[var(--theme-accent)] text-[#FAF3E5] hover:bg-[var(--theme-primary)]'
                      }`}
                    >
                      Explore Collection
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cultural Craft Marquee Ribbon */}
      <CulturalCraftMarquee />

      {/* 3. Bestselling Products */}
      <section className="bg-[var(--theme-surface)]/80 border-b border-[var(--theme-border)] py-16 lg:py-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-[var(--theme-primary)] font-medium">
                <LotusMedallion className="w-5 h-3.5 text-[var(--theme-accent)]" />
                <span className="font-hi-serif text-sm">लोकप्रिय संग्रह</span>
                <span aria-hidden="true">·</span>
                <span className="tracking-[0.12em]">Bestsellers</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--theme-ink)]">
                Most chosen for Indian households
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate({ page: 'shop' })}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--theme-primary)] hover:text-[var(--theme-primary-dark)] whitespace-nowrap self-start sm:self-auto"
            >
              <span>Shop all essentials</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestsellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Heritage & Art Sanctuary — Crowned by Rajasthani Torana Arch + Flanked by Carved Wooden Yali Brackets */}
      <section className="sanganeri-parchment-bg overflow-hidden border-b border-[var(--theme-border)]">
        {/* Painted Rajasthani Torana Arch Canopy (User Reference #3) */}
        <PaintedToranaCanopy />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 lg:pb-24">
          {/* Centerpiece Story Framed by Mirrored Carved Temple Wooden Brackets (User Reference #2) */}
          <div className="relative flex items-center justify-center py-6 lg:py-10">
            <CarvedTempleBracket
              side="left"
              className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-36 xl:w-44 h-auto opacity-95"
            />
            <CarvedTempleBracket
              side="right"
              className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-36 xl:w-44 h-auto opacity-95"
            />

            <div className="max-w-2xl mx-auto text-center space-y-5 lg:px-14">
              <p className="font-hi-display text-xl sm:text-2xl text-[var(--theme-primary)]">
                हमारी विरासत एवं कला
              </p>
              <h2 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--theme-ink)] leading-tight">
                Heritage & Art
              </h2>
              <p className="text-sm sm:text-base text-[var(--theme-ink-muted)] leading-relaxed">
                Devotional goods deserve the same honesty and craft as India’s timeless temple arts. AKSHAT partners
                directly with brass founders in Moradabad, natural attar and dhoop makers in Kannauj, Sanganeri
                woodblock printers in Jaipur, and spice mills in Tamil Nadu so every jar and vessel carries full
                ingredient and regional origin clarity.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate({ page: 'about' })}
                  className="px-7 py-2.5 rounded-full bg-[var(--theme-accent)] text-[#FAF3E5] text-xs font-semibold tracking-wide hover:bg-[var(--theme-primary)] transition-colors whitespace-nowrap"
                >
                  Read Our Story
                </button>
              </div>

              {/* Golden Mandala Crest Beneath CTA (User Reference #1 & #6) */}
              <div className="pt-2 flex justify-center">
                <ParchmentMandalaCrest className="w-24 h-24 sm:w-28 sm:h-28" />
              </div>
            </div>
          </div>

          {/* Interactive Living Indian Art Traditions Switcher (Sanganeri, Madhubani, Pichwai) */}
          <div className="pt-10 border-t border-[var(--theme-border)]">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div className="space-y-1">
                <p className="text-xs text-[var(--theme-primary)] font-medium flex items-center gap-2">
                  <span className="font-hi-serif text-sm">भारतीय चित्रकला परंपरा</span>
                  <span aria-hidden="true">·</span>
                  <span>Interactive Art Themes</span>
                </p>
                <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--theme-ink)]">
                  Experience the storefront in three classical Indian palettes
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {HERITAGE_THEME_LIST.map((theme) => {
                const isActive = heritageTheme === theme.id;
                return (
                  <SpotlightHeritageCard
                    key={theme.id}
                    className={`bg-[var(--theme-surface-alt)] border transition-colors flex flex-col justify-between ${
                      isActive
                        ? 'border-[var(--theme-primary)] ring-1 ring-[var(--theme-primary)]/40'
                        : 'border-[var(--theme-border)] hover:border-[var(--theme-gold)]'
                    }`}
                  >
                    <div>
                      <div className="relative aspect-[4/3] bg-[var(--theme-surface)] overflow-hidden">
                        <SafeImage
                          src={theme.artImageUrl}
                          alt={`${theme.name} (${theme.nameHi}) traditional Indian artwork from ${theme.region}`}
                          className="w-full h-full object-cover"
                        />
                        <CraftCornerOrnament position="tl" />
                        <CraftCornerOrnament position="tr" />
                        <CraftCornerOrnament position="bl" />
                        <CraftCornerOrnament position="br" />
                      </div>
                      <div className="p-5 space-y-2 relative z-20">
                        <div className="flex items-center justify-between gap-2 text-xs text-[var(--theme-ink-muted)]">
                          <span>{theme.region}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-hi-serif text-[var(--theme-accent)]">{theme.regionHi}</span>
                        </div>
                        <div className="flex items-baseline justify-between gap-2">
                          <h4 className="font-display text-2xl font-semibold text-[var(--theme-ink)]">
                            {theme.name}
                          </h4>
                          <span className="font-hi-display text-lg text-[var(--theme-primary)]">
                            {theme.nameHi}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--theme-ink-muted)] leading-relaxed">
                          {theme.description}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-3 border-t border-[var(--theme-border)]/80 flex items-center justify-between gap-3 relative z-20">
                      <div className="flex items-center gap-1.5" aria-label={`${theme.name} pigment swatches`}>
                        {[
                          theme.swatches.primary,
                          theme.swatches.secondary,
                          theme.swatches.accent,
                          theme.swatches.gold,
                        ].map((hex) => (
                          <span
                            key={hex}
                            className="w-3.5 h-3.5 rounded-full border border-black/15"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectTheme(theme.id)}
                        aria-pressed={isActive}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                          isActive
                            ? 'bg-[var(--theme-primary)] text-[#FAF3E5]'
                            : 'border border-[var(--theme-ink)]/25 text-[var(--theme-ink)] hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)]'
                        }`}
                      >
                        {isActive && <Check className="w-3.5 h-3.5" />}
                        <span>{isActive ? 'Active Theme' : `Apply ${theme.name}`}</span>
                      </button>
                    </div>
                  </SpotlightHeritageCard>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Woven Ornamental Tapestry Strip — Chandra Harini (User Reference #5) */}
      <OrnamentalTapestryStrip variant="chandra" />

      {/* 5. Curated Pooja Kits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2 text-xs text-[var(--theme-accent)] font-medium">
              <span className="font-hi-serif text-sm text-[var(--theme-primary)]">संपूर्ण पूजा किट</span>
              <span aria-hidden="true">·</span>
              <span className="tracking-[0.12em]">Curated Ritual Boxes</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--theme-ink)] leading-tight">
              Complete rituals, organized in one box.
            </h2>
            <p className="text-sm text-[var(--theme-ink-muted)] leading-relaxed">
              No loose plastic pouches or missing samagri on the morning of a family ceremony. Each AKSHAT kit is
              packed in sequence with measured quantities and a clear Hindi-English vidhi booklet.
            </p>
            <button
              type="button"
              onClick={() => navigate({ page: 'shop', category: 'pooja-kits' })}
              className="inline-flex items-center gap-2 pt-2 text-sm font-medium text-[var(--theme-primary)] hover:text-[var(--theme-primary-dark)]"
            >
              <span>Explore all 6 ritual kits</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {curatedKits.map((kit) => (
              <SpotlightHeritageCard
                key={kit.id}
                className="bg-[var(--theme-surface-alt)] border border-[var(--theme-border)] hover:border-[var(--theme-gold)] flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[4/3] bg-[var(--theme-surface)] overflow-hidden">
                    <SafeImage
                      src={kit.imageUrl}
                      alt={kit.name}
                      className="w-full h-full object-cover"
                    />
                    <CraftCornerOrnament position="tl" />
                    <CraftCornerOrnament position="br" />
                  </div>
                  <div className="p-5 space-y-2 relative z-20">
                    <p className="text-xs text-[var(--theme-ink-muted)]">
                      {kit.variants[0]?.weightOrCount}
                    </p>
                    <h3 className="font-display text-xl font-semibold text-[var(--theme-ink)] leading-snug">
                      {kit.name}
                    </h3>
                    {kit.nameHi && (
                      <p className="font-hi-serif text-xs text-[var(--theme-accent)]">{kit.nameHi}</p>
                    )}
                    <p className="text-xs text-[var(--theme-ink-muted)] line-clamp-2">{kit.shortDescription}</p>
                  </div>
                </div>
                <div className="px-5 pb-5 pt-2 flex items-center justify-between relative z-20">
                  <span className="text-sm font-semibold tabular-nums text-[var(--theme-ink)]">
                    {formatInr(kit.basePriceInr)}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate({ page: 'product', slug: kit.slug })}
                    className="text-xs font-medium text-[var(--theme-primary)] hover:underline"
                  >
                    Inspect contents
                  </button>
                </div>
              </SpotlightHeritageCard>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Festival Collections Sanctuary */}
      <section className="bg-[var(--theme-secondary)] text-[#F6EBD8] transition-colors duration-300">
        <HeritageBorderFrieze theme={heritageTheme} tone="gold" className="opacity-80" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-[var(--theme-gold-bright)] font-medium">
                <span className="font-hi-display text-base">उत्सव पंचांग</span>
                <span aria-hidden="true">·</span>
                <span className="tracking-[0.12em]">Festival Calendar</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#F6EBD8]">
                Prepare thoughtfully for every Indian festival
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate({ page: 'shop', festival: 'diwali' })}
              className="inline-flex items-center gap-1.5 text-sm text-[#F6EBD8]/90 hover:text-[var(--theme-gold-bright)] whitespace-nowrap self-start sm:self-auto"
            >
              <span>Browse festival edits</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {festivals.map((fest) => (
              <button
                key={fest.id}
                type="button"
                onClick={() => navigate({ page: 'shop', festival: fest.slug })}
                className="group text-left p-5 bg-[#FAF3E5]/[0.06] border border-[var(--theme-gold)]/30 hover:border-[var(--theme-gold-bright)] hover:bg-[#FAF3E5]/[0.12] transition-colors space-y-2 relative"
              >
                <p className="font-hi-display text-base text-[var(--theme-gold-bright)]">{fest.nameHi}</p>
                <h3 className="font-display text-xl font-semibold text-[#F6EBD8]">{fest.name}</h3>
                <p className="text-xs text-[#F6EBD8]/75 line-clamp-2 leading-relaxed">
                  {fest.description}
                </p>
              </button>
            ))}
          </div>
        </div>
        <HeritageBorderFrieze theme={heritageTheme} tone="gold" className="opacity-80" />
      </section>

      {/* 7. Material Transparency & Three Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[var(--theme-surface-alt)] border border-[var(--theme-border)] space-y-2">
            <p className="font-hi-display text-xl text-[var(--theme-accent)]">०१</p>
            <h3 className="font-display text-2xl font-semibold text-[var(--theme-ink)]">Declared Ingredients</h3>
            <p className="text-xs text-[var(--theme-ink-muted)] leading-relaxed">
              Turmeric-based kumkum, pine-derived Bhimseni camphor, and bamboo-less dhoop with full material lists.
            </p>
          </div>
          <div className="p-6 bg-[var(--theme-surface-alt)] border border-[var(--theme-border)] space-y-2">
            <p className="font-hi-display text-xl text-[var(--theme-accent)]">०२</p>
            <h3 className="font-display text-2xl font-semibold text-[var(--theme-ink)]">Transparent Quantities</h3>
            <p className="text-xs text-[var(--theme-ink-muted)] leading-relaxed">
              Exact gram weights, counts, and GST-inclusive MRPs listed clearly before you add to bag.
            </p>
          </div>
          <div className="p-6 bg-[var(--theme-surface-alt)] border border-[var(--theme-border)] space-y-2">
            <p className="font-hi-display text-xl text-[var(--theme-accent)]">०३</p>
            <h3 className="font-display text-2xl font-semibold text-[var(--theme-ink)]">Heirloom Packaging</h3>
            <p className="text-xs text-[var(--theme-ink-muted)] leading-relaxed">
              Reusable glass apothecary jars and compartmentalized keepsake boxes built for calm home mandirs.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Verified Customer Reviews (Strictly Real Firestore Data — Never Invented) */}
      <section className="bg-[var(--theme-surface)]/80 border-y border-[var(--theme-border)] py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-[var(--theme-primary)] font-medium">
                <span className="font-hi-serif text-sm">ग्राहक अनुभव</span>
                <span aria-hidden="true">·</span>
                <span className="tracking-[0.12em]">Customer Reviews</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--theme-ink)]">
                Honest feedback from verified buyers
              </h2>
            </div>
          </div>

          {recentReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentReviews.map((rev) => (
                <article
                  key={rev.id}
                  className="bg-[var(--theme-surface-alt)] border border-[var(--theme-border)] p-6 space-y-3"
                >
                  <div className="flex items-center gap-1 text-[var(--theme-accent)]" aria-label={`${rev.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-[var(--theme-accent)]' : 'text-[var(--theme-border)]'}`}
                      />
                    ))}
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[var(--theme-ink)]">{rev.title}</h3>
                  <p className="text-sm text-[var(--theme-ink-muted)] leading-relaxed">{rev.body}</p>
                  <p className="text-xs text-[var(--theme-ink-muted)] pt-2 border-t border-[var(--theme-border)]">
                    {rev.authorName}
                    {rev.verifiedPurchase ? ' · Verified Buyer' : ''}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="heritage-manuscript-frame bg-[var(--theme-bg)] p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <h3 className="font-display text-2xl font-semibold text-[var(--theme-ink)]">
                  We publish only genuine customer reviews.
                </h3>
                <p className="text-sm text-[var(--theme-ink-muted)] leading-relaxed">
                  AKSHAT does not display fabricated ratings or placeholder testimonials. Verified buyer reviews appear
                  here automatically as households receive and review their orders.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate({ page: 'shop' })}
                className="px-5 py-2.5 border border-[var(--theme-primary)] text-xs font-medium text-[var(--theme-primary)] hover:bg-[var(--theme-primary)] hover:text-[#FAF3E5] transition-colors whitespace-nowrap shrink-0"
              >
                Review a Product
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 9. Educational Ritual Guides */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-[var(--theme-accent)] font-medium">
              <span className="font-hi-serif text-sm text-[var(--theme-primary)]">पूजा विधि एवं ज्ञान</span>
              <span aria-hidden="true">·</span>
              <span className="tracking-[0.12em]">Ritual Guides</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--theme-ink)]">
              Practical knowledge for meaningful practice
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate({ page: 'guides' })}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--theme-primary)] hover:text-[var(--theme-primary-dark)] whitespace-nowrap self-start sm:self-auto"
          >
            <span>All ritual guides</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {RITUAL_GUIDES.slice(0, 3).map((guide) => (
            <SpotlightHeritageCard
              key={guide.slug}
              className="border border-[var(--theme-border)] hover:border-[var(--theme-gold)] bg-[var(--theme-surface-alt)] flex flex-col"
            >
              <article className="flex flex-col flex-1">
                <div className="aspect-[4/3] bg-[var(--theme-surface)] overflow-hidden">
                  <SafeImage
                    src={guide.imageUrl}
                    alt={guide.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between gap-4 relative z-20">
                  <div className="space-y-2">
                    <div className="text-xs text-[var(--theme-ink-muted)] flex items-center gap-2">
                      <span>{guide.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{guide.readMinutes} min read</span>
                    </div>
                    <h3 className="font-display text-2xl font-semibold text-[var(--theme-ink)] leading-snug">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-[var(--theme-ink-muted)] leading-relaxed">{guide.excerpt}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate({ page: 'guides', guideSlug: guide.slug })}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--theme-primary)] hover:underline self-start"
                  >
                    <span>Read guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            </SpotlightHeritageCard>
          ))}
        </div>
      </section>

      {/* 10. Seasonal Letters Newsletter */}
      <section className="sanganeri-parchment-bg border-t border-[var(--theme-border)]">
        <HeritageBorderFrieze theme={heritageTheme} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center space-y-5">
          <div className="flex items-center justify-center gap-2 text-xs text-[var(--theme-primary)] font-medium">
            <LotusMedallion className="w-5 h-3.5 text-[var(--theme-accent)]" />
            <span className="font-hi-serif text-sm">ऋतु पत्रिका</span>
            <span aria-hidden="true">·</span>
            <span className="tracking-[0.12em]">Seasonal Letters</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--theme-ink)]">
            Receive festival calendars & ritual preparation notes
          </h2>
          <p className="text-sm text-[var(--theme-ink-muted)] max-w-lg mx-auto">
            Thoughtful reminders ahead of Navratri, Diwali, and auspicious household ceremonies — never daily spam.
          </p>
          {newsletterDone ? (
            <p className="text-sm font-medium text-[var(--theme-secondary)] pt-2">
              Thank you for subscribing. Our next seasonal letter will reach your inbox before the upcoming festival.
            </p>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2.5 pt-2">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 bg-[var(--theme-surface-alt)] border border-[var(--theme-border)] text-sm text-[var(--theme-ink)]"
              />
              <ShinyHeritageButton type="submit" className="px-6 py-3">
                Subscribe
              </ShinyHeritageButton>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};
