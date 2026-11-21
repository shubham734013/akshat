import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartTotals,
  calculateLowStockProducts,
  createIdempotencyKey,
  filterAndSortProducts,
  formatInr,
  validateCheckoutForm,
  validatePincode,
} from './commerce';
import type { CartItem, Coupon, Product } from '../types/commerce';

const sampleCart: CartItem[] = [
  {
    productId: 'prod-1',
    productSlug: 'satyanarayan-pooja-kit',
    productName: 'Complete Satyanarayan Pooja Kit',
    imageUrl: '/img.jpg',
    variantSku: 'AKS-KIT-SAT-STD',
    variantLabel: 'Standard Box',
    unitPriceInr: 1299,
    gstPercent: 12,
    quantity: 1,
    maxStock: 20,
  },
];

const pctCoupon: Coupon = {
  id: 'AKSHAT10',
  code: 'AKSHAT10',
  description: '10% off above ₹599',
  discountType: 'percentage',
  discountValue: 10,
  minOrderInr: 599,
  maxDiscountInr: 250,
  isActive: true,
  usageCount: 0,
};

test('formatInr formats Indian currency without decimals', () => {
  assert.equal(formatInr(1299), '₹1,299');
  assert.equal(formatInr(125000), '₹1,25,000');
});

test('validatePincode identifies metro, regional, remote, and invalid PINs', () => {
  const mumbai = validatePincode('400001');
  assert.equal(mumbai.valid, true);
  assert.equal(mumbai.zone, 'metro');
  assert.equal(mumbai.codAvailable, true);

  const regional = validatePincode('226001');
  assert.equal(regional.valid, true);
  assert.equal(regional.zone, 'regional');

  const remote = validatePincode('793001');
  assert.equal(remote.valid, true);
  assert.equal(remote.zone, 'remote');
  assert.equal(remote.codAvailable, false);

  const bad = validatePincode('012345');
  assert.equal(bad.valid, false);
});

test('calculateCartTotals applies free shipping above ₹799, coupon cap, and GST breakdown', () => {
  const totals = calculateCartTotals(sampleCart, pctCoupon, 'standard');
  assert.equal(totals.subtotalInr, 1299);
  assert.equal(totals.discountInr, 130);
  assert.equal(totals.shippingInr, 0);
  assert.equal(totals.totalInr, 1169);
  assert.ok(totals.includedGstInr > 0);
  assert.equal(totals.couponError, undefined);
});

test('calculateCartTotals charges standard shipping below ₹799 and express when selected', () => {
  const smallCart: CartItem[] = [
    { ...sampleCart[0], unitPriceInr: 349, quantity: 1 },
  ];
  const std = calculateCartTotals(smallCart, null, 'standard');
  assert.equal(std.shippingInr, 79);
  assert.equal(std.totalInr, 428);

  const exp = calculateCartTotals(sampleCart, null, 'express');
  assert.equal(exp.shippingInr, 149);
  assert.equal(exp.totalInr, 1448);
});

test('calculateCartTotals rejects coupon when below minimum order threshold', () => {
  const smallCart: CartItem[] = [{ ...sampleCart[0], unitPriceInr: 399, quantity: 1 }];
  const res = calculateCartTotals(smallCart, pctCoupon, 'standard');
  assert.equal(res.discountInr, 0);
  assert.ok(res.couponError && res.couponError.includes('AKSHAT10'));
});

test('validateCheckoutForm rejects empty or invalid Indian checkout fields', () => {
  const invalid = validateCheckoutForm({
    fullName: '',
    email: 'not-an-email',
    phone: '12345',
    line1: 'A',
    city: '',
    state: '',
    pincode: '000000',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.fullName);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.phone);
  assert.ok(invalid.errors.pincode);

  const valid = validateCheckoutForm({
    fullName: 'Aarav Kulkarni',
    email: 'aarav@example.in',
    phone: '9876543210',
    line1: '14 Lotus Residency, Prabhat Road',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411004',
  });
  assert.equal(valid.valid, true);
});

test('filterAndSortProducts filters by category, search, stock, and sorts cleanly', () => {
  const products: Product[] = [
    {
      id: 'p1',
      name: 'Kashi Kumkum Jar',
      slug: 'kashi-kumkum',
      categorySlug: 'daily-pooja-essentials',
      shortDescription: 'Pure haldi-based kumkum',
      description: 'Traditional turmeric kumkum',
      origin: 'Varanasi, UP',
      gstPercent: 5,
      basePriceInr: 199,
      isBestseller: true,
      isFeatured: true,
      isActive: true,
      lowStockThreshold: 10,
      totalStock: 40,
      imageUrl: '/a.jpg',
      variants: [],
    },
    {
      id: 'p2',
      name: 'Solid Brass Akhand Diya',
      slug: 'brass-akhand-diya',
      categorySlug: 'devotional-accessories',
      shortDescription: 'Moradabad cast brass',
      description: 'Hand-finished brass lamp',
      origin: 'Moradabad, UP',
      gstPercent: 12,
      basePriceInr: 899,
      isBestseller: false,
      isFeatured: true,
      isActive: true,
      lowStockThreshold: 10,
      totalStock: 4,
      imageUrl: '/b.jpg',
      variants: [],
    },
  ];

  const byCat = filterAndSortProducts(products, { categorySlug: 'daily-pooja-essentials' });
  assert.equal(byCat.length, 1);
  assert.equal(byCat[0].id, 'p1');

  const byPriceDesc = filterAndSortProducts(products, { sortBy: 'price-desc' });
  assert.equal(byPriceDesc[0].id, 'p2');

  const lowStock = calculateLowStockProducts(products);
  assert.equal(lowStock.length, 1);
  assert.equal(lowStock[0].id, 'p2');
});

test('createIdempotencyKey is deterministic for duplicate submission clicks', () => {
  const k1 = createIdempotencyKey(sampleCart, 'buyer@example.in', '400001');
  const k2 = createIdempotencyKey(sampleCart, 'BUYER@example.in', '400001');
  assert.equal(k1, k2);
});
