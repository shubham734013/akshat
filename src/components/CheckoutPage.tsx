import React, { useEffect, useState } from 'react';
import { CheckCircle2, Lock, ShieldCheck, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { INDIAN_STATES } from '../data/catalog';
import type { Order, PaymentMethod } from '../types/commerce';
import {
  createIdempotencyKey,
  EXPRESS_SHIPPING_INR,
  formatInr,
  FREE_SHIPPING_THRESHOLD_INR,
  generateOrderNumber,
  STANDARD_SHIPPING_INR,
  validateCheckoutForm,
  validatePincode,
  type CheckoutFormInput,
} from '../utils/commerce';
import { createFirestoreOrder } from '../services/firestoreService';

export const CheckoutPage: React.FC = () => {
  const {
    user,
    profile,
    addresses,
    cart,
    cartTotals,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    shippingMethod,
    setShippingMethod,
    clearCart,
    addGuestOrder,
    navigate,
    signInWithGoogle,
    showToast,
  } = useStore();

  const [form, setForm] = useState<CheckoutFormInput>({
    fullName: profile?.displayName || user?.displayName || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    line1: '',
    line2: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormInput, string>>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [couponInput, setCouponInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || profile?.displayName || user.displayName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || profile?.phone || '',
      }));
    }
  }, [user, profile]);

  const pinInfo = form.pincode.length === 6 ? validatePincode(form.pincode) : null;

  const applySavedAddress = (addrId: string) => {
    const found = addresses.find((a) => a.id === addrId);
    if (!found) return;
    setForm((prev) => ({
      ...prev,
      fullName: found.fullName,
      phone: found.phone,
      line1: found.line1,
      line2: found.line2 || '',
      city: found.city,
      state: found.state,
      pincode: found.pincode,
    }));
    setErrors({});
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || cart.length === 0) return;

    const validation = validateCheckoutForm(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      showToast('Please complete all required shipping details.', 'error');
      return;
    }

    const pinCheck = validatePincode(form.pincode);
    if (paymentMethod === 'cod' && !pinCheck.codAvailable) {
      setErrors({ pincode: 'Cash on Delivery is unavailable for this remote PIN zone. Select UPI, Card, or NetBanking.' });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const idempotencyKey = createIdempotencyKey(cart, form.email, form.pincode);
      const orderNumber = generateOrderNumber();

      const orderPayload: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
        orderNumber,
        idempotencyKey,
        userId: user ? user.uid : `guest-${idempotencyKey}`,
        isGuest: !user,
        customerName: form.fullName.trim(),
        customerEmail: form.email.trim(),
        customerPhone: form.phone.trim(),
        shippingAddress: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          line1: form.line1.trim(),
          line2: form.line2?.trim() || undefined,
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        },
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          variantSku: item.variantSku,
          variantLabel: item.variantLabel,
          unitPriceInr: item.unitPriceInr,
          gstPercent: item.gstPercent,
          quantity: item.quantity,
          lineTotalInr: item.unitPriceInr * item.quantity,
        })),
        subtotalInr: cartTotals.subtotalInr,
        discountInr: cartTotals.discountInr,
        couponCode: appliedCoupon?.code,
        shippingInr: cartTotals.shippingInr,
        gstInr: cartTotals.includedGstInr,
        totalInr: cartTotals.totalInr,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        orderStatus: 'confirmed',
      };

      let finalOrder: Order;
      if (user) {
        finalOrder = await createFirestoreOrder(orderPayload);
      } else {
        const now = new Date().toISOString();
        finalOrder = {
          ...orderPayload,
          id: idempotencyKey,
          createdAt: now,
          updatedAt: now,
        };
        addGuestOrder(finalOrder);
      }

      clearCart();
      setConfirmedOrder(finalOrder);
      showToast(`Order ${finalOrder.orderNumber} confirmed.`, 'success');
    } catch {
      showToast('Could not place order. Please review your details and try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <div className="bg-white border border-[#E5DCCB] p-8 sm:p-10 space-y-6">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-8 h-8 text-[#34483B] shrink-0 mt-1" />
            <div className="space-y-1.5">
              <p className="text-xs tracking-[0.14em] text-[#34483B] font-medium">Order Confirmed</p>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#242320]">
                Order <span className="font-sans text-2xl sm:text-3xl font-semibold tabular-nums tracking-tight">#{confirmedOrder.orderNumber}</span> — Preparing Shipment
              </h1>
              <p className="text-sm text-[#5C574F]">
                Confirmation prepared for <strong>{confirmedOrder.customerEmail}</strong>. Duplicate-order protection
                key: <span className="font-mono text-xs">{confirmedOrder.idempotencyKey}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-y border-[#E5DCCB] text-sm">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#5C574F]">Shipping To</p>
              <p className="font-medium text-[#242320]">{confirmedOrder.shippingAddress.fullName}</p>
              <p className="text-[#5C574F]">{confirmedOrder.shippingAddress.line1}</p>
              {confirmedOrder.shippingAddress.line2 && (
                <p className="text-[#5C574F]">{confirmedOrder.shippingAddress.line2}</p>
              )}
              <p className="text-[#5C574F]">
                {confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.state} —{' '}
                <span className="tabular-nums">{confirmedOrder.shippingAddress.pincode}</span>
              </p>
              <p className="text-[#5C574F] tabular-nums">{confirmedOrder.shippingAddress.phone}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#5C574F]">Payment & Fulfillment</p>
              <p className="text-[#242320] capitalize">
                Method: {confirmedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : confirmedOrder.paymentMethod.toUpperCase()}
              </p>
              <p className="text-[#242320] capitalize">Payment Status: {confirmedOrder.paymentStatus}</p>
              <p className="text-[#34483B] font-medium capitalize">Order Status: {confirmedOrder.orderStatus}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-[#242320]">Order Summary</h2>
            <ul className="divide-y divide-[#E5DCCB] text-sm">
              {confirmedOrder.items.map((item) => (
                <li key={item.variantSku} className="py-2.5 flex justify-between gap-4">
                  <span>
                    {item.productName} <span className="text-xs text-[#5C574F]">({item.variantLabel} × {item.quantity})</span>
                  </span>
                  <span className="font-medium tabular-nums">{formatInr(item.lineTotalInr)}</span>
                </li>
              ))}
            </ul>
            <dl className="pt-4 border-t border-[#E5DCCB] space-y-1.5 text-sm">
              <div className="flex justify-between text-[#5C574F]">
                <dt>Subtotal</dt>
                <dd className="tabular-nums">{formatInr(confirmedOrder.subtotalInr)}</dd>
              </div>
              {confirmedOrder.discountInr > 0 && (
                <div className="flex justify-between text-[#34483B]">
                  <dt>Discount {confirmedOrder.couponCode ? `(${confirmedOrder.couponCode})` : ''}</dt>
                  <dd className="tabular-nums">−{formatInr(confirmedOrder.discountInr)}</dd>
                </div>
              )}
              <div className="flex justify-between text-[#5C574F]">
                <dt>Shipping</dt>
                <dd className="tabular-nums">
                  {confirmedOrder.shippingInr === 0 ? 'Complimentary' : formatInr(confirmedOrder.shippingInr)}
                </dd>
              </div>
              <div className="flex justify-between text-[#5C574F]">
                <dt>Included GST</dt>
                <dd className="tabular-nums">{formatInr(confirmedOrder.gstInr)}</dd>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E5DCCB] text-base font-semibold text-[#242320]">
                <dt>Total Paid / Payable</dt>
                <dd className="tabular-nums">{formatInr(confirmedOrder.totalInr)}</dd>
              </div>
            </dl>
          </div>

          <div className="pt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate({ page: 'account' })}
              className="px-6 py-3 bg-[#702F32] text-[#FAF7F0] text-sm font-medium hover:bg-[#582225] transition-colors"
            >
              Track in My Orders
            </button>
            <button
              type="button"
              onClick={() => navigate({ page: 'shop' })}
              className="px-6 py-3 border border-[#242320] text-[#242320] text-sm font-medium hover:bg-[#242320] hover:text-[#FAF7F0] transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-24 text-center space-y-5">
        <h1 className="font-display text-4xl font-semibold text-[#242320]">Your shopping bag is empty</h1>
        <p className="text-sm text-[#5C574F]">Add pooja essentials or a ritual kit before proceeding to checkout.</p>
        <button
          type="button"
          onClick={() => navigate({ page: 'shop' })}
          className="px-6 py-3 bg-[#702F32] text-[#FAF7F0] text-sm font-medium hover:bg-[#582225]"
        >
          Browse Collection
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="pb-6 border-b border-[#E5DCCB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.14em] text-[#702F32] font-medium">Secure Checkout</p>
          <h1 className="font-display text-4xl font-semibold text-[#242320]">Complete Your Order</h1>
        </div>
        {!user && (
          <div className="flex items-center gap-3 text-xs text-[#5C574F]">
            <span>Checking out as Guest</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => void signInWithGoogle()}
              className="text-[#702F32] font-medium underline"
            >
              Sign in with Google to sync order history
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handlePlaceOrder} noValidate className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Shipping + Delivery + Payment */}
        <div className="lg:col-span-7 space-y-8">
          {/* Saved Addresses Picker */}
          {addresses.length > 0 && (
            <section className="p-5 bg-[#F3EDE0]/70 border border-[#E5DCCB] space-y-3">
              <h2 className="font-display text-xl font-semibold text-[#242320]">Saved Addresses</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => applySavedAddress(addr.id)}
                    className="p-3.5 text-left bg-white border border-[#E5DCCB] hover:border-[#702F32] text-xs space-y-1"
                  >
                    <p className="font-semibold text-[#242320]">{addr.label} · {addr.fullName}</p>
                    <p className="text-[#5C574F]">{addr.line1}, {addr.city} — {addr.pincode}</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* 1. Contact & Shipping Address */}
          <section className="bg-white border border-[#E5DCCB] p-6 sm:p-8 space-y-5">
            <h2 className="font-display text-2xl font-semibold text-[#242320]">1. Shipping Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="chk-name" className="block text-xs font-medium text-[#242320] mb-1">
                  Full Name *
                </label>
                <input
                  id="chk-name"
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E5DCCB] text-sm"
                />
                {errors.fullName && <p className="text-xs text-[#702F32] mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="chk-email" className="block text-xs font-medium text-[#242320] mb-1">
                  Email Address *
                </label>
                <input
                  id="chk-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E5DCCB] text-sm"
                />
                {errors.email && <p className="text-xs text-[#702F32] mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="chk-phone" className="block text-xs font-medium text-[#242320] mb-1">
                  Mobile Number (India) *
                </label>
                <input
                  id="chk-phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E5DCCB] text-sm tabular-nums"
                />
                {errors.phone && <p className="text-xs text-[#702F32] mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="chk-pincode" className="block text-xs font-medium text-[#242320] mb-1">
                  PIN Code (6 digits) *
                </label>
                <input
                  id="chk-pincode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  placeholder="400001"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E5DCCB] text-sm tabular-nums"
                />
                {errors.pincode && <p className="text-xs text-[#702F32] mt-1">{errors.pincode}</p>}
                {pinInfo && pinInfo.valid && !errors.pincode && (
                  <p className="text-xs text-[#34483B] mt-1">
                    Standard: {pinInfo.standardDays} · Express: {pinInfo.expressDays}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="chk-line1" className="block text-xs font-medium text-[#242320] mb-1">
                Flat, House No., Building, Street *
              </label>
              <input
                id="chk-line1"
                type="text"
                required
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E5DCCB] text-sm"
              />
              {errors.line1 && <p className="text-xs text-[#702F32] mt-1">{errors.line1}</p>}
            </div>

            <div>
              <label htmlFor="chk-line2" className="block text-xs font-medium text-[#242320] mb-1">
                Landmark / Area (Optional)
              </label>
              <input
                id="chk-line2"
                type="text"
                value={form.line2 || ''}
                onChange={(e) => setForm({ ...form, line2: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E5DCCB] text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="chk-city" className="block text-xs font-medium text-[#242320] mb-1">
                  City *
                </label>
                <input
                  id="chk-city"
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E5DCCB] text-sm"
                />
                {errors.city && <p className="text-xs text-[#702F32] mt-1">{errors.city}</p>}
              </div>

              <div>
                <label htmlFor="chk-state" className="block text-xs font-medium text-[#242320] mb-1">
                  State *
                </label>
                <select
                  id="chk-state"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-[#E5DCCB] text-sm"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                {errors.state && <p className="text-xs text-[#702F32] mt-1">{errors.state}</p>}
              </div>
            </div>
          </section>

          {/* 2. Shipping Method */}
          <section className="bg-white border border-[#E5DCCB] p-6 sm:p-8 space-y-4">
            <h2 className="font-display text-2xl font-semibold text-[#242320] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#702F32]" />
              <span>2. Delivery Speed</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-4 border cursor-pointer flex items-start gap-3 ${
                  shippingMethod === 'standard' ? 'border-[#702F32] bg-[#FAF7F0]' : 'border-[#E5DCCB]'
                }`}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  checked={shippingMethod === 'standard'}
                  onChange={() => setShippingMethod('standard')}
                  className="mt-1 accent-[#702F32]"
                />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-[#242320]">
                    Standard Courier ·{' '}
                    {cartTotals.subtotalInr - cartTotals.discountInr >= FREE_SHIPPING_THRESHOLD_INR
                      ? 'Complimentary'
                      : formatInr(STANDARD_SHIPPING_INR)}
                  </p>
                  <p className="text-[#5C574F]">2–5 business days across India</p>
                </div>
              </label>

              <label
                className={`p-4 border cursor-pointer flex items-start gap-3 ${
                  shippingMethod === 'express' ? 'border-[#702F32] bg-[#FAF7F0]' : 'border-[#E5DCCB]'
                }`}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  checked={shippingMethod === 'express'}
                  onChange={() => setShippingMethod('express')}
                  className="mt-1 accent-[#702F32]"
                />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-[#242320]">
                    Express Air · {formatInr(EXPRESS_SHIPPING_INR)}
                  </p>
                  <p className="text-[#5C574F]">1–3 business days priority dispatch</p>
                </div>
              </label>
            </div>
          </section>

          {/* 3. Payment Method */}
          <section className="bg-white border border-[#E5DCCB] p-6 sm:p-8 space-y-4">
            <h2 className="font-display text-2xl font-semibold text-[#242320] flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#702F32]" />
              <span>3. Payment Method</span>
            </h2>
            <p className="text-xs text-[#5C574F]">
              Razorpay-compatible payment checkout layer with idempotent order creation to prevent duplicate charges.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  { id: 'upi', label: 'UPI (GPay, PhonePe, BHIM)', desc: 'Instant confirmation · Zero convenience fee' },
                  { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
                  { id: 'netbanking', label: 'NetBanking', desc: 'All major Indian banks' },
                  { id: 'cod', label: 'Cash on Delivery (COD)', desc: 'Pay in cash or UPI upon delivery' },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.id}
                  className={`p-4 border cursor-pointer flex items-start gap-3 ${
                    paymentMethod === opt.id ? 'border-[#702F32] bg-[#FAF7F0]' : 'border-[#E5DCCB]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === opt.id}
                    onChange={() => setPaymentMethod(opt.id)}
                    className="mt-1 accent-[#702F32]"
                  />
                  <div className="text-xs space-y-0.5">
                    <p className="font-semibold text-[#242320]">{opt.label}</p>
                    <p className="text-[#5C574F]">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Sticky Order Summary */}
        <aside className="lg:col-span-5 lg:sticky lg:top-24 bg-white border border-[#E5DCCB] p-6 sm:p-8 space-y-6">
          <h2 className="font-display text-2xl font-semibold text-[#242320]">Order Summary</h2>

          <ul className="divide-y divide-[#E5DCCB] max-h-72 overflow-y-auto pr-1">
            {cart.map((item) => (
              <li key={item.variantSku} className="py-3 flex justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-[#242320] truncate">{item.productName}</p>
                  <p className="text-xs text-[#5C574F]">
                    {item.variantLabel} · Qty {item.quantity}
                  </p>
                </div>
                <span className="font-medium tabular-nums shrink-0">
                  {formatInr(item.unitPriceInr * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          {/* Coupon inside Checkout */}
          <div className="pt-2 border-t border-[#E5DCCB]">
            {appliedCoupon ? (
              <div className="flex items-center justify-between text-xs bg-[#F3EDE0] px-3 py-2">
                <span className="text-[#34483B] font-medium">
                  Coupon {appliedCoupon.code} applied (−{formatInr(cartTotals.discountInr)})
                </span>
                <button type="button" onClick={removeCoupon} className="text-[#702F32] underline">
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <label htmlFor="chk-coupon" className="sr-only">
                  Promo code
                </label>
                <input
                  id="chk-coupon"
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Promo code (AKSHAT10)"
                  className="flex-1 px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB] text-xs"
                />
                <button
                  type="button"
                  onClick={async () => {
                    const res = await applyCouponCode(couponInput);
                    showToast(res.message, res.ok ? 'success' : 'error');
                    if (res.ok) setCouponInput('');
                  }}
                  className="px-4 py-2 border border-[#242320] text-xs font-medium hover:bg-[#242320] hover:text-[#FAF7F0]"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          <dl className="space-y-2 text-sm border-t border-[#E5DCCB] pt-4">
            <div className="flex justify-between text-[#5C574F]">
              <dt>Subtotal (MRP incl. taxes)</dt>
              <dd className="tabular-nums text-[#242320]">{formatInr(cartTotals.subtotalInr)}</dd>
            </div>
            {cartTotals.discountInr > 0 && (
              <div className="flex justify-between text-[#34483B]">
                <dt>Discount</dt>
                <dd className="tabular-nums">−{formatInr(cartTotals.discountInr)}</dd>
              </div>
            )}
            <div className="flex justify-between text-[#5C574F]">
              <dt>Shipping ({shippingMethod === 'express' ? 'Express' : 'Standard'})</dt>
              <dd className="tabular-nums text-[#242320]">
                {cartTotals.shippingInr === 0 ? 'Complimentary' : formatInr(cartTotals.shippingInr)}
              </dd>
            </div>
            <div className="flex justify-between text-xs text-[#5C574F]">
              <dt>Included GST Component</dt>
              <dd className="tabular-nums">{formatInr(cartTotals.includedGstInr)}</dd>
            </div>
            <div className="flex justify-between pt-3 border-t border-[#E5DCCB] text-base font-semibold text-[#242320]">
              <dt>Total Payable</dt>
              <dd className="tabular-nums">{formatInr(cartTotals.totalInr)}</dd>
            </div>
          </dl>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-[#702F32] text-[#FAF7F0] text-sm font-medium tracking-wide hover:bg-[#582225] disabled:opacity-50 transition-colors"
          >
            {submitting
              ? 'Confirming Order...'
              : paymentMethod === 'cod'
              ? `Place COD Order (${formatInr(cartTotals.totalInr)})`
              : `Confirm & Pay ${formatInr(cartTotals.totalInr)}`}
          </button>

          <div className="flex items-start gap-2 text-xs text-[#5C574F]">
            <ShieldCheck className="w-4 h-4 text-[#34483B] shrink-0 mt-0.5" />
            <span>
              Transparent Indian MRP pricing with 7-day unopened return eligibility and transit-damage replacement.
            </span>
          </div>
        </aside>
      </form>
    </main>
  );
};
