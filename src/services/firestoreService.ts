import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import type {
  Address,
  AuditLog,
  Category,
  Coupon,
  HomepageConfig,
  InventoryMovement,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  RefundRequest,
  RefundStatus,
  Review,
  SupportStatus,
  SupportTicket,
  UserProfile,
} from '../types/commerce';
import {
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_HOMEPAGE_CONFIG,
  INITIAL_PRODUCTS,
} from '../data/catalog';

function toIso(val: unknown): string {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

function makeSafeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// Public Catalog Subscriptions
export function subscribeCategories(cb: (items: Category[]) => void): Unsubscribe {
  const path = 'categories';
  const q = query(collection(db, path), orderBy('displayOrder', 'asc'));
  return onSnapshot(
    q,
    (snap) => {
      const items: Category[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: String(data.name || ''),
          nameHi: data.nameHi ? String(data.nameHi) : undefined,
          slug: String(data.slug || ''),
          description: String(data.description || ''),
          imageUrl: data.imageUrl ? String(data.imageUrl) : undefined,
          displayOrder: Number(data.displayOrder ?? 0),
          isActive: Boolean(data.isActive),
          isFestival: Boolean(data.isFestival),
          updatedAt: toIso(data.updatedAt),
        };
      });
      cb(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export function subscribeProducts(cb: (items: Product[]) => void): Unsubscribe {
  const path = 'products';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const items: Product[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: String(data.name || ''),
          nameHi: data.nameHi ? String(data.nameHi) : undefined,
          slug: String(data.slug || ''),
          categorySlug: String(data.categorySlug || ''),
          festivalSlug: data.festivalSlug ? String(data.festivalSlug) : undefined,
          shortDescription: String(data.shortDescription || ''),
          description: String(data.description || ''),
          ingredients: data.ingredients ? String(data.ingredients) : undefined,
          origin: String(data.origin || ''),
          usageInstructions: data.usageInstructions ? String(data.usageInstructions) : undefined,
          storageInstructions: data.storageInstructions ? String(data.storageInstructions) : undefined,
          gstPercent: Number(data.gstPercent ?? 12),
          basePriceInr: Number(data.basePriceInr ?? 0),
          compareAtPriceInr: typeof data.compareAtPriceInr === 'number' ? data.compareAtPriceInr : undefined,
          isBestseller: Boolean(data.isBestseller),
          isFeatured: Boolean(data.isFeatured),
          isActive: Boolean(data.isActive),
          lowStockThreshold: Number(data.lowStockThreshold ?? 5),
          totalStock: Number(data.totalStock ?? 0),
          imageUrl: String(data.imageUrl || ''),
          gallery: Array.isArray(data.gallery) ? data.gallery.map(String) : undefined,
          variants: Array.isArray(data.variants) ? data.variants : [],
          createdAt: toIso(data.createdAt),
          updatedAt: toIso(data.updatedAt),
        };
      });
      cb(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export function subscribeHomepageConfig(cb: (cfg: HomepageConfig | null) => void): Unsubscribe {
  const path = 'homepage_config/main';
  return onSnapshot(
    doc(db, 'homepage_config', 'main'),
    (snap) => {
      if (!snap.exists()) {
        cb(null);
        return;
      }
      const data = snap.data();
      cb({
        announcementText: String(data.announcementText || ''),
        announcementActive: Boolean(data.announcementActive),
        heroEyebrow: String(data.heroEyebrow || ''),
        heroHeadline: String(data.heroHeadline || ''),
        heroSubheadline: String(data.heroSubheadline || ''),
        heroCtaLabel: String(data.heroCtaLabel || ''),
        featuredFestivalSlug: data.featuredFestivalSlug ? String(data.featuredFestivalSlug) : undefined,
        updatedAt: toIso(data.updatedAt),
      });
    },
    (error) => handleFirestoreError(error, OperationType.GET, path)
  );
}

export function subscribeReviews(cb: (items: Review[]) => void): Unsubscribe {
  const path = 'reviews';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const items: Review[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          productId: String(data.productId || ''),
          userId: String(data.userId || ''),
          authorName: String(data.authorName || ''),
          rating: Number(data.rating ?? 5),
          title: String(data.title || ''),
          body: String(data.body || ''),
          verifiedPurchase: Boolean(data.verifiedPurchase),
          createdAt: toIso(data.createdAt),
        };
      });
      cb(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export async function lookupCouponByCode(rawCode: string): Promise<Coupon | null> {
  const code = rawCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  if (code.length < 3 || code.length > 32) return null;
  const path = `coupons/${code}`;
  try {
    const snap = await getDoc(doc(db, 'coupons', code));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: snap.id,
      code: String(data.code || snap.id),
      description: String(data.description || ''),
      discountType: data.discountType === 'flat' ? 'flat' : 'percentage',
      discountValue: Number(data.discountValue ?? 0),
      minOrderInr: Number(data.minOrderInr ?? 0),
      maxDiscountInr: typeof data.maxDiscountInr === 'number' ? data.maxDiscountInr : undefined,
      isActive: Boolean(data.isActive),
      usageCount: Number(data.usageCount ?? 0),
      usageLimit: typeof data.usageLimit === 'number' ? data.usageLimit : undefined,
      updatedAt: toIso(data.updatedAt),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// User Profile, Addresses & Wishlist
export async function ensureUserProfile(uid: string, email: string, displayName: string): Promise<UserProfile> {
  const path = `users/${uid}`;
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return {
        uid,
        email: String(data.email || email),
        displayName: String(data.displayName || displayName),
        phone: data.phone ? String(data.phone) : undefined,
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
      };
    }
    const cleanName = (displayName || email.split('@')[0] || 'AKSHAT Customer').slice(0, 120);
    await setDoc(ref, {
      uid,
      email: email.slice(0, 200),
      displayName: cleanName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return {
      uid,
      email,
      displayName: cleanName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateUserProfile(uid: string, displayName: string, phone: string): Promise<void> {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      displayName: displayName.trim().slice(0, 120),
      phone: phone.trim().slice(0, 20),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function checkIsAdmin(uid: string): Promise<boolean> {
  const path = `admins/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'admins', uid));
    return snap.exists();
  } catch {
    return false;
  }
}

export function subscribeUserAddresses(uid: string, cb: (items: Address[]) => void): Unsubscribe {
  const path = `users/${uid}/addresses`;
  return onSnapshot(
    collection(db, 'users', uid, 'addresses'),
    (snap) => {
      const items: Address[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: uid,
          label: String(data.label || 'Home'),
          fullName: String(data.fullName || ''),
          phone: String(data.phone || ''),
          line1: String(data.line1 || ''),
          line2: data.line2 ? String(data.line2) : undefined,
          city: String(data.city || ''),
          state: String(data.state || ''),
          pincode: String(data.pincode || ''),
          isDefault: Boolean(data.isDefault),
          createdAt: toIso(data.createdAt),
          updatedAt: toIso(data.updatedAt),
        };
      });
      cb(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export async function saveUserAddress(
  uid: string,
  addr: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  const id = makeSafeId('addr');
  const path = `users/${uid}/addresses/${id}`;
  try {
    const payload: Record<string, unknown> = {
      userId: uid,
      label: addr.label.trim().slice(0, 40),
      fullName: addr.fullName.trim().slice(0, 120),
      phone: addr.phone.trim().slice(0, 20),
      line1: addr.line1.trim().slice(0, 200),
      city: addr.city.trim().slice(0, 80),
      state: addr.state.trim().slice(0, 80),
      pincode: addr.pincode.trim().slice(0, 6),
      isDefault: Boolean(addr.isDefault),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (addr.line2 && addr.line2.trim()) {
      payload.line2 = addr.line2.trim().slice(0, 200);
    }
    await setDoc(doc(db, 'users', uid, 'addresses', id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteUserAddress(uid: string, addressId: string): Promise<void> {
  const path = `users/${uid}/addresses/${addressId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'addresses', addressId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeWishlist(uid: string, cb: (productIds: string[]) => void): Unsubscribe {
  const path = `users/${uid}/wishlist`;
  return onSnapshot(
    collection(db, 'users', uid, 'wishlist'),
    (snap) => cb(snap.docs.map((d) => d.id)),
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export async function toggleWishlistDoc(uid: string, productId: string, currentlySaved: boolean): Promise<void> {
  const path = `users/${uid}/wishlist/${productId}`;
  try {
    const ref = doc(db, 'users', uid, 'wishlist', productId);
    if (currentlySaved) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, {
        userId: uid,
        productId,
        addedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, currentlySaved ? OperationType.DELETE : OperationType.CREATE, path);
  }
}

// Orders, Reviews, Refunds, Support
export function subscribeUserOrders(uid: string, cb: (items: Order[]) => void): Unsubscribe {
  const path = 'orders';
  const q = query(collection(db, path), where('userId', '==', uid), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      cb(snap.docs.map((d) => mapOrder(d.id, d.data())));
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

function mapOrder(id: string, data: Record<string, unknown>): Order {
  return {
    id,
    orderNumber: String(data.orderNumber || ''),
    idempotencyKey: String(data.idempotencyKey || ''),
    userId: String(data.userId || ''),
    customerName: String(data.customerName || ''),
    customerEmail: String(data.customerEmail || ''),
    customerPhone: String(data.customerPhone || ''),
    shippingAddress: (data.shippingAddress as Order['shippingAddress']) || {
      fullName: '',
      phone: '',
      line1: '',
      city: '',
      state: '',
      pincode: '',
    },
    items: Array.isArray(data.items) ? (data.items as Order['items']) : [],
    subtotalInr: Number(data.subtotalInr ?? 0),
    discountInr: Number(data.discountInr ?? 0),
    couponCode: data.couponCode ? String(data.couponCode) : undefined,
    shippingInr: Number(data.shippingInr ?? 0),
    gstInr: Number(data.gstInr ?? 0),
    totalInr: Number(data.totalInr ?? 0),
    paymentMethod: (data.paymentMethod as Order['paymentMethod']) || 'upi',
    paymentStatus: (data.paymentStatus as PaymentStatus) || 'paid',
    orderStatus: (data.orderStatus as OrderStatus) || 'confirmed',
    shipmentCarrier: data.shipmentCarrier ? String(data.shipmentCarrier) : undefined,
    trackingNumber: data.trackingNumber ? String(data.trackingNumber) : undefined,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

export async function createFirestoreOrder(
  order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Order> {
  // Use sanitized idempotencyKey as document ID to guarantee duplicate-order prevention!
  const safeDocId = order.idempotencyKey.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
  const path = `orders/${safeDocId}`;
  try {
    const ref = doc(db, 'orders', safeDocId);
    const existing = await getDoc(ref);
    if (existing.exists()) {
      return mapOrder(existing.id, existing.data());
    }
    const payload: Record<string, unknown> = {
      orderNumber: order.orderNumber.slice(0, 32),
      idempotencyKey: order.idempotencyKey.slice(0, 128),
      userId: order.userId,
      customerName: order.customerName.trim().slice(0, 120),
      customerEmail: order.customerEmail.trim().slice(0, 200),
      customerPhone: order.customerPhone.trim().slice(0, 20),
      shippingAddress: order.shippingAddress,
      items: order.items,
      subtotalInr: order.subtotalInr,
      discountInr: order.discountInr,
      shippingInr: order.shippingInr,
      gstInr: order.gstInr,
      totalInr: order.totalInr,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: 'confirmed',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (order.couponCode) {
      payload.couponCode = order.couponCode.slice(0, 32);
    }
    await setDoc(ref, payload);
    const nowIso = new Date().toISOString();
    return {
      ...order,
      id: safeDocId,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function cancelOwnOrder(orderId: string): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      orderStatus: 'cancelled',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function submitProductReview(params: {
  productId: string;
  userId: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  verifiedPurchase: boolean;
}): Promise<void> {
  const id = makeSafeId('rev');
  const path = `reviews/${id}`;
  try {
    await setDoc(doc(db, 'reviews', id), {
      productId: params.productId,
      userId: params.userId,
      authorName: params.authorName.trim().slice(0, 80),
      rating: Math.max(1, Math.min(5, Math.round(params.rating))),
      title: params.title.trim().slice(0, 120),
      body: params.body.trim().slice(0, 1200),
      verifiedPurchase: Boolean(params.verifiedPurchase),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeUserRefunds(uid: string, cb: (items: RefundRequest[]) => void): Unsubscribe {
  const path = 'refund_requests';
  const q = query(collection(db, path), where('userId', '==', uid), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      cb(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            orderId: String(data.orderId || ''),
            orderNumber: String(data.orderNumber || ''),
            userId: String(data.userId || ''),
            reason: String(data.reason || ''),
            details: String(data.details || ''),
            amountInr: Number(data.amountInr ?? 0),
            status: (data.status as RefundStatus) || 'requested',
            adminNote: data.adminNote ? String(data.adminNote) : undefined,
            createdAt: toIso(data.createdAt),
            updatedAt: toIso(data.updatedAt),
          };
        })
      );
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export async function createRefundRequest(params: {
  orderId: string;
  orderNumber: string;
  userId: string;
  reason: string;
  details: string;
  amountInr: number;
}): Promise<void> {
  const id = makeSafeId('ref');
  const path = `refund_requests/${id}`;
  try {
    await setDoc(doc(db, 'refund_requests', id), {
      orderId: params.orderId,
      orderNumber: params.orderNumber.slice(0, 32),
      userId: params.userId,
      reason: params.reason.trim().slice(0, 120),
      details: params.details.trim().slice(0, 1000),
      amountInr: params.amountInr,
      status: 'requested',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeUserSupportTickets(uid: string, cb: (items: SupportTicket[]) => void): Unsubscribe {
  const path = 'support_tickets';
  const q = query(collection(db, path), where('userId', '==', uid), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      cb(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            userId: String(data.userId || ''),
            name: String(data.name || ''),
            email: String(data.email || ''),
            subject: String(data.subject || ''),
            message: String(data.message || ''),
            orderNumber: data.orderNumber ? String(data.orderNumber) : undefined,
            status: (data.status as SupportStatus) || 'open',
            adminReply: data.adminReply ? String(data.adminReply) : undefined,
            createdAt: toIso(data.createdAt),
            updatedAt: toIso(data.updatedAt),
          };
        })
      );
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export async function createSupportTicket(params: {
  userId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  orderNumber?: string;
}): Promise<void> {
  const id = makeSafeId('sup');
  const path = `support_tickets/${id}`;
  try {
    const payload: Record<string, unknown> = {
      userId: params.userId,
      name: params.name.trim().slice(0, 120),
      email: params.email.trim().slice(0, 200),
      subject: params.subject.trim().slice(0, 140),
      message: params.message.trim().slice(0, 2000),
      status: 'open',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (params.orderNumber && params.orderNumber.trim()) {
      payload.orderNumber = params.orderNumber.trim().slice(0, 32);
    }
    await setDoc(doc(db, 'support_tickets', id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function subscribeNewsletterDoc(userId: string, email: string): Promise<void> {
  const id = makeSafeId('sub');
  const path = `newsletter_subscribers/${id}`;
  try {
    await setDoc(doc(db, 'newsletter_subscribers', id), {
      email: email.trim().slice(0, 200),
      userId,
      subscribedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Admin Dashboard Operations
export async function logAdminAudit(params: {
  actorUid: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
}): Promise<void> {
  const id = makeSafeId('aud');
  const path = `audit_logs/${id}`;
  try {
    await setDoc(doc(db, 'audit_logs', id), {
      actorUid: params.actorUid,
      actorEmail: params.actorEmail.slice(0, 200),
      action: params.action.slice(0, 80),
      entityType: params.entityType.slice(0, 64),
      entityId: params.entityId.slice(0, 128),
      summary: params.summary.slice(0, 400),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function seedInitialCatalogToFirestore(actorUid: string, actorEmail: string): Promise<void> {
  try {
    const batch = writeBatch(db);

    for (const cat of INITIAL_CATEGORIES) {
      const payload: Record<string, unknown> = {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        displayOrder: cat.displayOrder,
        isActive: cat.isActive,
        isFestival: cat.isFestival,
        updatedAt: serverTimestamp(),
      };
      if (cat.nameHi) payload.nameHi = cat.nameHi;
      if (cat.imageUrl) payload.imageUrl = cat.imageUrl;
      batch.set(doc(db, 'categories', cat.id), payload);
    }

    for (const prod of INITIAL_PRODUCTS) {
      const payload: Record<string, unknown> = {
        name: prod.name,
        slug: prod.slug,
        categorySlug: prod.categorySlug,
        shortDescription: prod.shortDescription,
        description: prod.description,
        origin: prod.origin,
        gstPercent: prod.gstPercent,
        basePriceInr: prod.basePriceInr,
        isBestseller: prod.isBestseller,
        isFeatured: prod.isFeatured,
        isActive: prod.isActive,
        lowStockThreshold: prod.lowStockThreshold,
        totalStock: prod.totalStock,
        imageUrl: prod.imageUrl,
        variants: prod.variants,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (prod.nameHi) payload.nameHi = prod.nameHi;
      if (prod.festivalSlug) payload.festivalSlug = prod.festivalSlug;
      if (prod.ingredients) payload.ingredients = prod.ingredients;
      if (prod.usageInstructions) payload.usageInstructions = prod.usageInstructions;
      if (prod.storageInstructions) payload.storageInstructions = prod.storageInstructions;
      if (typeof prod.compareAtPriceInr === 'number') payload.compareAtPriceInr = prod.compareAtPriceInr;
      if (prod.gallery && prod.gallery.length > 0) payload.gallery = prod.gallery;
      batch.set(doc(db, 'products', prod.id), payload);
    }

    for (const c of INITIAL_COUPONS) {
      const payload: Record<string, unknown> = {
        code: c.code,
        description: c.description,
        discountType: c.discountType,
        discountValue: c.discountValue,
        minOrderInr: c.minOrderInr,
        isActive: c.isActive,
        usageCount: c.usageCount,
        updatedAt: serverTimestamp(),
      };
      if (typeof c.maxDiscountInr === 'number') payload.maxDiscountInr = c.maxDiscountInr;
      if (typeof c.usageLimit === 'number') payload.usageLimit = c.usageLimit;
      batch.set(doc(db, 'coupons', c.code), payload);
    }

    batch.set(doc(db, 'homepage_config', 'main'), {
      announcementText: INITIAL_HOMEPAGE_CONFIG.announcementText,
      announcementActive: INITIAL_HOMEPAGE_CONFIG.announcementActive,
      heroEyebrow: INITIAL_HOMEPAGE_CONFIG.heroEyebrow,
      heroHeadline: INITIAL_HOMEPAGE_CONFIG.heroHeadline,
      heroSubheadline: INITIAL_HOMEPAGE_CONFIG.heroSubheadline,
      heroCtaLabel: INITIAL_HOMEPAGE_CONFIG.heroCtaLabel,
      featuredFestivalSlug: INITIAL_HOMEPAGE_CONFIG.featuredFestivalSlug || 'diwali',
      updatedAt: serverTimestamp(),
    });

    await batch.commit();

    await logAdminAudit({
      actorUid,
      actorEmail,
      action: 'CATALOG_SEED',
      entityType: 'catalog',
      entityId: 'initial-seed',
      summary: `Synchronized ${INITIAL_PRODUCTS.length} products, ${INITIAL_CATEGORIES.length} categories, and ${INITIAL_COUPONS.length} coupons to Firestore.`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'catalog_seed_batch');
  }
}

export async function adminSaveProduct(
  product: Product,
  isNew: boolean,
  actorUid: string,
  actorEmail: string
): Promise<void> {
  const id = isNew ? makeSafeId('prod') : product.id;
  const path = `products/${id}`;
  try {
    const payload: Record<string, unknown> = {
      name: product.name.trim().slice(0, 140),
      slug: product.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 96),
      categorySlug: product.categorySlug,
      shortDescription: product.shortDescription.trim().slice(0, 240),
      description: product.description.trim().slice(0, 2500),
      origin: product.origin.trim().slice(0, 140),
      gstPercent: Number(product.gstPercent),
      basePriceInr: Number(product.basePriceInr),
      isBestseller: Boolean(product.isBestseller),
      isFeatured: Boolean(product.isFeatured),
      isActive: Boolean(product.isActive),
      lowStockThreshold: Number(product.lowStockThreshold),
      totalStock: Number(product.totalStock),
      imageUrl: product.imageUrl.trim().slice(0, 300),
      variants: product.variants,
      updatedAt: serverTimestamp(),
    };
    if (product.nameHi) payload.nameHi = product.nameHi.trim().slice(0, 140);
    if (product.festivalSlug) payload.festivalSlug = product.festivalSlug.trim().slice(0, 64);
    if (product.ingredients) payload.ingredients = product.ingredients.trim().slice(0, 800);
    if (product.usageInstructions) payload.usageInstructions = product.usageInstructions.trim().slice(0, 1000);
    if (product.storageInstructions) payload.storageInstructions = product.storageInstructions.trim().slice(0, 600);
    if (typeof product.compareAtPriceInr === 'number' && product.compareAtPriceInr > 0) {
      payload.compareAtPriceInr = product.compareAtPriceInr;
    }
    if (product.gallery && product.gallery.length > 0) payload.gallery = product.gallery.slice(0, 10);

    if (isNew) {
      payload.createdAt = serverTimestamp();
      await setDoc(doc(db, 'products', id), payload);
    } else {
      await updateDoc(doc(db, 'products', id), payload);
    }

    await logAdminAudit({
      actorUid,
      actorEmail,
      action: isNew ? 'PRODUCT_CREATE' : 'PRODUCT_UPDATE',
      entityType: 'product',
      entityId: id,
      summary: `${isNew ? 'Created' : 'Updated'} product "${product.name}" (₹${product.basePriceInr}, stock ${product.totalStock}).`,
    });
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function adminSaveCategory(
  category: Category,
  isNew: boolean,
  actorUid: string,
  actorEmail: string
): Promise<void> {
  const id = isNew ? makeSafeId('cat') : category.id;
  const path = `categories/${id}`;
  try {
    const payload: Record<string, unknown> = {
      name: category.name.trim().slice(0, 80),
      slug: category.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 64),
      description: category.description.trim().slice(0, 400),
      displayOrder: Number(category.displayOrder),
      isActive: Boolean(category.isActive),
      isFestival: Boolean(category.isFestival),
      updatedAt: serverTimestamp(),
    };
    if (category.nameHi) payload.nameHi = category.nameHi.trim().slice(0, 80);
    if (category.imageUrl) payload.imageUrl = category.imageUrl.trim().slice(0, 300);

    await setDoc(doc(db, 'categories', id), payload, { merge: !isNew });
    await logAdminAudit({
      actorUid,
      actorEmail,
      action: isNew ? 'CATEGORY_CREATE' : 'CATEGORY_UPDATE',
      entityType: 'category',
      entityId: id,
      summary: `${isNew ? 'Created' : 'Updated'} category "${category.name}".`,
    });
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function adminAdjustInventory(params: {
  product: Product;
  variantSku: string;
  delta: number;
  reason: InventoryMovement['reason'];
  note: string;
  actorUid: string;
  actorEmail: string;
}): Promise<void> {
  const prodPath = `products/${params.product.id}`;
  try {
    const updatedVariants = params.product.variants.map((v) =>
      v.sku === params.variantSku ? { ...v, stock: Math.max(0, v.stock + params.delta) } : v
    );
    const totalStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);

    await updateDoc(doc(db, 'products', params.product.id), {
      variants: updatedVariants,
      totalStock,
      updatedAt: serverTimestamp(),
    });

    const movId = makeSafeId('inv');
    await setDoc(doc(db, 'inventory_movements', movId), {
      productId: params.product.id,
      variantSku: params.variantSku.slice(0, 64),
      delta: params.delta,
      reason: params.reason,
      note: params.note.trim().slice(0, 300),
      actorUid: params.actorUid,
      createdAt: serverTimestamp(),
    });

    await logAdminAudit({
      actorUid: params.actorUid,
      actorEmail: params.actorEmail,
      action: 'INVENTORY_ADJUST',
      entityType: 'product',
      entityId: params.product.id,
      summary: `Adjusted ${params.variantSku} by ${params.delta > 0 ? '+' : ''}${params.delta} (${params.reason}). New total: ${totalStock}.`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, prodPath);
  }
}

export async function adminSaveCoupon(
  coupon: Coupon,
  actorUid: string,
  actorEmail: string
): Promise<void> {
  const code = coupon.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32);
  const path = `coupons/${code}`;
  try {
    const payload: Record<string, unknown> = {
      code,
      description: coupon.description.trim().slice(0, 200),
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      minOrderInr: Number(coupon.minOrderInr),
      isActive: Boolean(coupon.isActive),
      usageCount: Number(coupon.usageCount ?? 0),
      updatedAt: serverTimestamp(),
    };
    if (typeof coupon.maxDiscountInr === 'number' && coupon.maxDiscountInr > 0) {
      payload.maxDiscountInr = coupon.maxDiscountInr;
    }
    if (typeof coupon.usageLimit === 'number' && coupon.usageLimit > 0) {
      payload.usageLimit = coupon.usageLimit;
    }
    await setDoc(doc(db, 'coupons', code), payload);
    await logAdminAudit({
      actorUid,
      actorEmail,
      action: 'COUPON_SAVE',
      entityType: 'coupon',
      entityId: code,
      summary: `Saved coupon ${code} (${coupon.discountType} ${coupon.discountValue}, active: ${coupon.isActive}).`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function adminUpdateHomepageConfig(
  cfg: HomepageConfig,
  actorUid: string,
  actorEmail: string
): Promise<void> {
  const path = 'homepage_config/main';
  try {
    const payload: Record<string, unknown> = {
      announcementText: cfg.announcementText.trim().slice(0, 200),
      announcementActive: Boolean(cfg.announcementActive),
      heroEyebrow: cfg.heroEyebrow.trim().slice(0, 80),
      heroHeadline: cfg.heroHeadline.trim().slice(0, 160),
      heroSubheadline: cfg.heroSubheadline.trim().slice(0, 400),
      heroCtaLabel: cfg.heroCtaLabel.trim().slice(0, 48),
      updatedAt: serverTimestamp(),
    };
    if (cfg.featuredFestivalSlug) {
      payload.featuredFestivalSlug = cfg.featuredFestivalSlug.slice(0, 64);
    }
    await setDoc(doc(db, 'homepage_config', 'main'), payload);
    await logAdminAudit({
      actorUid,
      actorEmail,
      action: 'HOMEPAGE_CMS_UPDATE',
      entityType: 'homepage_config',
      entityId: 'main',
      summary: `Updated storefront announcement bar and hero content.`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function adminUpdateOrderFulfillment(params: {
  orderId: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  shipmentCarrier?: string;
  trackingNumber?: string;
  actorUid: string;
  actorEmail: string;
}): Promise<void> {
  const path = `orders/${params.orderId}`;
  try {
    const payload: Record<string, unknown> = {
      orderStatus: params.orderStatus,
      paymentStatus: params.paymentStatus,
      updatedAt: serverTimestamp(),
    };
    if (params.shipmentCarrier !== undefined) payload.shipmentCarrier = params.shipmentCarrier.trim().slice(0, 80);
    if (params.trackingNumber !== undefined) payload.trackingNumber = params.trackingNumber.trim().slice(0, 80);
    await updateDoc(doc(db, 'orders', params.orderId), payload);

    await logAdminAudit({
      actorUid: params.actorUid,
      actorEmail: params.actorEmail,
      action: 'ORDER_FULFILLMENT_UPDATE',
      entityType: 'order',
      entityId: params.orderId,
      summary: `Updated ${params.orderNumber} to status "${params.orderStatus}" (payment: ${params.paymentStatus}).`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function adminUpdateRefundStatus(params: {
  refundId: string;
  orderNumber: string;
  status: RefundStatus;
  adminNote: string;
  actorUid: string;
  actorEmail: string;
}): Promise<void> {
  const path = `refund_requests/${params.refundId}`;
  try {
    await updateDoc(doc(db, 'refund_requests', params.refundId), {
      status: params.status,
      adminNote: params.adminNote.trim().slice(0, 500),
      updatedAt: serverTimestamp(),
    });
    await logAdminAudit({
      actorUid: params.actorUid,
      actorEmail: params.actorEmail,
      action: 'REFUND_STATUS_UPDATE',
      entityType: 'refund_request',
      entityId: params.refundId,
      summary: `Set refund for ${params.orderNumber} to "${params.status}".`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function adminUpdateSupportTicket(params: {
  ticketId: string;
  status: SupportStatus;
  adminReply: string;
  actorUid: string;
  actorEmail: string;
}): Promise<void> {
  const path = `support_tickets/${params.ticketId}`;
  try {
    await updateDoc(doc(db, 'support_tickets', params.ticketId), {
      status: params.status,
      adminReply: params.adminReply.trim().slice(0, 1500),
      updatedAt: serverTimestamp(),
    });
    await logAdminAudit({
      actorUid: params.actorUid,
      actorEmail: params.actorEmail,
      action: 'SUPPORT_TICKET_UPDATE',
      entityType: 'support_ticket',
      entityId: params.ticketId,
      summary: `Updated support ticket ${params.ticketId} to "${params.status}".`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Admin Collections Fetchers
export async function fetchAdminDashboardCollections(): Promise<{
  orders: Order[];
  coupons: Coupon[];
  customers: UserProfile[];
  refunds: RefundRequest[];
  tickets: SupportTicket[];
  movements: InventoryMovement[];
  auditLogs: AuditLog[];
}> {
  try {
    const [ordersSnap, couponsSnap, usersSnap, refundsSnap, ticketsSnap, movSnap, auditSnap] =
      await Promise.all([
        getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'coupons')),
        getDocs(collection(db, 'users')),
        getDocs(query(collection(db, 'refund_requests'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'support_tickets'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'inventory_movements'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'audit_logs'), orderBy('createdAt', 'desc'))),
      ]);

    return {
      orders: ordersSnap.docs.map((d) => mapOrder(d.id, d.data())),
      coupons: couponsSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          code: String(data.code || d.id),
          description: String(data.description || ''),
          discountType: data.discountType === 'flat' ? 'flat' : 'percentage',
          discountValue: Number(data.discountValue ?? 0),
          minOrderInr: Number(data.minOrderInr ?? 0),
          maxDiscountInr: typeof data.maxDiscountInr === 'number' ? data.maxDiscountInr : undefined,
          isActive: Boolean(data.isActive),
          usageCount: Number(data.usageCount ?? 0),
          usageLimit: typeof data.usageLimit === 'number' ? data.usageLimit : undefined,
          updatedAt: toIso(data.updatedAt),
        };
      }),
      customers: usersSnap.docs.map((d) => {
        const data = d.data();
        return {
          uid: d.id,
          email: String(data.email || ''),
          displayName: String(data.displayName || ''),
          phone: data.phone ? String(data.phone) : undefined,
          createdAt: toIso(data.createdAt),
          updatedAt: toIso(data.updatedAt),
        };
      }),
      refunds: refundsSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          orderId: String(data.orderId || ''),
          orderNumber: String(data.orderNumber || ''),
          userId: String(data.userId || ''),
          reason: String(data.reason || ''),
          details: String(data.details || ''),
          amountInr: Number(data.amountInr ?? 0),
          status: (data.status as RefundStatus) || 'requested',
          adminNote: data.adminNote ? String(data.adminNote) : undefined,
          createdAt: toIso(data.createdAt),
          updatedAt: toIso(data.updatedAt),
        };
      }),
      tickets: ticketsSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: String(data.userId || ''),
          name: String(data.name || ''),
          email: String(data.email || ''),
          subject: String(data.subject || ''),
          message: String(data.message || ''),
          orderNumber: data.orderNumber ? String(data.orderNumber) : undefined,
          status: (data.status as SupportStatus) || 'open',
          adminReply: data.adminReply ? String(data.adminReply) : undefined,
          createdAt: toIso(data.createdAt),
          updatedAt: toIso(data.updatedAt),
        };
      }),
      movements: movSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          productId: String(data.productId || ''),
          variantSku: String(data.variantSku || ''),
          delta: Number(data.delta ?? 0),
          reason: (data.reason as InventoryMovement['reason']) || 'manual_adjustment',
          note: data.note ? String(data.note) : undefined,
          actorUid: String(data.actorUid || ''),
          createdAt: toIso(data.createdAt),
        };
      }),
      auditLogs: auditSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          actorUid: String(data.actorUid || ''),
          actorEmail: String(data.actorEmail || ''),
          action: String(data.action || ''),
          entityType: String(data.entityType || ''),
          entityId: String(data.entityId || ''),
          summary: String(data.summary || ''),
          createdAt: toIso(data.createdAt),
        };
      }),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'admin_dashboard');
  }
}
