# AKSHAT (अक्षत) | Indian Heritage Commerce Design System

**Status:** UX and visual design blueprint, version 1.0  
**Repository:** https://github.com/shubham734013/akshat  
**Target:** Responsive, bilingual-friendly Indian pooja essentials and complete ritual kits storefront  
**Scope:** Design documentation and implementation guidance. No runtime UI or payment changes are made by this document.

---

## 1. Product vision

**AKSHAT = everyday devotion, thoughtfully prepared.** Make finding the right pooja material as intuitive as a modern high-quality e-commerce experience, while allowing Indian visual heritage to shape the experience rather than acting as random decoration.

- Brand attributes: grounded, warm, trustworthy, respectful, modern, craft-aware, transparent, accessible.
- Primary customers: households restocking daily materials; families preparing ceremonies; festival shoppers; customers buying thoughtful gift kits; people seeking guidance before their first ritual.
- Core promise: know what is in each box, how much it contains, when it is expected to arrive, and what it costs before paying.
- Design principle: **80% calm commerce, 20% considered ornament.** Ornament belongs in moments of discovery and storytelling, not input-heavy checkout screens.
- Avoid: generic saffron gradients, excessive gold, unrelated sacred symbols, fabricated authenticity claims, copied tribal/folk artwork, fake reviews, fake scarcity, or unverified purity promises.

### Experience goals
1. Customers discover by **ritual**, **occasion**, **product**, and **use case**.
2. Every kit answers **What is inside?**, **What do I still need?**, **How many people is it for?**, and **When can I receive it?**
3. Physical goods retain conventional e-commerce patterns: recognizable cards, clear prices, easy variants, trustworthy shipping information, predictable cart.
4. The site works well in Hindi and English, on modest Indian smartphones and slower networks.
5. Heritage art feels regional, credited, intentional, and identifiable.

## 2. Existing repository audit (main at 1124a4e, inspected 2026-11-21)

### Reuse rather than rebuild
| Existing file | Observed responsibility | Design recommendation |
|---|---|---|
| src/App.tsx | App shell and page dispatch | Keep initially; introduce a cohesive page layout system |
| src/index.css | Tailwind v4, palette variables, themes, motion rules | Consolidate visual tokens and use consistently |
| src/utils/heritageThemes.ts | Sanganeri, Madhubani, Pichwai theme metadata | Retain theme switching, fix image asset URLs, add art attribution |
| src/components/IndianMotifs.tsx | Border, mandala, medallion and architectural SVGs | Refactor into lightweight accessible ornament primitives |
| src/components/HeritageMotion.tsx | Motion effects, interactive cards and marquees | Reduce hover effects, honor reduced motion, test touch behavior |
| src/components/HomePage.tsx | Full cultural homepage with many stacked sections | Simplify hierarchy and prioritize shopping/navigation |
| src/components/Header.tsx | Announcement, navigation, search, account, cart | Build desktop mega menu and mobile ritual-led drawer |
| src/components/ProductCard.tsx | Catalog image, title, price, add-to-cart | Normalize proportions and content density |
| src/components/CatalogPage.tsx | Search, category, festival, sort, filters | Replace hardcoded colors with theme tokens; improve mobile filtering |
| src/components/ProductDetailPage.tsx | Variants, pincode check, reviews, schema | Add structured kit contents and delivery estimate sourced from carrier |
| src/components/CheckoutPage.tsx | Address, coupon, payment choice, order creation | Block production until backend payment/order verification is fixed |
| src/context/StoreContext.tsx | Route/store state, persisted cart/theme | Keep short term; separate UI preferences from transactional state |
| src/services/firestoreService.ts | Firestore reads/writes, orders and admin flows | Move authoritative totals, payment, stock checks server-side |
| src/components/AdminDashboard.tsx | Inventory, catalog, order and related admin UI | Preserve; add design-system styling and content provenance fields |
| src/data/catalog.ts | Seed categories, products, kits, guides | Enrich kit schemas and validate product copy and claims |

### Critical corrections to prioritize
- **Payment integrity:** CheckoutPage.tsx presently sets paymentStatus to 'paid' for non-COD selections without evidence of a verified payment transaction. Integrate a proper gateway, create orders in a secure backend, and mark paid only on verified server-side payment confirmation. Never rely on a client-selected payment method.
- **Guest orders:** The guest branch currently stores a local order instead of a durable server-side order; create server-owned guest order records and tracking references.
- **Pricing/stock:** Recalculate totals, discounts, shipping, GST handling and available inventory on the backend; reserve or decrement stock transactionally and verify coupons.
- **Asset references:** heritageThemes.ts uses literal /src/assets/images/... URLs; import/bundle assets or move public files to public paths so production URLs work.
- **Visual consistency:** Catalog, Checkout, Editorial and Admin components include hardcoded palette values that can clash with selected themes; migrate these to shared tokens.
- **SEO:** Hash-based URLs and a client-only route shell can limit indexing and clean deep-link behavior. Plan clean routes with an appropriate rendering/SEO strategy before major public launch.
- **Newsletter:** The homepage reports subscription success for signed-out visitors without a persistence call; use an actual opt-in endpoint and confirmed write result.
- **Trust:** Avoid displaying claims, delivery dates, ratings or reviews that are not backed by real data.

These are code observations and priorities, not a full penetration test or deployment validation.

## 3. Art direction: “A living Indian atelier”

### Visual concept
Imagine a carefully organized contemporary boutique inside an Indian courtyard: sun-warmed plaster, aged wood, carved brackets, copper and brass details, block-printed textiles, fine line illustrations, clean commercial typography.

Three levels of visual detail:
- **Level A, functional:** white/ivory product surfaces, clear buttons, legible forms, minimal borders.
- **Level B, editorial:** Sanganeri floral butas, medallions, paper grain, refined tile patterns.
- **Level C, ceremonial:** Madhubani storytelling panels, Pichwai lotus art, carved stambh columns or torana arches. Use sparingly as focal points.

### Tradition-to-component mapping
| Tradition | Visual grammar | Best placement | Guardrail |
|---|---|---|---|
| Sanganeri, Rajasthan | Fine repeating floral buta, delicate stems, negative space | Default backdrop, packaging band, cards, newsletter | Low contrast only; do not texture reading surfaces |
| Madhubani / Mithila, Bihar | Double-line borders, hatching, stylized fish, sun, lotus, peacock | Craft story panels, campaign illustrations, festival storytelling | Keep designs recognizably distinct; commission/credit artists |
| Pichwai, Nathdwara | Lotus ponds, rhythmic foliage, decorative borders, arches | Seasonal editorial collection or story cover | Avoid representing religious artwork as generic decorative stock |
| Mandala / regional geometric rosettes | Radial symmetry and restrained concentric flourishes | Hero halo, divider medallions, empty-state illustrations | One focal mandala per large section; no constant spin |
| Temple stambh / carved pillar | Fluted or floral stone pillars, column capitals | Hero frame edges, full-width culture section | Never place large pillars beside every product |
| Torana / jharokha architecture | Scalloped doorway contours and patterned overhead frame | Feature media frames, brand-story headings | Do not obscure content or interactive elements |
| Handwoven / handmade paper | Subtle material grain and warm tactile shadows | Backgrounds and unboxing storytelling | CSS-first, optimized, avoid noisy bitmaps |

**Cultural integrity:** Use original commissioned or properly licensed artwork. Attribute region, artist/workshop and rights status in an asset manifest. Never relabel a Madhubani piece as Sanganeri or claim hand-crafted origin without evidence.

## 4. Design tokens

Default theme: **Sanganeri Heritage**. Other themes change surface/ornament colors, not layout, checkout conventions, or brand legibility.

| Token | Hex | Use |
|---|---|---|
| canvas | #F7F1E6 | Main background |
| surface | #FFFDF8 | Product cards and forms |
| parchment | #EFE1CB | Story/editorial background |
| maroon | #5B2528 | Primary actions, titles, footer |
| maroon-hover | #451B20 | Button hover |
| vermilion | #B65D3A | Eyebrows, tiny accent elements |
| temple-green | #30483B | Secondary editorial section |
| indigo | #2E4A63 | Occasional folk-art detail only |
| brass | #AA8148 | Fine borders, decorative metal |
| ink | #2D2924 | Primary body text |
| ink-muted | #685D52 | Supporting text |
| divider | #DDCEB8 | Borders and separators |
| success | #276749 | Transaction status |
| error | #A33132 | Form errors |

Do not use brass alone for text on ivory: check contrast. Gold is an accent, never the primary body color.

### Typography
- Display Latin: **Cormorant Garamond** (already declared); fallback Georgia.
- Interface Latin: **Plus Jakarta Sans** (already declared); fallback system UI.
- Hindi body/headings: **Tiro Devanagari Hindi**; use a verified font license and test line breaks.
- Optional Hindi editorial display: **Rozha One** only for short headings, never for forms.
- Desktop H1: 56–72 px / 1.03–1.12; mobile H1: 38–46 px.
- H2: desktop 34–44 px; mobile 28–32 px.
- Body: 16–18 px line-height 1.55; utility text 13–14 px minimum.
- Limit large serif display headings to 2 lines where possible; keep checkout labels in sans.

### Grid, spacing and surfaces
- 12-column desktop grid, 1280 px maximum content width, 40–48 px desktop gutters.
- 8 px spacing system: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96.
- Desktop product cards: 4 columns; tablet: 2–3; mobile: 2 (switch to 1 only for editorial cards).
- Card image aspect ratio: 4:5 or 1:1, standardized per component; use object-fit contain for packaged items.
- Desktop nav height ~80 px, main CTA minimum 44 px high, touch targets at least 44×44 px.
- Corners: mostly 4–8 px for product UI; rounded 999 px only for category tags and pills.
- Shadows: subtle elevation for product cards, deep soft shadow only for hero objects.
- Ornament opacity: 3–8% on reading surfaces; 15–35% in illustration zones.

## 5. Sitemap and information architecture

**Global:** Home / Shop All / Pooja Kits / Shop by Ritual / Festivals / Craft & Origin / Ritual Guides / Our Story / Help / Account / Cart.

### Shop taxonomy
1. Daily essentials: akshat rice, haldi, kumkum, chandan, dhoop, agarbatti, kapoor, cotton wicks, oils, kalawa.
2. Pooja kits: Satyanarayan, Griha Pravesh, Lakshmi Pujan, Navratri, Janmashtami, Mahashivratri, Sundarkand/Akhand Ramayan, Ekadashi, wedding and custom kits. Display only actually stocked kits.
3. Accessories: diya, kalash, thali, bell, incense holders, brass/copper vessels.
4. Festival collections: season-aware and filterable, not entirely dependent on festivals.
5. Gifts and family bundles: celebratory boxes, refill subscriptions only if genuinely supported.

### Find a kit
A short guided filter: **Occasion → Approx. ritual size → Preferred kit completeness → Shipping pincode → Results.** Show “check with your family priest or custom” when requirements vary; avoid claiming one kit covers every regional practice.

## 6. Homepage wireframe and content

1. **Top announcement:** one line only, truthful shipping threshold/service note; dismissible.
2. **Header:** wordmark + modest emblem, Shop, Pooja Kits, Festivals, Guides, Origin, large search, account, wishlist, cart. Sticky only after scroll; mobile uses compact search and menu.
3. **Hero:** left warm ivory editorial title (“परंपरा, हर दिन के साथ” / “Every ritual begins with care”), one 2-line value statement, solid maroon **Explore Pooja Kits**, ghost **Shop Essentials**. Right side: styled still life of a real product kit, brass diya and natural textures; one *restrained* radial mandala and two carved stambh frame details. No huge animation behind text.
4. **Trust row:** ingredient clarity, verified product details, easy guidance, delivery availability (only when true). Prefer specifics over badges.
5. **Shop by need:** four clear cards, Daily Essentials / Complete Pooja Kits / Brass & Copper / Festivals. Each card has a thumbnail and an explicit link.
6. **Bestsellers:** 4-up product grid with genuine product names/prices from the data layer. Image, name, Hindi secondary name, 1-line key detail, variant, price, clear add button.
7. **Guided ritual-kit finder:** one compact illustrated feature section with 3-step filter and honest scope.
8. **Heritage atelier:** one beautifully framed section, with Sanganeri/Madhubani/Pichwai art cards and editorial storytelling. Selectors change only visual art presentation, not shop data.
9. **Seasonal ritual collection:** time-relevant only when curated products exist; no empty campaign shell.
10. **From the material to your mandir:** provenance, ingredients, net weight and sustainability with evidence.
11. **Ritual guides:** 2–3 practical articles, link related products/kit contents.
12. **Reviews:** only verified, real, permissioned reviews; show empty state gracefully.
13. **Newsletter and footer:** consent-based signup, help, policies, contact, trusted payment logos only if integrated.

**Priority:** Hero + navigation + shop categories + bestsellers should be immediately visible/near first scroll; do not make users pass multiple decorative sections to shop.

## 7. Component specifications

### Product card
- Primary image with quiet solid background; no busy patterns beneath products.
- Small type/category eyebrow and one concise title (2 lines max).
- Package size/units and variant clearly visible.
- INR price, struck-through compare-at only when truthful and compliant.
- Prominent **Add to Bag**, which opens the existing cart drawer; disabled with accessible reason when out of stock.
- Wishlist secondary, not competing with CTA.
- Do not show arbitrary star ratings, “sold today,” or made-up bestseller tags.

### Product detail page
- Breadcrumb, thumbnails, enlarged hero photo and alt text.
- Product title in English and Hindi when localized; plain-language benefit statement.
- Price inclusive of applicable taxes, variant, weight/quantity, ingredients/material and origin as verified fields.
- For kits: searchable checklist with **included contents + quantity + unit + optional/excluded items**, suitability notes, date/occasion and guidance disclaimer.
- Availability + delivery estimate based on actual fulfillment provider, not only a syntactic pincode check.
- Quantity controls, add to bag, shipping/return terms, FAQ, recommended related products, real reviews.
- Surface safety/regulatory labels as required for edible products, lamps, incense and flammable items.

### Cart and checkout
- Cart: editable items, SKU/size, costs, coupon error, free-shipping progress, totals.
- Guest checkout must be supported without losing the order.
- Checkout: address → delivery → payment → review/confirmation.
- Do not show paid/confirmed before backend payment confirmation; COD is pending until collected.
- Secure server order creation and payment webhooks; idempotent order finalization.
- Explicit delivery limitations, shipping charges, GST handling, customer support and refund policy.
- Keep forms neutral and text-first: no heavy mandalas, animated backgrounds, or unrelated banners.

### Search and catalog
- Search suggestions for item names, Hindi transliteration and ritual intent.
- Filter chips for category, occasion, price, stock and material.
- Sort by featured (editorial), price, and name; never infer popular without actual data.
- Preserve filters in URL; show result count and empty state.
- Mobile filter as a modal drawer with Apply and Reset.

### Account and admin
- Customer: profile, addresses, durable orders, tracking, refunds/support, wishlist and consent preferences.
- Admin: editable artwork credit/rights fields, bilingual descriptions, kit contents, festival windows, stock, fulfilled orders, campaign schedules and audit logs.
- Ensure all admin operations are checked by server permissions; UI hiding is not an authorization boundary.

## 8. Mobile-first layout

| Screen | Structure |
|---|---|
| 360–430 px | wordmark + cart/menu, full-width search, stacked hero (copy before image), 2-up category grid, 2-up products |
| 431–767 px | wider stacked hero, 2-up catalog, sectional padding 20–24 px |
| 768–1023 px | 2-column hero where space allows, 2–3 products, slide-over filters |
| 1024–1439 px | desktop navigation, two-column hero, 4 products |
| 1440+ px | max-width content, designed whitespace, no stretched paragraphs |

No horizontal overflow. Allow Hindi strings to wrap naturally. Make the cart/delivery CTA sticky on mobile product pages only when it does not obscure content or keyboard.

## 9. Interaction and accessibility

- Header: active state, keyboard-operable menus, escape-to-close, focus restoration.
- Cart drawer: focus trap, ARIA dialog semantics, live region for quantity changes and totals.
- Theme controls: label as **Art style**; preserve selected theme in existing store, do not change accessibility contrast.
- Animation: 150–250ms micro-interactions; 400–600ms editorial entrance when visible. Turn off decorative movement when prefers-reduced-motion is set.
- Images: proper meaningful product alt text; ornament SVG aria-hidden; no text baked into critical hero images.
- WCAG 2.2 AA target: text contrast ≥ 4.5:1, UI contrast ≥ 3:1, visible focus, keyboard order, 44 px comfortable targets, form errors announced and tied to inputs.
- Avoid autoplay audio/video, fast pulsing, scroll-jacking, continuous rotating mandala as a default.

## 10. Asset production and artwork provenance

Maintain an asset manifest with: asset ID, file name, region/style, author/workshop, source/license, rights scope, alt text, and usage location.

Recommended originals:
- hero-ritual-still-life.webp, desktop ~1400×1100 and mobile crop;
- sanganeri-buta-tile.svg, small repeat;
- madhubani-double-line-border.svg, decorative line band;
- pichwai-lotus-panel.webp, commissioned/permissioned;
- stambh-floral-capital.svg and torana-outline.svg;
- product imagery: front hero, 45-degree angle, size-in-hand comparison where appropriate, packaging reverse labels, unboxing/contents.

Prefer AVIF/WebP for photography, SVG for patterns, posterized illustrations only where suitable. Respect artist attribution and cultural specificity. The generated reference mockup is **concept art**, not verified product photography or a claim of artisanal origin.

## 11. Implementation map for this repository

**Phase 0, production correctness (must fix before launch)**
- Implement verified gateway/payment webhooks and server-authoritative order creation.
- Persist guest orders; protect transactions, totals, stock and coupon rules.
- Test admin authorization, checkout success/failure/refund scenarios, Firestore security rules.
- Fix image asset resolution and misleading newsletter success behavior.

**Phase 1, design foundations**
- src/index.css: unify semantic tokens and base controls; add consistent responsive container and contrast-safe states.
- src/components/IndianMotifs.tsx: split motifs into independent SvgDecorations, frames and patterns.
- src/utils/heritageThemes.ts: add typed design tokens / import-backed assets and cultural attribution.
- Create shared Button, Input, Badge, SectionHeading, ProductMedia, Breadcrumb components.

**Phase 2, shopping experience**
- src/components/Header.tsx: predictable navigation, accessible mega menu and mobile drawer.
- src/components/HomePage.tsx: rebuild section hierarchy as described in §6; use CMS/Firestore data instead of repeating literals.
- src/components/ProductCard.tsx + CatalogPage.tsx: consistent cards, filters, empty states.
- src/components/ProductDetailPage.tsx: kit itemization and fulfillment availability.

**Phase 3, commerce, trust, editorial**
- src/components/CartDrawer.tsx + CheckoutPage.tsx: backend-integrated, accessible end-to-end cart/checkout.
- src/components/EditorialPages.tsx + Footer.tsx: rework story, craft credits, guides, policies.
- src/components/AdminDashboard.tsx: matching UI and authoring fields for new content.
- Evaluate clean route strategy and renderable SEO pages, sitemaps and schema.

**Phase 4, verification**
- Pixel review at 390 / 768 / 1280 / 1440 px.
- Core journeys: search → product → variant → add → cart → payment → webhook confirmation → tracking.
- Validate mixed Hindi/English, low bandwidth and 200% text zoom.
- Automated tests for commerce calculations, order state machine, auth/rules and CTA keyboard use.
- Lighthouse targets for key public pages: LCP < 2.5s, CLS < 0.1, INP < 200ms at the 75th percentile on real-user data where available. Treat these as objectives, not measurements.

## 12. Definition of done

- The storefront resembles a **cohesive Indian design brand**, not a temple poster or a generic shop template.
- A customer can locate a relevant pooja kit within 3 meaningful interactions from the homepage.
- All active products are purchasable with verified prices, inventory and secure payment flow.
- Every kit item is visible, countable and understandable before purchase.
- Theme switching does not damage readability or commerce flows.
- Hindi and English text remain readable and culturally reviewed.
- Every artwork has documented permissions/attribution.
- All order states reflect server records, not guessed client outcomes.
- Responsive visual QA, accessibility checks and commerce tests pass before release.

---

**Reference mockups:** Create a desktop and mobile homepage exploration using this document. Their layout and imagery are design-direction studies, not screenshots of the current app.  
**Brand line:** *Rooted in tradition. Crafted for today.*  
**North star:** Respect the tradition. Simplify the ritual. Earn the customer's trust.
