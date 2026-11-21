export type RoutePage =
  | 'home'
  | 'shop'
  | 'product'
  | 'checkout'
  | 'account'
  | 'guides'
  | 'about'
  | 'contact'
  | 'faq'
  | 'shipping-policy'
  | 'returns-policy'
  | 'privacy-policy'
  | 'terms'
  | 'admin';

export interface RouteState {
  page: RoutePage;
  slug?: string;
  category?: string;
  festival?: string;
  search?: string;
  guideSlug?: string;
}

export interface Category {
  id: string;
  name: string;
  nameHi?: string;
  slug: string;
  description: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  isFestival: boolean;
  updatedAt?: string;
}

export interface ProductVariant {
  sku: string;
  label: string;
  weightOrCount: string;
  priceInr: number;
  compareAtPriceInr?: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  nameHi?: string;
  slug: string;
  categorySlug: string;
  festivalSlug?: string;
  shortDescription: string;
  description: string;
  ingredients?: string;
  origin: string;
  usageInstructions?: string;
  storageInstructions?: string;
  gstPercent: number;
  basePriceInr: number;
  compareAtPriceInr?: number;
  isBestseller: boolean;
  isFeatured: boolean;
  isActive: boolean;
  lowStockThreshold: number;
  totalStock: number;
  imageUrl: string;
  gallery?: string[];
  variants: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: string;
  productSlug: string;
  productName: string;
  imageUrl: string;
  variantSku: string;
  variantLabel: string;
  unitPriceInr: number;
  gstPercent: number;
  quantity: number;
  maxStock: number;
}

export type DiscountType = 'percentage' | 'flat';

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderInr: number;
  maxDiscountInr?: number;
  isActive: boolean;
  usageCount: number;
  usageLimit?: number;
  updatedAt?: string;
}

export interface HomepageConfig {
  announcementText: string;
  announcementActive: boolean;
  heroEyebrow: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaLabel: string;
  featuredFestivalSlug?: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderStatus = 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface OrderItem {
  productId: string;
  productName: string;
  variantSku: string;
  variantLabel: string;
  unitPriceInr: number;
  gstPercent: number;
  quantity: number;
  lineTotalInr: number;
}

export interface ShippingAddressSnapshot {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  idempotencyKey: string;
  userId: string;
  isGuest?: boolean;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddressSnapshot;
  items: OrderItem[];
  subtotalInr: number;
  discountInr: number;
  couponCode?: string;
  shippingInr: number;
  gstInr: number;
  totalInr: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shipmentCarrier?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export type RefundStatus = 'requested' | 'approved' | 'rejected' | 'processed';

export interface RefundRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  reason: string;
  details: string;
  amountInr: number;
  status: RefundStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export type SupportStatus = 'open' | 'in_progress' | 'resolved';

export interface SupportTicket {
  id: string;
  userId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  orderNumber?: string;
  status: SupportStatus;
  adminReply?: string;
  createdAt: string;
  updatedAt: string;
}

export type InventoryReason = 'restock' | 'order_deduction' | 'manual_adjustment' | 'return_restock';

export interface InventoryMovement {
  id: string;
  productId: string;
  variantSku: string;
  delta: number;
  reason: InventoryReason;
  note?: string;
  actorUid: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorUid: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  createdAt: string;
}

export interface RitualGuide {
  slug: string;
  title: string;
  titleHi: string;
  category: string;
  readMinutes: number;
  excerpt: string;
  imageUrl: string;
  preparationList: string[];
  steps: { heading: string; detail: string }[];
  recommendedSlugs: string[];
}
