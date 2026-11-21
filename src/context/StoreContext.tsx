import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { auth, BOOTSTRAPPED_ADMIN_EMAIL, googleProvider } from '../lib/firebase';
import type {
  Address,
  CartItem,
  Category,
  Coupon,
  HomepageConfig,
  Order,
  Product,
  ProductVariant,
  RefundRequest,
  Review,
  RouteState,
  SupportTicket,
  UserProfile,
} from '../types/commerce';
import {
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_HOMEPAGE_CONFIG,
  INITIAL_PRODUCTS,
} from '../data/catalog';
import {
  calculateCartTotals,
  type CartTotals,
} from '../utils/commerce';
import {
  checkIsAdmin,
  ensureUserProfile,
  lookupCouponByCode,
  subscribeCategories,
  subscribeHomepageConfig,
  subscribeProducts,
  subscribeReviews,
  subscribeUserAddresses,
  subscribeUserOrders,
  subscribeUserRefunds,
  subscribeUserSupportTickets,
  subscribeWishlist,
  toggleWishlistDoc,
} from '../services/firestoreService';

import {
  DEFAULT_HERITAGE_THEME,
  resolveHeritageTheme,
  type HeritageThemeId,
} from '../utils/heritageThemes';

const CART_STORAGE_KEY = 'akshat_cart_v1';
const GUEST_WISHLIST_KEY = 'akshat_wishlist_v1';
const GUEST_ORDERS_KEY = 'akshat_guest_orders_v1';
const HERITAGE_THEME_KEY = 'akshat_heritage_theme_v1';

interface ToastMessage {
  id: number;
  text: string;
  tone: 'neutral' | 'success' | 'error';
}

interface StoreContextValue {
  route: RouteState;
  navigate: (next: RouteState) => void;
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  authReady: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  categories: Category[];
  products: Product[];
  catalogIsFromFirestore: boolean;
  homepageConfig: HomepageConfig;
  reviews: Review[];
  cart: CartItem[];
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  addToCart: (product: Product, variant: ProductVariant, quantity?: number, openDrawer?: boolean) => void;
  updateCartQty: (variantSku: string, quantity: number) => void;
  removeFromCart: (variantSku: string) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCouponCode: (code: string) => Promise<{ ok: boolean; message: string }>;
  removeCoupon: () => void;
  shippingMethod: 'standard' | 'express';
  setShippingMethod: (m: 'standard' | 'express') => void;
  cartTotals: CartTotals;
  wishlistIds: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  addresses: Address[];
  orders: Order[];
  addGuestOrder: (order: Order) => void;
  refunds: RefundRequest[];
  supportTickets: SupportTicket[];
  toast: ToastMessage | null;
  showToast: (text: string, tone?: ToastMessage['tone']) => void;
  dismissToast: () => void;
  heritageTheme: HeritageThemeId;
  setHeritageTheme: (theme: HeritageThemeId) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function parseHashToRoute(): RouteState {
  const raw = window.location.hash.replace(/^#\/?/, '');
  if (!raw) return { page: 'home' };
  const [pathPart, queryPart] = raw.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  const params = new URLSearchParams(queryPart || '');
  const head = segments[0] || 'home';

  if (head === 'product' && segments[1]) {
    return { page: 'product', slug: decodeURIComponent(segments[1]) };
  }
  if (head === 'shop') {
    return {
      page: 'shop',
      category: params.get('category') || undefined,
      festival: params.get('festival') || undefined,
      search: params.get('q') || undefined,
    };
  }
  if (head === 'guides') {
    return { page: 'guides', guideSlug: segments[1] ? decodeURIComponent(segments[1]) : undefined };
  }
  const validStatic = new Set([
    'checkout',
    'account',
    'about',
    'contact',
    'faq',
    'shipping-policy',
    'returns-policy',
    'privacy-policy',
    'terms',
    'admin',
  ]);
  if (validStatic.has(head)) {
    return { page: head as RouteState['page'] };
  }
  return { page: 'home' };
}

function serializeRouteToHash(r: RouteState): string {
  if (r.page === 'home') return '#/';
  if (r.page === 'product' && r.slug) return `#/product/${encodeURIComponent(r.slug)}`;
  if (r.page === 'guides') {
    return r.guideSlug ? `#/guides/${encodeURIComponent(r.guideSlug)}` : '#/guides';
  }
  if (r.page === 'shop') {
    const p = new URLSearchParams();
    if (r.category && r.category !== 'all') p.set('category', r.category);
    if (r.festival && r.festival !== 'all') p.set('festival', r.festival);
    if (r.search) p.set('q', r.search);
    const qs = p.toString();
    return qs ? `#/shop?${qs}` : '#/shop';
  }
  return `#/${r.page}`;
}

function readLocalJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<RouteState>(() => parseHashToRoute());
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const [fsCategories, setFsCategories] = useState<Category[]>([]);
  const [fsProducts, setFsProducts] = useState<Product[]>([]);
  const [fsHomepageConfig, setFsHomepageConfig] = useState<HomepageConfig | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [cart, setCart] = useState<CartItem[]>(() => readLocalJson<CartItem[]>(CART_STORAGE_KEY, []));
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

  const [guestWishlistIds, setGuestWishlistIds] = useState<string[]>(() =>
    readLocalJson<string[]>(GUEST_WISHLIST_KEY, [])
  );
  const [fsWishlistIds, setFsWishlistIds] = useState<string[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [fsOrders, setFsOrders] = useState<Order[]>([]);
  const [guestOrders, setGuestOrders] = useState<Order[]>(() =>
    readLocalJson<Order[]>(GUEST_ORDERS_KEY, [])
  );
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [heritageTheme, setHeritageThemeState] = useState<HeritageThemeId>(() => {
    try {
      return resolveHeritageTheme(localStorage.getItem(HERITAGE_THEME_KEY));
    } catch {
      return DEFAULT_HERITAGE_THEME;
    }
  });

  useEffect(() => {
    document.documentElement.dataset.heritageTheme = heritageTheme;
    try {
      localStorage.setItem(HERITAGE_THEME_KEY, heritageTheme);
    } catch {
      // ignore storage quota
    }
  }, [heritageTheme]);

  const setHeritageTheme = useCallback((nextTheme: HeritageThemeId) => {
    setHeritageThemeState(nextTheme);
  }, []);

  const showToast = useCallback((text: string, tone: ToastMessage['tone'] = 'neutral') => {
    setToast({ id: Date.now(), text, tone });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Sync URL hash navigation
  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHashToRoute());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((next: RouteState) => {
    const nextHash = serializeRouteToHash(next);
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
    setRoute(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Persist cart & guest data locally
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore storage quota
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(guestWishlistIds));
    } catch {
      // ignore
    }
  }, [guestWishlistIds]);

  useEffect(() => {
    try {
      localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(guestOrders));
    } catch {
      // ignore
    }
  }, [guestOrders]);

  // Public Firestore Catalog Listeners
  useEffect(() => {
    const unsubCats = subscribeCategories(setFsCategories);
    const unsubProds = subscribeProducts(setFsProducts);
    const unsubHome = subscribeHomepageConfig(setFsHomepageConfig);
    const unsubRevs = subscribeReviews(setReviews);
    return () => {
      unsubCats();
      unsubProds();
      unsubHome();
      unsubRevs();
    };
  }, []);

  // Firebase Auth State + Private Subscriptions
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setProfile(null);
        setIsAdmin(false);
        setAddresses([]);
        setFsOrders([]);
        setFsWishlistIds([]);
        setRefunds([]);
        setSupportTickets([]);
        setAuthReady(true);
        return;
      }

      try {
        const userProf = await ensureUserProfile(
          nextUser.uid,
          nextUser.email || '',
          nextUser.displayName || ''
        );
        setProfile(userProf);
      } catch (err) {
        console.error('Profile sync error:', err);
      }

      const bootstrapped =
        Boolean(nextUser.emailVerified) &&
        nextUser.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();
      const roleDoc = bootstrapped ? true : await checkIsAdmin(nextUser.uid);
      setIsAdmin(roleDoc);
      setAuthReady(true);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!authReady || !user) return;
    const u1 = subscribeUserAddresses(user.uid, setAddresses);
    const u2 = subscribeUserOrders(user.uid, setFsOrders);
    const u3 = subscribeWishlist(user.uid, setFsWishlistIds);
    const u4 = subscribeUserRefunds(user.uid, setRefunds);
    const u5 = subscribeUserSupportTickets(user.uid, setSupportTickets);
    return () => {
      u1();
      u2();
      u3();
      u4();
      u5();
    };
  }, [authReady, user]);

  const signInWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast('Signed in successfully.', 'success');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Sign-in cancelled or failed.';
      showToast(msg, 'error');
    }
  }, [showToast]);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    showToast('Signed out of your account.', 'neutral');
  }, [showToast]);

  const categories = fsCategories.length > 0 ? fsCategories : INITIAL_CATEGORIES;
  const products = fsProducts.length > 0 ? fsProducts : INITIAL_PRODUCTS;
  const homepageConfig = fsHomepageConfig ?? INITIAL_HOMEPAGE_CONFIG;
  const catalogIsFromFirestore = fsProducts.length > 0;

  const addToCart = useCallback(
    (product: Product, variant: ProductVariant, quantity = 1, openDrawer = true) => {
      if (variant.stock <= 0) {
        showToast('This variant is currently out of stock.', 'error');
        return;
      }
      setCart((prev) => {
        const idx = prev.findIndex((i) => i.variantSku === variant.sku);
        if (idx >= 0) {
          const updated = [...prev];
          const nextQty = Math.min(variant.stock, updated[idx].quantity + quantity);
          updated[idx] = { ...updated[idx], quantity: nextQty, maxStock: variant.stock };
          return updated;
        }
        return [
          ...prev,
          {
            productId: product.id,
            productSlug: product.slug,
            productName: product.name,
            imageUrl: product.imageUrl,
            variantSku: variant.sku,
            variantLabel: variant.label,
            unitPriceInr: variant.priceInr,
            gstPercent: product.gstPercent,
            quantity: Math.min(variant.stock, quantity),
            maxStock: variant.stock,
          },
        ];
      });
      if (openDrawer) {
        setCartDrawerOpen(true);
      } else {
        showToast(`Added "${product.name}" to your bag.`, 'success');
      }
    },
    [showToast]
  );

  const updateCartQty = useCallback((variantSku: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.variantSku !== variantSku);
      }
      return prev.map((item) =>
        item.variantSku === variantSku
          ? { ...item, quantity: Math.min(item.maxStock, quantity) }
          : item
      );
    });
  }, []);

  const removeFromCart = useCallback((variantSku: string) => {
    setCart((prev) => prev.filter((item) => item.variantSku !== variantSku));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCoupon(null);
  }, []);

  const applyCouponCode = useCallback(
    async (rawCode: string): Promise<{ ok: boolean; message: string }> => {
      const code = rawCode.trim().toUpperCase();
      if (!code) {
        return { ok: false, message: 'Enter a coupon code.' };
      }
      let found: Coupon | null = null;
      try {
        found = await lookupCouponByCode(code);
      } catch {
        found = null;
      }
      if (!found) {
        found = INITIAL_COUPONS.find((c) => c.code === code) || null;
      }
      if (!found || !found.isActive) {
        return { ok: false, message: `Coupon "${code}" is invalid or expired.` };
      }
      const subtotal = cart.reduce((s, i) => s + i.unitPriceInr * i.quantity, 0);
      if (subtotal < found.minOrderInr) {
        return {
          ok: false,
          message: `Add items worth ₹${found.minOrderInr - subtotal} more to apply ${found.code}.`,
        };
      }
      setAppliedCoupon(found);
      return { ok: true, message: `${found.code} applied — ${found.description}` };
    },
    [cart]
  );

  const removeCoupon = useCallback(() => setAppliedCoupon(null), []);

  const cartTotals = useMemo(
    () => calculateCartTotals(cart, appliedCoupon, shippingMethod),
    [cart, appliedCoupon, shippingMethod]
  );

  const wishlistIds = user ? fsWishlistIds : guestWishlistIds;

  const toggleWishlist = useCallback(
    async (productId: string) => {
      const currentlySaved = wishlistIds.includes(productId);
      if (user) {
        await toggleWishlistDoc(user.uid, productId, currentlySaved);
      } else {
        setGuestWishlistIds((prev) =>
          currentlySaved ? prev.filter((id) => id !== productId) : [...prev, productId]
        );
      }
      showToast(currentlySaved ? 'Removed from wishlist.' : 'Saved to wishlist.', 'neutral');
    },
    [wishlistIds, user, showToast]
  );

  const addGuestOrder = useCallback((order: Order) => {
    setGuestOrders((prev) => {
      if (prev.some((o) => o.idempotencyKey === order.idempotencyKey)) return prev;
      return [order, ...prev];
    });
  }, []);

  const orders = useMemo(() => {
    if (user) {
      return fsOrders;
    }
    return guestOrders;
  }, [user, fsOrders, guestOrders]);

  const value: StoreContextValue = {
    route,
    navigate,
    user,
    profile,
    isAdmin,
    authReady,
    signInWithGoogle,
    signOut,
    categories,
    products,
    catalogIsFromFirestore,
    homepageConfig,
    reviews,
    cart,
    cartDrawerOpen,
    setCartDrawerOpen,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    shippingMethod,
    setShippingMethod,
    cartTotals,
    wishlistIds,
    toggleWishlist,
    addresses,
    orders,
    addGuestOrder,
    refunds,
    supportTickets,
    toast,
    showToast,
    dismissToast,
    heritageTheme,
    setHeritageTheme,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return ctx;
}
