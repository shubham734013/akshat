import React, { useEffect, useMemo, useState } from 'react';
import { Check, Heart, MapPin, Minus, Plus, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatInr, validatePincode, type PincodeServiceability } from '../utils/commerce';
import { submitProductReview } from '../services/firestoreService';
import { SafeImage } from './SafeImage';
import { ProductCard } from './ProductCard';

export const ProductDetailPage: React.FC = () => {
  const {
    route,
    navigate,
    products,
    reviews,
    addToCart,
    wishlistIds,
    toggleWishlist,
    user,
    profile,
    orders,
    signInWithGoogle,
    showToast,
  } = useStore();

  const product = useMemo(
    () => products.find((p) => p.slug === route.slug) || products[0],
    [products, route.slug]
  );

  const [selectedSku, setSelectedSku] = useState<string>('');
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pinResult, setPinResult] = useState<PincodeServiceability | null>(null);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!product) return;
    setSelectedSku(product.variants[0]?.sku || '');
    setActiveImage(product.imageUrl);
    setQuantity(1);
    setPinResult(null);
  }, [product]);

  // Dynamic SEO title & Product + Breadcrumb JSON-LD
  useEffect(() => {
    if (!product) return;
    const prevTitle = document.title;
    document.title = `${product.name} | AKSHAT (अक्षत)`;

    const scriptId = 'akshat-product-jsonld';
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Product',
          name: product.name,
          description: product.shortDescription,
          sku: product.variants[0]?.sku,
          brand: { '@type': 'Brand', name: 'AKSHAT' },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: product.basePriceInr,
            availability:
              product.totalStock > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
          },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${window.location.origin}/#/` },
            { '@type': 'ListItem', position: 2, name: 'Shop', item: `${window.location.origin}/#/shop` },
            { '@type': 'ListItem', position: 3, name: product.name },
          ],
        },
      ],
    });
    document.head.appendChild(script);

    return () => {
      document.title = prevTitle;
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [product]);

  if (!product) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="font-display text-3xl text-[#242320]">Product not found</h1>
        <button
          type="button"
          onClick={() => navigate({ page: 'shop' })}
          className="px-6 py-2.5 bg-[#702F32] text-[#FAF7F0] text-sm"
        >
          Return to Catalog
        </button>
      </main>
    );
  }

  const activeVariant =
    product.variants.find((v) => v.sku === selectedSku) || product.variants[0];
  const gallery = Array.from(new Set([product.imageUrl, ...(product.gallery || [])]));
  const isSaved = wishlistIds.includes(product.id);
  const inStock = activeVariant && activeVariant.stock > 0;
  const productReviews = reviews.filter((r) => r.productId === product.id);
  const relatedProducts = products
    .filter((p) => p.isActive && p.id !== product.id && p.categorySlug === product.categorySlug)
    .slice(0, 4);

  const hasPurchased = orders.some((ord) =>
    ord.items.some((item) => item.productId === product.id)
  );

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    setPinResult(validatePincode(pincode));
  };

  const handleBuyNow = () => {
    if (!activeVariant || !inStock) return;
    addToCart(product, activeVariant, quantity, false);
    navigate({ page: 'checkout' });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      await signInWithGoogle();
      return;
    }
    if (reviewTitle.trim().length < 2 || reviewBody.trim().length < 5) {
      showToast('Please enter a review headline and at least a short comment.', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      await submitProductReview({
        productId: product.id,
        userId: user.uid,
        authorName: profile?.displayName || user.displayName || 'AKSHAT Customer',
        rating: reviewRating,
        title: reviewTitle,
        body: reviewBody,
        verifiedPurchase: hasPurchased,
      });
      setReviewTitle('');
      setReviewBody('');
      setReviewRating(5);
      showToast('Thank you — your review has been published.', 'success');
    } catch {
      showToast('Could not submit review right now. Please try again.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-[#5C574F] flex items-center gap-2 mb-8">
        <button type="button" onClick={() => navigate({ page: 'home' })} className="hover:text-[#702F32]">
          Home
        </button>
        <span aria-hidden="true">/</span>
        <button
          type="button"
          onClick={() => navigate({ page: 'shop', category: product.categorySlug })}
          className="hover:text-[#702F32] capitalize"
        >
          {product.categorySlug.replace(/-/g, ' ')}
        </button>
        <span aria-hidden="true">/</span>
        <span className="text-[#242320] truncate">{product.name}</span>
      </nav>

      {/* Primary Two-Column Contiguous Purchase Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left: Sticky Gallery */}
        <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-4">
          <div className="aspect-[4/3] bg-[#F3EDE0] border border-[#E5DCCB] overflow-hidden">
            <SafeImage
              src={activeImage || product.imageUrl}
              alt={product.name}
              loading="eager"
              className="w-full h-full object-cover"
            />
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {gallery.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  aria-label={`View image ${i + 1} of ${product.name}`}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-16 shrink-0 border overflow-hidden ${
                    activeImage === img ? 'border-[#702F32]' : 'border-[#E5DCCB] opacity-75 hover:opacity-100'
                  }`}
                >
                  <SafeImage src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Contiguous Purchase Module + Transparency Specs */}
        <div className="lg:col-span-6 space-y-7">
          <div className="space-y-2 border-b border-[#E5DCCB] pb-6">
            <div className="text-xs text-[#5C574F] flex flex-wrap items-center gap-2">
              <span>{product.origin.split(';')[0]}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">SKU: {activeVariant?.sku}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#242320] leading-tight">
              {product.name}
            </h1>
            {product.nameHi && <p className="font-hi text-base text-[#B99357]">{product.nameHi}</p>}
            <p className="text-sm sm:text-base text-[#5C574F] leading-relaxed pt-2">{product.shortDescription}</p>

            {/* Price & Tax */}
            <div className="pt-4 flex items-baseline gap-3 tabular-nums">
              <span className="text-2xl sm:text-3xl font-semibold text-[#242320]">
                {formatInr(activeVariant?.priceInr ?? product.basePriceInr)}
              </span>
              {activeVariant?.compareAtPriceInr && activeVariant.compareAtPriceInr > activeVariant.priceInr && (
                <span className="text-base text-[#5C574F] line-through">
                  {formatInr(activeVariant.compareAtPriceInr)}
                </span>
              )}
              <span className="text-xs text-[#5C574F]">
                MRP inclusive of {product.gstPercent}% GST
              </span>
            </div>

            {/* Stock Status */}
            <p className={`text-xs font-medium pt-1 ${inStock ? 'text-[#34483B]' : 'text-[#702F32]'}`}>
              {inStock
                ? activeVariant.stock <= product.lowStockThreshold
                  ? `In Stock — ${activeVariant.stock} units left in current batch`
                  : `In Stock (${activeVariant.stock} units available)`
                : 'Currently Out of Stock'}
            </p>
          </div>

          {/* Variant Selector */}
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wide text-[#242320]">Select Pack / Variant</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.variants.map((variant) => {
                const selected = variant.sku === activeVariant?.sku;
                return (
                  <button
                    key={variant.sku}
                    type="button"
                    onClick={() => {
                      setSelectedSku(variant.sku);
                      setQuantity(1);
                    }}
                    className={`p-3.5 text-left border transition-colors ${
                      selected
                        ? 'border-[#702F32] bg-white'
                        : 'border-[#E5DCCB] bg-[#FAF7F0] hover:border-[#B99357]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-[#242320]">{variant.label}</span>
                      <span className="text-sm font-semibold tabular-nums text-[#242320]">
                        {formatInr(variant.priceInr)}
                      </span>
                    </div>
                    <p className="text-xs text-[#5C574F] mt-1">
                      {variant.weightOrCount} · {variant.stock > 0 ? `${variant.stock} available` : 'Out of stock'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity + Primary CTAs */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center border border-[#E5DCCB] bg-white">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 text-[#242320] hover:bg-[#F3EDE0]"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-semibold tabular-nums">{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => Math.min(activeVariant?.stock || 1, q + 1))}
                  className="p-3 text-[#242320] hover:bg-[#F3EDE0]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                disabled={!inStock}
                onClick={() => activeVariant && addToCart(product, activeVariant, quantity, true)}
                className="flex-1 min-w-[160px] py-3.5 px-6 bg-[#702F32] text-[#FAF7F0] text-sm font-medium tracking-wide hover:bg-[#582225] disabled:bg-[#E5DCCB] disabled:text-[#5C574F] transition-colors whitespace-nowrap"
              >
                {inStock ? 'Add to Bag' : 'Out of Stock'}
              </button>

              <button
                type="button"
                disabled={!inStock}
                onClick={handleBuyNow}
                className="py-3.5 px-6 border border-[#242320] text-[#242320] text-sm font-medium hover:bg-[#242320] hover:text-[#FAF7F0] disabled:opacity-40 transition-colors whitespace-nowrap"
              >
                Buy Now
              </button>

              <button
                type="button"
                aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                onClick={() => void toggleWishlist(product.id)}
                className="p-3.5 border border-[#E5DCCB] bg-white text-[#242320] hover:border-[#702F32] hover:text-[#702F32]"
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#702F32] text-[#702F32]' : ''}`} />
              </button>
            </div>
          </div>

          {/* Delivery Availability by PIN Code */}
          <div className="p-5 bg-[#F3EDE0]/75 border border-[#E5DCCB] space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#242320]">
              <MapPin className="w-4 h-4 text-[#702F32]" />
              <span>Check Delivery Availability by PIN Code</span>
            </div>
            <form onSubmit={handleCheckPincode} className="flex gap-2">
              <label htmlFor="pdp-pincode" className="sr-only">
                6-digit Indian PIN code
              </label>
              <input
                id="pdp-pincode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit PIN (e.g. 400001)"
                className="flex-1 px-3.5 py-2 bg-white border border-[#E5DCCB] text-sm text-[#242320] tabular-nums"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-[#242320] text-[#FAF7F0] text-xs font-medium hover:bg-[#702F32] transition-colors whitespace-nowrap"
              >
                Check
              </button>
            </form>
            {pinResult && (
              <p
                className={`text-xs leading-relaxed flex items-start gap-2 ${
                  pinResult.valid ? 'text-[#34483B]' : 'text-[#702F32]'
                }`}
              >
                {pinResult.valid && <Check className="w-4 h-4 shrink-0 mt-0.5" />}
                <span>{pinResult.message}</span>
              </p>
            )}
          </div>

          {/* Transparent Details: Description, Ingredients, Origin, Usage & Storage */}
          <div className="divide-y divide-[#E5DCCB] border-t border-[#E5DCCB]">
            <div className="py-5 space-y-2">
              <h2 className="font-display text-2xl font-semibold text-[#242320]">About This Offering</h2>
              <p className="text-sm text-[#5C574F] leading-relaxed">{product.description}</p>
            </div>

            {product.ingredients && (
              <div className="py-5 space-y-2">
                <h2 className="font-display text-xl font-semibold text-[#242320]">Ingredients / Materials</h2>
                <p className="text-sm text-[#5C574F] leading-relaxed">{product.ingredients}</p>
              </div>
            )}

            <div className="py-5 space-y-2">
              <h2 className="font-display text-xl font-semibold text-[#242320]">Regional Origin</h2>
              <p className="text-sm text-[#5C574F] leading-relaxed">{product.origin}</p>
            </div>

            {product.usageInstructions && (
              <div className="py-5 space-y-2">
                <h2 className="font-display text-xl font-semibold text-[#242320]">Ritual Usage</h2>
                <p className="text-sm text-[#5C574F] leading-relaxed">{product.usageInstructions}</p>
              </div>
            )}

            {product.storageInstructions && (
              <div className="py-5 space-y-2">
                <h2 className="font-display text-xl font-semibold text-[#242320]">Care & Storage</h2>
                <p className="text-sm text-[#5C574F] leading-relaxed">{product.storageInstructions}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verified Customer Reviews */}
      <section className="mt-20 pt-14 border-t border-[#E5DCCB]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-6">
            <div>
              <p className="text-xs tracking-[0.14em] text-[#702F32] font-medium">Customer Reviews</p>
              <h2 className="font-display text-3xl font-semibold text-[#242320] mt-1">
                Reviews for {product.name}
              </h2>
            </div>

            {productReviews.length === 0 ? (
              <div className="p-6 bg-[#F3EDE0]/60 border border-[#E5DCCB] text-sm text-[#5C574F]">
                No reviews have been submitted for this product yet. We never publish synthetic or placeholder
                testimonials — if you have used this offering, share an honest review on the right.
              </div>
            ) : (
              <div className="space-y-4">
                {productReviews.map((rev) => (
                  <article key={rev.id} className="p-6 bg-white border border-[#E5DCCB] space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-[#C56A32]">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-3.5 h-3.5 ${idx < rev.rating ? 'fill-[#C56A32]' : 'text-[#E5DCCB]'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-[#5C574F]">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-semibold text-[#242320]">{rev.title}</h3>
                    <p className="text-sm text-[#5C574F] leading-relaxed">{rev.body}</p>
                    <p className="text-xs text-[#5C574F] pt-1">
                      {rev.authorName} {rev.verifiedPurchase ? '· Verified Buyer' : ''}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="p-6 bg-white border border-[#E5DCCB] space-y-4">
              <h3 className="font-display text-2xl font-semibold text-[#242320]">Write a Review</h3>
              {!user ? (
                <div className="space-y-3">
                  <p className="text-sm text-[#5C574F]">
                    Sign in with Google to submit a genuine review linked to your account.
                  </p>
                  <button
                    type="button"
                    onClick={() => void signInWithGoogle()}
                    className="px-5 py-2.5 bg-[#702F32] text-[#FAF7F0] text-xs font-medium hover:bg-[#582225] transition-colors"
                  >
                    Sign in to Write a Review
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="review-rating" className="block text-xs font-medium text-[#242320] mb-1">
                      Rating
                    </label>
                    <select
                      id="review-rating"
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB] text-sm"
                    >
                      <option value={5}>5 Stars — Excellent</option>
                      <option value={4}>4 Stars — Very Good</option>
                      <option value={3}>3 Stars — Good</option>
                      <option value={2}>2 Stars — Fair</option>
                      <option value={1}>1 Star — Needs Improvement</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="review-title" className="block text-xs font-medium text-[#242320] mb-1">
                      Headline
                    </label>
                    <input
                      id="review-title"
                      type="text"
                      required
                      maxLength={120}
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="Summarize your experience"
                      className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB] text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="review-body" className="block text-xs font-medium text-[#242320] mb-1">
                      Your Review
                    </label>
                    <textarea
                      id="review-body"
                      required
                      rows={4}
                      maxLength={1200}
                      value={reviewBody}
                      onChange={(e) => setReviewBody(e.target.value)}
                      placeholder="Share details on purity, packaging, aroma, or craft..."
                      className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB] text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full py-2.5 bg-[#702F32] text-[#FAF7F0] text-sm font-medium hover:bg-[#582225] disabled:opacity-50 transition-colors"
                  >
                    {submittingReview ? 'Submitting...' : 'Publish Review'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-14 border-t border-[#E5DCCB]">
          <h2 className="font-display text-3xl font-semibold text-[#242320] mb-8">Related Offerings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};
