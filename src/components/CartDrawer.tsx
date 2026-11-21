import React, { useState } from 'react';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatInr, FREE_SHIPPING_THRESHOLD_INR } from '../utils/commerce';
import { SafeImage } from './SafeImage';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartDrawerOpen,
    setCartDrawerOpen,
    updateCartQty,
    removeFromCart,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    cartTotals,
    navigate,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [applying, setApplying] = useState(false);

  if (!cartDrawerOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    const res = await applyCouponCode(couponInput);
    setCouponFeedback({ ok: res.ok, text: res.message });
    if (res.ok) setCouponInput('');
    setApplying(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping bag"
    >
      <div
        className="fixed inset-0 bg-[#242320]/45"
        onClick={() => setCartDrawerOpen(false)}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md bg-[#FAF7F0] h-full flex flex-col border-l border-[#E5DCCB]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5DCCB] flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-[#242320]">Shopping Bag</h2>
            <p className="text-xs text-[#5C574F] tabular-nums">
              {cartTotals.itemCount} {cartTotals.itemCount === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close shopping bag"
            onClick={() => setCartDrawerOpen(false)}
            className="p-2 text-[#242320] hover:text-[#702F32]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Notice */}
        {cart.length > 0 && (
          <div className="px-6 py-2.5 bg-[#F3EDE0] border-b border-[#E5DCCB] text-xs text-[#34483B]">
            {cartTotals.amountToFreeShippingInr > 0 ? (
              <span>
                Add <strong className="tabular-nums">{formatInr(cartTotals.amountToFreeShippingInr)}</strong> more for
                complimentary standard shipping across India (orders above {formatInr(FREE_SHIPPING_THRESHOLD_INR)}).
              </span>
            ) : (
              <span>Complimentary standard shipping unlocked for this order.</span>
            )}
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#E5DCCB]">
          {cart.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <p className="font-display text-2xl text-[#242320]">Your bag is currently empty</p>
              <p className="text-sm text-[#5C574F] max-w-xs mx-auto">
                Explore pure daily essentials, organized pooja kits, and handcrafted Moradabad brassware.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCartDrawerOpen(false);
                  navigate({ page: 'shop' });
                }}
                className="px-6 py-2.5 bg-[#702F32] text-[#FAF7F0] text-sm font-medium hover:bg-[#582225] transition-colors"
              >
                Browse Collection
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.variantSku} className="py-4 flex gap-4">
                <div className="w-20 h-20 bg-[#F3EDE0] shrink-0 overflow-hidden border border-[#E5DCCB]">
                  <SafeImage
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-lg font-semibold text-[#242320] leading-tight">
                        {item.productName}
                      </h3>
                      <button
                        type="button"
                        aria-label={`Remove ${item.productName}`}
                        onClick={() => removeFromCart(item.variantSku)}
                        className="text-[#5C574F] hover:text-[#702F32] p-1 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-[#5C574F] mt-0.5">{item.variantLabel}</p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center border border-[#E5DCCB] bg-white">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${item.productName}`}
                        onClick={() => updateCartQty(item.variantSku, item.quantity - 1)}
                        className="p-1.5 text-[#242320] hover:bg-[#F3EDE0]"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-medium tabular-nums">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${item.productName}`}
                        onClick={() => updateCartQty(item.variantSku, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        className="p-1.5 text-[#242320] hover:bg-[#F3EDE0] disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-sm font-semibold tabular-nums text-[#242320]">
                      {formatInr(item.unitPriceInr * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Summary */}
        {cart.length > 0 && (
          <div className="border-t border-[#E5DCCB] bg-white px-6 py-5 space-y-4">
            {/* Coupon Form */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between text-xs bg-[#F3EDE0] px-3 py-2 border border-[#E5DCCB]">
                  <span className="text-[#34483B] font-medium">
                    Applied: {appliedCoupon.code} ({formatInr(cartTotals.discountInr)} saved)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      setCouponFeedback(null);
                    }}
                    className="text-[#702F32] underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <label htmlFor="cart-coupon-input" className="sr-only">
                    Coupon code
                  </label>
                  <input
                    id="cart-coupon-input"
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Coupon code (e.g. AKSHAT10)"
                    className="flex-1 px-3 py-2 text-xs bg-[#FAF7F0] border border-[#E5DCCB] text-[#242320]"
                  />
                  <button
                    type="submit"
                    disabled={applying}
                    className="px-4 py-2 text-xs font-medium border border-[#242320] text-[#242320] hover:bg-[#242320] hover:text-[#FAF7F0] transition-colors whitespace-nowrap"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponFeedback && !appliedCoupon && (
                <p className={`text-xs mt-1.5 ${couponFeedback.ok ? 'text-[#34483B]' : 'text-[#702F32]'}`}>
                  {couponFeedback.text}
                </p>
              )}
              {cartTotals.couponError && (
                <p className="text-xs mt-1.5 text-[#702F32]">{cartTotals.couponError}</p>
              )}
            </div>

            {/* Breakdown */}
            <dl className="space-y-1.5 text-xs text-[#5C574F]">
              <div className="flex justify-between">
                <dt>Subtotal (MRP incl. taxes)</dt>
                <dd className="tabular-nums text-[#242320]">{formatInr(cartTotals.subtotalInr)}</dd>
              </div>
              {cartTotals.discountInr > 0 && (
                <div className="flex justify-between text-[#34483B]">
                  <dt>Coupon Discount</dt>
                  <dd className="tabular-nums">−{formatInr(cartTotals.discountInr)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt>Estimated Standard Shipping</dt>
                <dd className="tabular-nums text-[#242320]">
                  {cartTotals.shippingInr === 0 ? 'Complimentary' : formatInr(cartTotals.shippingInr)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Included GST</dt>
                <dd className="tabular-nums">{formatInr(cartTotals.includedGstInr)}</dd>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E5DCCB] text-sm font-semibold text-[#242320]">
                <dt>Total Payable</dt>
                <dd className="tabular-nums">{formatInr(cartTotals.totalInr)}</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={() => {
                setCartDrawerOpen(false);
                navigate({ page: 'checkout' });
              }}
              className="w-full py-3 bg-[#702F32] text-[#FAF7F0] text-sm font-medium tracking-wide hover:bg-[#582225] transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
