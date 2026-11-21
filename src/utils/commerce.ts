import type { CartItem, Coupon, Product } from '../types/commerce';

export const FREE_SHIPPING_THRESHOLD_INR = 799;
export const STANDARD_SHIPPING_INR = 79;
export const EXPRESS_SHIPPING_INR = 149;

export function formatInr(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(safe);
}

export interface PincodeServiceability {
  valid: boolean;
  serviceable: boolean;
  zone: 'metro' | 'regional' | 'remote' | 'invalid';
  standardDays: string;
  expressDays: string;
  codAvailable: boolean;
  message: string;
}

const METRO_PREFIXES = new Set([
  '110', '122', '201', // Delhi NCR
  '400', '401', '411', // Mumbai & Pune
  '560', // Bengaluru
  '500', // Hyderabad
  '600', // Chennai
  '700', // Kolkata
  '380', // Ahmedabad
  '302', // Jaipur
]);

const REMOTE_PREFIXES = new Set(['790', '791', '792', '793', '794', '795', '796', '797', '798', '799', '744', '194']);

export function validatePincode(raw: string): PincodeServiceability {
  const pin = raw.trim();
  if (!/^[1-9][0-9]{5}$/.test(pin)) {
    return {
      valid: false,
      serviceable: false,
      zone: 'invalid',
      standardDays: '',
      expressDays: '',
      codAvailable: false,
      message: 'Please enter a valid 6-digit Indian PIN code.',
    };
  }

  const prefix = pin.slice(0, 3);
  if (METRO_PREFIXES.has(prefix)) {
    return {
      valid: true,
      serviceable: true,
      zone: 'metro',
      standardDays: '2–3 business days',
      expressDays: '1–2 business days',
      codAvailable: true,
      message: `Deliverable to ${pin}. Standard delivery in 2–3 business days; Express in 1–2 days. Cash on Delivery available.`,
    };
  }

  if (REMOTE_PREFIXES.has(prefix)) {
    return {
      valid: true,
      serviceable: true,
      zone: 'remote',
      standardDays: '6–8 business days',
      expressDays: '4–5 business days',
      codAvailable: false,
      message: `Deliverable to ${pin}. Standard delivery in 6–8 business days. Prepaid orders only for this zone.`,
    };
  }

  return {
    valid: true,
    serviceable: true,
    zone: 'regional',
    standardDays: '3–5 business days',
    expressDays: '2–3 business days',
    codAvailable: true,
    message: `Deliverable to ${pin}. Standard delivery in 3–5 business days; Express in 2–3 days. Cash on Delivery available.`,
  };
}

export interface CartTotals {
  itemCount: number;
  subtotalInr: number;
  discountInr: number;
  shippingInr: number;
  includedGstInr: number;
  totalInr: number;
  amountToFreeShippingInr: number;
  couponError?: string;
}

export function calculateCouponDiscount(subtotalInr: number, coupon: Coupon | null): { discountInr: number; error?: string } {
  if (!coupon) return { discountInr: 0 };
  if (!coupon.isActive) {
    return { discountInr: 0, error: 'This coupon code is no longer active.' };
  }
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { discountInr: 0, error: 'This coupon has reached its redemption limit.' };
  }
  if (subtotalInr < coupon.minOrderInr) {
    return {
      discountInr: 0,
      error: `Minimum order of ${formatInr(coupon.minOrderInr)} required for ${coupon.code}.`,
    };
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.round((subtotalInr * coupon.discountValue) / 100);
    if (coupon.maxDiscountInr && discount > coupon.maxDiscountInr) {
      discount = coupon.maxDiscountInr;
    }
  } else {
    discount = Math.round(coupon.discountValue);
  }

  return { discountInr: Math.min(discount, subtotalInr) };
}

export function calculateCartTotals(
  items: CartItem[],
  coupon: Coupon | null,
  shippingMethod: 'standard' | 'express' = 'standard'
): CartTotals {
  const itemCount = items.reduce((sum, item) => sum + Math.max(0, item.quantity), 0);
  const subtotalInr = items.reduce((sum, item) => sum + item.unitPriceInr * Math.max(0, item.quantity), 0);

  if (itemCount === 0) {
    return {
      itemCount: 0,
      subtotalInr: 0,
      discountInr: 0,
      shippingInr: 0,
      includedGstInr: 0,
      totalInr: 0,
      amountToFreeShippingInr: FREE_SHIPPING_THRESHOLD_INR,
    };
  }

  const { discountInr, error: couponError } = calculateCouponDiscount(subtotalInr, coupon);
  const netMerchandise = Math.max(0, subtotalInr - discountInr);

  // Prices in India are MRP-inclusive of GST; compute transparent GST component
  const rawGst = items.reduce((sum, item) => {
    const lineTotal = item.unitPriceInr * item.quantity;
    const rate = item.gstPercent / 100;
    const gstComponent = rate > 0 ? lineTotal - lineTotal / (1 + rate) : 0;
    return sum + gstComponent;
  }, 0);
  const discountRatio = subtotalInr > 0 ? netMerchandise / subtotalInr : 1;
  const includedGstInr = Math.round(rawGst * discountRatio);

  let shippingInr = 0;
  if (shippingMethod === 'express') {
    shippingInr = EXPRESS_SHIPPING_INR;
  } else {
    shippingInr = netMerchandise >= FREE_SHIPPING_THRESHOLD_INR ? 0 : STANDARD_SHIPPING_INR;
  }

  const totalInr = Math.max(0, netMerchandise + shippingInr);
  const amountToFreeShippingInr = Math.max(0, FREE_SHIPPING_THRESHOLD_INR - netMerchandise);

  return {
    itemCount,
    subtotalInr,
    discountInr,
    shippingInr,
    includedGstInr,
    totalInr,
    amountToFreeShippingInr,
    couponError,
  };
}

export interface ProductFilterOptions {
  categorySlug?: string;
  festivalSlug?: string;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'name';
}

export function filterAndSortProducts(products: Product[], options: ProductFilterOptions): Product[] {
  const query = (options.searchQuery || '').trim().toLowerCase();

  const filtered = products.filter((p) => {
    if (!p.isActive) return false;
    if (options.categorySlug && options.categorySlug !== 'all' && p.categorySlug !== options.categorySlug) {
      return false;
    }
    if (options.festivalSlug && options.festivalSlug !== 'all' && p.festivalSlug !== options.festivalSlug) {
      return false;
    }
    if (options.inStockOnly && p.totalStock <= 0) {
      return false;
    }
    if (typeof options.minPrice === 'number' && p.basePriceInr < options.minPrice) {
      return false;
    }
    if (typeof options.maxPrice === 'number' && options.maxPrice > 0 && p.basePriceInr > options.maxPrice) {
      return false;
    }
    if (query) {
      const haystack = [
        p.name,
        p.nameHi || '',
        p.shortDescription,
        p.description,
        p.categorySlug,
        p.festivalSlug || '',
        p.origin,
        p.ingredients || '',
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  switch (options.sortBy) {
    case 'price-asc':
      sorted.sort((a, b) => a.basePriceInr - b.basePriceInr);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.basePriceInr - a.basePriceInr);
      break;
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'featured':
    default:
      sorted.sort((a, b) => {
        const scoreA = (a.isBestseller ? 2 : 0) + (a.isFeatured ? 1 : 0);
        const scoreB = (b.isBestseller ? 2 : 0) + (b.isFeatured ? 1 : 0);
        return scoreB - scoreA || a.basePriceInr - b.basePriceInr;
      });
      break;
  }

  return sorted;
}

export interface CheckoutFormInput {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CheckoutValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof CheckoutFormInput, string>>;
}

export function validateCheckoutForm(input: CheckoutFormInput): CheckoutValidationResult {
  const errors: Partial<Record<keyof CheckoutFormInput, string>> = {};

  if (!input.fullName.trim() || input.fullName.trim().length < 2) {
    errors.fullName = 'Enter the recipient full name.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.email = 'Enter a valid email address for order updates.';
  }
  const cleanPhone = input.phone.replace(/[\s\-+]/g, '');
  if (!/^(91)?[6-9][0-9]{9}$/.test(cleanPhone)) {
    errors.phone = 'Enter a valid 10-digit Indian mobile number.';
  }
  if (!input.line1.trim() || input.line1.trim().length < 5) {
    errors.line1 = 'Enter house number, street, and locality.';
  }
  if (!input.city.trim() || input.city.trim().length < 2) {
    errors.city = 'Enter city name.';
  }
  if (!input.state.trim() || input.state.trim().length < 2) {
    errors.state = 'Select or enter state.';
  }
  const pinCheck = validatePincode(input.pincode);
  if (!pinCheck.valid) {
    errors.pincode = pinCheck.message;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function createIdempotencyKey(items: CartItem[], email: string, pincode: string): string {
  const signature = items
    .map((i) => `${i.variantSku}x${i.quantity}`)
    .sort()
    .join('_');
  const timeBucket = Math.floor(Date.now() / 60000); // 1-minute window to prevent accidental double clicks
  const raw = `${email.trim().toLowerCase()}-${pincode.trim()}-${signature}-${timeBucket}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 31 + raw.charCodeAt(i)) | 0;
  }
  return `IDEM-${Math.abs(hash).toString(36).toUpperCase()}-${timeBucket.toString(36).toUpperCase()}`;
}

export function generateOrderNumber(): string {
  const now = new Date();
  const ym = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `AKS-${ym}-${rand}`;
}

export function calculateLowStockProducts(products: Product[]): Product[] {
  return products.filter((p) => p.isActive && p.totalStock <= p.lowStockThreshold);
}
