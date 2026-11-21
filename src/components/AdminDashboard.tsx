import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  FileText,
  FolderTree,
  LayoutTemplate,
  LifeBuoy,
  Package,
  RefreshCw,
  Shield,
  ShoppingCart,
  Tag,
  Users,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { IMAGES } from '../data/catalog';
import type {
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
  SupportStatus,
  SupportTicket,
  UserProfile,
} from '../types/commerce';
import { calculateLowStockProducts, formatInr } from '../utils/commerce';
import {
  adminAdjustInventory,
  adminSaveCategory,
  adminSaveCoupon,
  adminSaveProduct,
  adminUpdateHomepageConfig,
  adminUpdateOrderFulfillment,
  adminUpdateRefundStatus,
  adminUpdateSupportTicket,
  fetchAdminDashboardCollections,
  seedInitialCatalogToFirestore,
} from '../services/firestoreService';

type AdminModule =
  | 'overview'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'orders'
  | 'customers'
  | 'coupons'
  | 'cms'
  | 'refunds'
  | 'support'
  | 'audit';

export const AdminDashboard: React.FC = () => {
  const {
    user,
    isAdmin,
    authReady,
    signInWithGoogle,
    products,
    categories,
    homepageConfig,
    catalogIsFromFirestore,
    navigate,
    showToast,
  } = useStore();

  const [activeModule, setActiveModule] = useState<AdminModule>('overview');
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Product editor state
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [isNewProd, setIsNewProd] = useState(false);

  // Category form state
  const [catName, setCatName] = useState('');
  const [catNameHi, setCatNameHi] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catIsFestival, setCatIsFestival] = useState(false);

  // Coupon form state
  const [cpCode, setCpCode] = useState('');
  const [cpDesc, setCpDesc] = useState('');
  const [cpType, setCpType] = useState<'percentage' | 'flat'>('percentage');
  const [cpVal, setCpVal] = useState(10);
  const [cpMin, setCpMin] = useState(599);
  const [cpMax, setCpMax] = useState(250);

  // CMS form state
  const [cmsForm, setCmsForm] = useState<HomepageConfig>(homepageConfig);

  useEffect(() => {
    setCmsForm(homepageConfig);
  }, [homepageConfig]);

  const loadAdminData = useCallback(async () => {
    if (!user || !isAdmin) return;
    setLoading(true);
    try {
      const data = await fetchAdminDashboardCollections();
      setOrders(data.orders);
      setCoupons(data.coupons);
      setCustomers(data.customers);
      setRefunds(data.refunds);
      setTickets(data.tickets);
      setMovements(data.movements);
      setAuditLogs(data.auditLogs);
    } catch {
      showToast('Failed to refresh admin collections.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, showToast]);

  useEffect(() => {
    if (authReady && user && isAdmin) {
      void loadAdminData();
    }
  }, [authReady, user, isAdmin, loadAdminData]);

  const lowStockProducts = useMemo(() => calculateLowStockProducts(products), [products]);

  const analytics = useMemo(() => {
    const validOrders = orders.filter((o) => o.orderStatus !== 'cancelled' && o.orderStatus !== 'refunded');
    const revenue = validOrders.reduce((s, o) => s + o.totalInr, 0);
    const aov = validOrders.length > 0 ? Math.round(revenue / validOrders.length) : 0;
    const pendingFulfillment = orders.filter((o) => o.orderStatus === 'confirmed' || o.orderStatus === 'packed').length;
    const openTickets = tickets.filter((t) => t.status !== 'resolved').length;
    const pendingRefunds = refunds.filter((r) => r.status === 'requested').length;
    return { revenue, orderCount: orders.length, aov, pendingFulfillment, openTickets, pendingRefunds };
  }, [orders, tickets, refunds]);

  if (!authReady) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-24 text-center text-sm text-[#5C574F]">
        Verifying administrator credentials...
      </main>
    );
  }

  if (!user || !isAdmin) {
    return (
      <main className="max-w-xl mx-auto px-4 py-20">
        <div className="bg-white border border-[#E5DCCB] p-8 sm:p-10 space-y-5">
          <div className="flex items-center gap-2 text-[#702F32]">
            <Shield className="w-5 h-5" />
            <span className="text-xs font-semibold tracking-[0.14em]">Role-Based Access Control</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#242320]">
            AKSHAT Store Administration
          </h1>
          <p className="text-sm text-[#5C574F] leading-relaxed">
            {user
              ? `Signed in as ${user.email}, which does not hold an authorized store administrator role.`
              : 'Sign in with an authorized Google administrator account to manage products, categories, inventory, orders, coupons, refunds, homepage content, and audit logs.'}
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            {!user && (
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                className="px-6 py-2.5 bg-[#702F32] text-[#FAF7F0] text-sm font-medium hover:bg-[#582225] transition-colors"
              >
                Sign in as Administrator
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate({ page: 'home' })}
              className="px-6 py-2.5 border border-[#E5DCCB] text-sm text-[#242320] hover:border-[#702F32]"
            >
              Return to Storefront
            </button>
          </div>
        </div>
      </main>
    );
  }

  const handleSeedCatalog = async () => {
    setSeeding(true);
    try {
      await seedInitialCatalogToFirestore(user.uid, user.email || '');
      showToast('Initial AKSHAT catalog, categories, coupons, and homepage synced to Firestore.', 'success');
      await loadAdminData();
    } catch {
      showToast('Failed to sync initial catalog.', 'error');
    } finally {
      setSeeding(false);
    }
  };

  const openNewProductEditor = () => {
    setIsNewProd(true);
    setEditingProd({
      id: '',
      name: '',
      nameHi: '',
      slug: '',
      categorySlug: 'daily-pooja-essentials',
      shortDescription: '',
      description: '',
      ingredients: '',
      origin: 'Pune, Maharashtra',
      usageInstructions: '',
      storageInstructions: '',
      gstPercent: 12,
      basePriceInr: 399,
      isBestseller: false,
      isFeatured: false,
      isActive: true,
      lowStockThreshold: 10,
      totalStock: 25,
      imageUrl: IMAGES.dailyEssentials,
      variants: [
        {
          sku: `AKS-NEW-${Math.floor(100 + Math.random() * 899)}`,
          label: 'Standard Pack',
          weightOrCount: '250 g',
          priceInr: 399,
          stock: 25,
        },
      ],
    });
  };

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProd) return;
    const totalStock = editingProd.variants.reduce((s, v) => s + Number(v.stock || 0), 0);
    const toSave: Product = {
      ...editingProd,
      slug:
        editingProd.slug.trim() ||
        editingProd.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      totalStock,
      basePriceInr: editingProd.variants[0]?.priceInr || editingProd.basePriceInr,
    };
    await adminSaveProduct(toSave, isNewProd, user.uid, user.email || '');
    setEditingProd(null);
    showToast(`Product "${toSave.name}" saved.`, 'success');
    await loadAdminData();
  };

  const navLinks: { id: AdminModule; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview & Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'products', label: 'Products & SKUs', icon: <Package className="w-4 h-4" /> },
    { id: 'categories', label: 'Categories', icon: <FolderTree className="w-4 h-4" /> },
    { id: 'inventory', label: 'Inventory & Stock', icon: <Boxes className="w-4 h-4" /> },
    { id: 'orders', label: 'Orders & Shipping', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
    { id: 'coupons', label: 'Coupons & Promos', icon: <Tag className="w-4 h-4" /> },
    { id: 'cms', label: 'Homepage CMS', icon: <LayoutTemplate className="w-4 h-4" /> },
    { id: 'refunds', label: 'Returns & Refunds', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'support', label: 'Customer Support', icon: <LifeBuoy className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit Logs', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar */}
        <aside className="lg:col-span-3 bg-white border border-[#E5DCCB] p-4 space-y-4">
          <div className="px-2 pb-3 border-b border-[#E5DCCB]">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#702F32]">AKSHAT Admin</p>
            <p className="text-xs text-[#5C574F] truncate mt-0.5">{user.email}</p>
          </div>
          <nav className="space-y-1" aria-label="Admin sections">
            {navLinks.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left transition-colors ${
                  activeModule === item.id
                    ? 'bg-[#702F32] text-[#FAF7F0]'
                    : 'text-[#242320] hover:bg-[#F3EDE0]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Workspace */}
        <main className="lg:col-span-9 space-y-6">
          {/* Top Context Bar */}
          <div className="bg-white border border-[#E5DCCB] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-[#5C574F]">
                Admin / {navLinks.find((n) => n.id === activeModule)?.label}
              </p>
              <h1 className="font-display text-2xl font-semibold text-[#242320]">
                {navLinks.find((n) => n.id === activeModule)?.label}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {!catalogIsFromFirestore && (
                <button
                  type="button"
                  disabled={seeding}
                  onClick={() => void handleSeedCatalog()}
                  className="px-4 py-2 bg-[#34483B] text-[#FAF7F0] text-xs font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {seeding ? 'Syncing Catalog...' : 'Sync Initial Catalog to Firestore'}
                </button>
              )}
              <button
                type="button"
                disabled={loading}
                onClick={() => void loadAdminData()}
                className="px-3.5 py-2 border border-[#E5DCCB] text-xs font-medium text-[#242320] hover:border-[#702F32]"
              >
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          </div>

          {/* 1. Overview & Analytics */}
          {activeModule === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Gross Revenue', value: formatInr(analytics.revenue) },
                  { label: 'Total Orders', value: String(analytics.orderCount) },
                  { label: 'Average Order Value', value: formatInr(analytics.aov) },
                  { label: 'Pending Dispatch', value: String(analytics.pendingFulfillment) },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-white border border-[#E5DCCB] p-5 space-y-1">
                    <p className="text-xs text-[#5C574F]">{kpi.label}</p>
                    <p className="text-2xl font-semibold tabular-nums text-[#242320]">{kpi.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-[#E5DCCB] p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-semibold text-[#242320] flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#C56A32]" />
                      <span>Low Stock Alerts ({lowStockProducts.length})</span>
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveModule('inventory')}
                      className="text-xs text-[#702F32] underline"
                    >
                      Manage Stock
                    </button>
                  </div>
                  {lowStockProducts.length === 0 ? (
                    <p className="text-xs text-[#34483B]">All active SKUs are above configured stock thresholds.</p>
                  ) : (
                    <ul className="divide-y divide-[#E5DCCB] text-xs">
                      {lowStockProducts.map((p) => (
                        <li key={p.id} className="py-2.5 flex justify-between">
                          <span className="text-[#242320] font-medium">{p.name}</span>
                          <span className="text-[#702F32] font-semibold tabular-nums">
                            {p.totalStock} left (min {p.lowStockThreshold})
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="bg-white border border-[#E5DCCB] p-6 space-y-3 text-sm">
                  <h2 className="font-display text-xl font-semibold text-[#242320]">Operations Queue</h2>
                  <div className="flex justify-between py-2 border-b border-[#E5DCCB]">
                    <span className="text-[#5C574F]">Catalog Database Status</span>
                    <span className="font-medium text-[#242320]">
                      {catalogIsFromFirestore ? `Live Firestore (${products.length} products)` : 'Ready to Sync'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#E5DCCB]">
                    <span className="text-[#5C574F]">Open Support Tickets</span>
                    <span className="font-semibold tabular-nums">{analytics.openTickets}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[#5C574F]">Pending Return/Refund Requests</span>
                    <span className="font-semibold tabular-nums">{analytics.pendingRefunds}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Products & SKUs */}
          {activeModule === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-xs text-[#5C574F] tabular-nums">{products.length} catalog products</p>
                <button
                  type="button"
                  onClick={openNewProductEditor}
                  className="px-4 py-2 bg-[#702F32] text-[#FAF7F0] text-xs font-medium hover:bg-[#582225]"
                >
                  Add New Product
                </button>
              </div>

              {editingProd && (
                <form onSubmit={handleSaveProductForm} className="bg-white border border-[#702F32] p-6 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-[#E5DCCB]">
                    <h2 className="font-display text-xl font-semibold">
                      {isNewProd ? 'Create Product' : `Edit: ${editingProd.name}`}
                    </h2>
                    <button type="button" onClick={() => setEditingProd(null)} className="text-xs text-[#5C574F] underline">
                      Cancel
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block mb-1 font-medium">Product Name *</label>
                      <input required value={editingProd.name} onChange={(e) => setEditingProd({ ...editingProd, name: e.target.value })} className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB]" />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Hindi Name</label>
                      <input value={editingProd.nameHi || ''} onChange={(e) => setEditingProd({ ...editingProd, nameHi: e.target.value })} className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB]" />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Category *</label>
                      <select value={editingProd.categorySlug} onChange={(e) => setEditingProd({ ...editingProd, categorySlug: e.target.value })} className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB]">
                        {categories.filter((c) => !c.isFestival).map((c) => (
                          <option key={c.slug} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Origin *</label>
                      <input required value={editingProd.origin} onChange={(e) => setEditingProd({ ...editingProd, origin: e.target.value })} className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB]" />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Primary Variant Price (INR) *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={editingProd.variants[0]?.priceInr ?? editingProd.basePriceInr}
                        onChange={(e) => {
                          const price = Number(e.target.value);
                          const variants = [...editingProd.variants];
                          if (variants[0]) variants[0] = { ...variants[0], priceInr: price };
                          setEditingProd({ ...editingProd, basePriceInr: price, variants });
                        }}
                        className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB] tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Primary Variant Stock *</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={editingProd.variants[0]?.stock ?? 0}
                        onChange={(e) => {
                          const stock = Number(e.target.value);
                          const variants = [...editingProd.variants];
                          if (variants[0]) variants[0] = { ...variants[0], stock };
                          setEditingProd({ ...editingProd, variants });
                        }}
                        className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB] tabular-nums"
                      />
                    </div>
                  </div>
                  <div className="text-xs">
                    <label className="block mb-1 font-medium">Short Description *</label>
                    <input required value={editingProd.shortDescription} onChange={(e) => setEditingProd({ ...editingProd, shortDescription: e.target.value })} className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB]" />
                  </div>
                  <div className="text-xs">
                    <label className="block mb-1 font-medium">Full Description *</label>
                    <textarea required rows={3} value={editingProd.description} onChange={(e) => setEditingProd({ ...editingProd, description: e.target.value })} className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB]" />
                  </div>
                  <div className="flex flex-wrap gap-5 text-xs">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={editingProd.isActive} onChange={(e) => setEditingProd({ ...editingProd, isActive: e.target.checked })} />
                      <span>Active on Storefront</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={editingProd.isBestseller} onChange={(e) => setEditingProd({ ...editingProd, isBestseller: e.target.checked })} />
                      <span>Mark as Bestseller</span>
                    </label>
                  </div>
                  <button type="submit" className="px-5 py-2.5 bg-[#702F32] text-[#FAF7F0] text-xs font-medium">
                    Save Product to Firestore
                  </button>
                </form>
              )}

              <div className="bg-white border border-[#E5DCCB] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F3EDE0] text-[#5C574F] border-b border-[#E5DCCB]">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Product</th>
                      <th className="py-3 px-4 font-semibold">Category</th>
                      <th className="py-3 px-4 font-semibold text-right">Price</th>
                      <th className="py-3 px-4 font-semibold text-right">Stock</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DCCB]">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-[#FAF7F0]">
                        <td className="py-3 px-4 font-medium text-[#242320]">{p.name}</td>
                        <td className="py-3 px-4 text-[#5C574F]">{p.categorySlug}</td>
                        <td className="py-3 px-4 text-right tabular-nums">{formatInr(p.basePriceInr)}</td>
                        <td className="py-3 px-4 text-right tabular-nums">{p.totalStock}</td>
                        <td className="py-3 px-4">{p.isActive ? 'Active' : 'Hidden'}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setIsNewProd(false);
                              setEditingProd(p);
                            }}
                            className="text-[#702F32] underline"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. Categories */}
          {activeModule === 'categories' && (
            <div className="space-y-6">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const slug =
                    catSlug.trim() ||
                    catName
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)/g, '');
                  await adminSaveCategory(
                    {
                      id: '',
                      name: catName,
                      nameHi: catNameHi || undefined,
                      slug,
                      description: catDesc,
                      imageUrl: IMAGES.dailyEssentials,
                      displayOrder: categories.length + 1,
                      isActive: true,
                      isFestival: catIsFestival,
                    },
                    true,
                    user.uid,
                    user.email || ''
                  );
                  setCatName('');
                  setCatNameHi('');
                  setCatSlug('');
                  setCatDesc('');
                  showToast('Category created.', 'success');
                }}
                className="bg-white border border-[#E5DCCB] p-6 space-y-4 text-xs"
              >
                <h2 className="font-display text-xl font-semibold text-[#242320]">Add Category or Festival Collection</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input required placeholder="Category Name" value={catName} onChange={(e) => setCatName(e.target.value)} className="px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB]" />
                  <input placeholder="Hindi Name (optional)" value={catNameHi} onChange={(e) => setCatNameHi(e.target.value)} className="px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB]" />
                  <input placeholder="slug (auto-generated)" value={catSlug} onChange={(e) => setCatSlug(e.target.value)} className="px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB]" />
                </div>
                <input required placeholder="Short description" value={catDesc} onChange={(e) => setCatDesc(e.target.value)} className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB]" />
                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={catIsFestival} onChange={(e) => setCatIsFestival(e.target.checked)} />
                    <span>Festival Collection</span>
                  </label>
                  <button type="submit" className="px-4 py-2 bg-[#702F32] text-[#FAF7F0] font-medium">
                    Create Category
                  </button>
                </div>
              </form>

              <div className="bg-white border border-[#E5DCCB] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F3EDE0] text-[#5C574F] border-b border-[#E5DCCB]">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Name</th>
                      <th className="py-3 px-4 font-semibold">Slug</th>
                      <th className="py-3 px-4 font-semibold">Type</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DCCB]">
                    {categories.map((c) => (
                      <tr key={c.id}>
                        <td className="py-3 px-4 font-medium">{c.name} {c.nameHi ? `(${c.nameHi})` : ''}</td>
                        <td className="py-3 px-4 font-mono text-[#5C574F]">{c.slug}</td>
                        <td className="py-3 px-4">{c.isFestival ? 'Festival' : 'Core Category'}</td>
                        <td className="py-3 px-4">{c.isActive ? 'Active' : 'Inactive'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. Inventory & Stock Movements */}
          {activeModule === 'inventory' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#E5DCCB] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F3EDE0] text-[#5C574F] border-b border-[#E5DCCB]">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Product & SKU</th>
                      <th className="py-3 px-4 font-semibold text-right">Current Stock</th>
                      <th className="py-3 px-4 font-semibold text-right">Quick Adjust</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DCCB]">
                    {products.map((p) =>
                      p.variants.map((v) => (
                        <tr key={v.sku}>
                          <td className="py-3 px-4">
                            <p className="font-medium text-[#242320]">{p.name}</p>
                            <p className="text-[#5C574F] font-mono">{v.sku} · {v.label}</p>
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums font-semibold">
                            <span className={v.stock <= p.lowStockThreshold ? 'text-[#702F32]' : 'text-[#242320]'}>
                              {v.stock}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              type="button"
                              onClick={async () => {
                                await adminAdjustInventory({
                                  product: p,
                                  variantSku: v.sku,
                                  delta: 10,
                                  reason: 'restock',
                                  note: 'Admin quick restock +10',
                                  actorUid: user.uid,
                                  actorEmail: user.email || '',
                                });
                                showToast(`Restocked ${v.sku} (+10).`, 'success');
                                await loadAdminData();
                              }}
                              className="px-2.5 py-1 bg-[#34483B] text-[#FAF7F0]"
                            >
                              +10 Restock
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                await adminAdjustInventory({
                                  product: p,
                                  variantSku: v.sku,
                                  delta: -1,
                                  reason: 'manual_adjustment',
                                  note: 'Admin adjustment -1',
                                  actorUid: user.uid,
                                  actorEmail: user.email || '',
                                });
                                showToast(`Adjusted ${v.sku} (-1).`, 'neutral');
                                await loadAdminData();
                              }}
                              className="px-2.5 py-1 border border-[#E5DCCB] text-[#242320]"
                            >
                              −1
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-white border border-[#E5DCCB] p-5 space-y-3">
                <h2 className="font-display text-xl font-semibold">Recent Inventory Movements</h2>
                {movements.length === 0 ? (
                  <p className="text-xs text-[#5C574F]">No stock movements logged yet.</p>
                ) : (
                  <ul className="divide-y divide-[#E5DCCB] text-xs">
                    {movements.slice(0, 15).map((m) => (
                      <li key={m.id} className="py-2 flex justify-between">
                        <span>
                          <span className="font-mono">{m.variantSku}</span> · {m.reason} ({m.note || '—'})
                        </span>
                        <span className="tabular-nums font-semibold">{m.delta > 0 ? `+${m.delta}` : m.delta}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* 5. Orders & Fulfillment */}
          {activeModule === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-white border border-[#E5DCCB] p-10 text-center text-sm text-[#5C574F]">
                  No authenticated Firestore orders recorded yet.
                </div>
              ) : (
                orders.map((ord) => (
                  <OrderFulfillmentRow
                    key={ord.id}
                    order={ord}
                    onUpdate={async (orderStatus, paymentStatus, carrier, tracking) => {
                      await adminUpdateOrderFulfillment({
                        orderId: ord.id,
                        orderNumber: ord.orderNumber,
                        orderStatus,
                        paymentStatus,
                        shipmentCarrier: carrier,
                        trackingNumber: tracking,
                        actorUid: user.uid,
                        actorEmail: user.email || '',
                      });
                      showToast(`Order ${ord.orderNumber} updated.`, 'success');
                      await loadAdminData();
                    }}
                  />
                ))
              )}
            </div>
          )}

          {/* 6. Customers */}
          {activeModule === 'customers' && (
            <div className="bg-white border border-[#E5DCCB] overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F3EDE0] text-[#5C574F] border-b border-[#E5DCCB]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Name</th>
                    <th className="py-3 px-4 font-semibold">Email</th>
                    <th className="py-3 px-4 font-semibold">Phone</th>
                    <th className="py-3 px-4 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DCCB]">
                  {customers.map((c) => (
                    <tr key={c.uid}>
                      <td className="py-3 px-4 font-medium">{c.displayName}</td>
                      <td className="py-3 px-4 text-[#5C574F]">{c.email}</td>
                      <td className="py-3 px-4 tabular-nums">{c.phone || '—'}</td>
                      <td className="py-3 px-4 text-[#5C574F]">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 7. Coupons */}
          {activeModule === 'coupons' && (
            <div className="space-y-6">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await adminSaveCoupon(
                    {
                      id: cpCode.toUpperCase(),
                      code: cpCode.toUpperCase(),
                      description: cpDesc,
                      discountType: cpType,
                      discountValue: cpVal,
                      minOrderInr: cpMin,
                      maxDiscountInr: cpType === 'percentage' ? cpMax : undefined,
                      isActive: true,
                      usageCount: 0,
                    },
                    user.uid,
                    user.email || ''
                  );
                  setCpCode('');
                  setCpDesc('');
                  showToast('Coupon saved.', 'success');
                  await loadAdminData();
                }}
                className="bg-white border border-[#E5DCCB] p-6 space-y-4 text-xs"
              >
                <h2 className="font-display text-xl font-semibold">Create Promotional Coupon</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input required placeholder="Code (e.g. DIWALI15)" value={cpCode} onChange={(e) => setCpCode(e.target.value.toUpperCase())} className="px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB] font-mono" />
                  <select value={cpType} onChange={(e) => setCpType(e.target.value as 'percentage' | 'flat')} className="px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB]">
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat INR (₹)</option>
                  </select>
                  <input type="number" required min={1} value={cpVal} onChange={(e) => setCpVal(Number(e.target.value))} placeholder="Discount Value" className="px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB] tabular-nums" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input required placeholder="Description" value={cpDesc} onChange={(e) => setCpDesc(e.target.value)} className="sm:col-span-2 px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB]" />
                  <input type="number" required min={0} value={cpMin} onChange={(e) => setCpMin(Number(e.target.value))} placeholder="Min Order INR" className="px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB] tabular-nums" />
                </div>
                {cpType === 'percentage' && (
                  <div className="max-w-xs">
                    <label className="block mb-1">Max Discount Cap (INR)</label>
                    <input type="number" min={0} value={cpMax} onChange={(e) => setCpMax(Number(e.target.value))} className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB] tabular-nums" />
                  </div>
                )}
                <button type="submit" className="px-4 py-2 bg-[#702F32] text-[#FAF7F0] font-medium">
                  Save Coupon
                </button>
              </form>

              <div className="bg-white border border-[#E5DCCB] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F3EDE0] text-[#5C574F] border-b border-[#E5DCCB]">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Code</th>
                      <th className="py-3 px-4 font-semibold">Details</th>
                      <th className="py-3 px-4 font-semibold text-right">Min Order</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DCCB]">
                    {coupons.map((c) => (
                      <tr key={c.code}>
                        <td className="py-3 px-4 font-mono font-semibold">{c.code}</td>
                        <td className="py-3 px-4">{c.description}</td>
                        <td className="py-3 px-4 text-right tabular-nums">{formatInr(c.minOrderInr)}</td>
                        <td className="py-3 px-4">{c.isActive ? 'Active' : 'Paused'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 8. Homepage CMS */}
          {activeModule === 'cms' && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await adminUpdateHomepageConfig(cmsForm, user.uid, user.email || '');
                showToast('Homepage storefront content published.', 'success');
                await loadAdminData();
              }}
              className="bg-white border border-[#E5DCCB] p-6 space-y-4 text-xs"
            >
              <label className="inline-flex items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  checked={cmsForm.announcementActive}
                  onChange={(e) => setCmsForm({ ...cmsForm, announcementActive: e.target.checked })}
                />
                <span>Show top announcement bar</span>
              </label>
              <div>
                <label className="block mb-1 font-medium">Announcement Bar Text</label>
                <input value={cmsForm.announcementText} onChange={(e) => setCmsForm({ ...cmsForm, announcementText: e.target.value })} className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB]" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Hero Eyebrow</label>
                <input value={cmsForm.heroEyebrow} onChange={(e) => setCmsForm({ ...cmsForm, heroEyebrow: e.target.value })} className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB]" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Hero Headline</label>
                <input value={cmsForm.heroHeadline} onChange={(e) => setCmsForm({ ...cmsForm, heroHeadline: e.target.value })} className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB]" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Hero Subheadline</label>
                <textarea rows={3} value={cmsForm.heroSubheadline} onChange={(e) => setCmsForm({ ...cmsForm, heroSubheadline: e.target.value })} className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB]" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Primary CTA Button Label</label>
                <input value={cmsForm.heroCtaLabel} onChange={(e) => setCmsForm({ ...cmsForm, heroCtaLabel: e.target.value })} className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB]" />
              </div>
              <button type="submit" className="px-5 py-2.5 bg-[#702F32] text-[#FAF7F0] font-medium">
                Publish Homepage Changes
              </button>
            </form>
          )}

          {/* 9. Refunds */}
          {activeModule === 'refunds' && (
            <div className="space-y-4">
              {refunds.length === 0 ? (
                <div className="bg-white border border-[#E5DCCB] p-10 text-center text-sm text-[#5C574F]">
                  No return or refund requests pending.
                </div>
              ) : (
                refunds.map((ref) => (
                  <div key={ref.id} className="bg-white border border-[#E5DCCB] p-5 space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#242320]">{ref.orderNumber} · {formatInr(ref.amountInr)}</span>
                      <span className="capitalize text-[#702F32] font-medium">{ref.status}</span>
                    </div>
                    <p className="text-[#5C574F]">{ref.reason}: {ref.details}</p>
                    <div className="flex gap-2">
                      {(['approved', 'processed', 'rejected'] as RefundStatus[]).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={async () => {
                            await adminUpdateRefundStatus({
                              refundId: ref.id,
                              orderNumber: ref.orderNumber,
                              status: st,
                              adminNote: `Marked ${st} by admin`,
                              actorUid: user.uid,
                              actorEmail: user.email || '',
                            });
                            showToast(`Refund marked ${st}.`, 'success');
                            await loadAdminData();
                          }}
                          className="px-3 py-1.5 border border-[#E5DCCB] capitalize hover:border-[#702F32]"
                        >
                          Mark {st}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 10. Support */}
          {activeModule === 'support' && (
            <div className="space-y-4">
              {tickets.length === 0 ? (
                <div className="bg-white border border-[#E5DCCB] p-10 text-center text-sm text-[#5C574F]">
                  No customer support tickets yet.
                </div>
              ) : (
                tickets.map((t) => (
                  <div key={t.id} className="bg-white border border-[#E5DCCB] p-5 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#242320]">{t.subject} ({t.email})</span>
                      <span className="capitalize text-[#702F32]">{t.status}</span>
                    </div>
                    <p className="text-[#5C574F]">{t.message}</p>
                    <div className="flex gap-2 pt-2">
                      {(['in_progress', 'resolved'] as SupportStatus[]).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={async () => {
                            await adminUpdateSupportTicket({
                              ticketId: t.id,
                              status: st,
                              adminReply:
                                st === 'resolved'
                                  ? 'Thank you for contacting AKSHAT Care. Your inquiry has been resolved.'
                                  : 'Our operations team is reviewing your request.',
                              actorUid: user.uid,
                              actorEmail: user.email || '',
                            });
                            showToast(`Ticket updated to ${st}.`, 'success');
                            await loadAdminData();
                          }}
                          className="px-3 py-1.5 border border-[#E5DCCB] capitalize hover:border-[#702F32]"
                        >
                          Set {st.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 11. Audit Logs */}
          {activeModule === 'audit' && (
            <div className="bg-white border border-[#E5DCCB] overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F3EDE0] text-[#5C574F] border-b border-[#E5DCCB]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Timestamp</th>
                    <th className="py-3 px-4 font-semibold">Actor</th>
                    <th className="py-3 px-4 font-semibold">Action</th>
                    <th className="py-3 px-4 font-semibold">Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DCCB]">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[#5C574F]">
                        No administrative actions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="py-3 px-4 tabular-nums text-[#5C574F] whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4">{log.actorEmail}</td>
                        <td className="py-3 px-4 font-mono">{log.action}</td>
                        <td className="py-3 px-4 text-[#5C574F]">{log.summary}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const OrderFulfillmentRow: React.FC<{
  order: Order;
  onUpdate: (status: OrderStatus, paymentStatus: PaymentStatus, carrier: string, tracking: string) => Promise<void>;
}> = ({ order, onUpdate }) => {
  const [status, setStatus] = useState<OrderStatus>(order.orderStatus);
  const [payStatus, setPayStatus] = useState<PaymentStatus>(order.paymentStatus);
  const [carrier, setCarrier] = useState(order.shipmentCarrier || 'BlueDart');
  const [tracking, setTracking] = useState(order.trackingNumber || '');

  return (
    <div className="bg-white border border-[#E5DCCB] p-5 space-y-3 text-xs">
      <div className="flex flex-wrap justify-between gap-2 pb-2 border-b border-[#E5DCCB]">
        <div>
          <span className="font-semibold text-[#242320]">{order.orderNumber}</span>
          <span className="text-[#5C574F]"> · {order.customerName} ({order.customerEmail})</span>
        </div>
        <span className="font-semibold tabular-nums">{formatInr(order.totalInr)}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block mb-1 text-[#5C574F]">Order Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} className="w-full px-2.5 py-2 bg-[#FAF7F0] border border-[#E5DCCB]">
            <option value="confirmed">Confirmed</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 text-[#5C574F]">Payment</label>
          <select value={payStatus} onChange={(e) => setPayStatus(e.target.value as PaymentStatus)} className="w-full px-2.5 py-2 bg-[#FAF7F0] border border-[#E5DCCB]">
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 text-[#5C574F]">Courier & Tracking</label>
          <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="AWB / Tracking #" className="w-full px-2.5 py-2 bg-[#FAF7F0] border border-[#E5DCCB]" />
        </div>
        <button
          type="button"
          onClick={() => void onUpdate(status, payStatus, carrier, tracking)}
          className="px-4 py-2 bg-[#702F32] text-[#FAF7F0] font-medium hover:bg-[#582225]"
        >
          Update Order
        </button>
      </div>
      <input
        type="hidden"
        value={carrier}
        onChange={(e) => setCarrier(e.target.value)}
      />
    </div>
  );
};
