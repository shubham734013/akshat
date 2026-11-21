import React, { useState } from 'react';
import { LogOut, Package, Shield, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { INDIAN_STATES } from '../data/catalog';
import { formatInr, validatePincode } from '../utils/commerce';
import {
  cancelOwnOrder,
  createRefundRequest,
  createSupportTicket,
  deleteUserAddress,
  saveUserAddress,
  updateUserProfile,
} from '../services/firestoreService';
import { ProductCard } from './ProductCard';

type AccountTab = 'orders' | 'addresses' | 'wishlist' | 'refunds' | 'support' | 'profile';

export const AccountPage: React.FC = () => {
  const {
    user,
    profile,
    isAdmin,
    signInWithGoogle,
    signOut,
    addresses,
    orders,
    wishlistIds,
    products,
    refunds,
    supportTickets,
    navigate,
    showToast,
  } = useStore();

  const [tab, setTab] = useState<AccountTab>('orders');
  const [profileName, setProfileName] = useState(profile?.displayName || user?.displayName || '');
  const [profilePhone, setProfilePhone] = useState(profile?.phone || '');

  // Address form
  const [addrLabel, setAddrLabel] = useState('Home');
  const [addrName, setAddrName] = useState(profile?.displayName || '');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('Maharashtra');
  const [addrPin, setAddrPin] = useState('');

  // Refund form
  const [refundOrderId, setRefundOrderId] = useState('');
  const [refundReason, setRefundReason] = useState('Damaged in transit');
  const [refundDetails, setRefundDetails] = useState('');

  // Support ticket form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketOrderNum, setTicketOrderNum] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const pinCheck = validatePincode(addrPin);
    if (!pinCheck.valid) {
      showToast(pinCheck.message, 'error');
      return;
    }
    await saveUserAddress(user.uid, {
      label: addrLabel,
      fullName: addrName || user.displayName || 'Customer',
      phone: addrPhone,
      line1: addrLine1,
      city: addrCity,
      state: addrState,
      pincode: addrPin,
      isDefault: addresses.length === 0,
    });
    setAddrLine1('');
    setAddrCity('');
    setAddrPin('');
    showToast('Address saved to your address book.', 'success');
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const target = orders.find((o) => o.id === refundOrderId);
    if (!target) {
      showToast('Select an eligible order first.', 'error');
      return;
    }
    if (refundDetails.trim().length < 5) {
      showToast('Please briefly describe the issue.', 'error');
      return;
    }
    await createRefundRequest({
      orderId: target.id,
      orderNumber: target.orderNumber,
      userId: user.uid,
      reason: refundReason,
      details: refundDetails,
      amountInr: target.totalInr,
    });
    setRefundDetails('');
    showToast('Return / refund request submitted.', 'success');
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (ticketSubject.trim().length < 2 || ticketMessage.trim().length < 5) {
      showToast('Please provide a subject and message.', 'error');
      return;
    }
    await createSupportTicket({
      userId: user.uid,
      name: profile?.displayName || user.displayName || 'Customer',
      email: user.email || '',
      subject: ticketSubject,
      message: ticketMessage,
      orderNumber: ticketOrderNum || undefined,
    });
    setTicketSubject('');
    setTicketOrderNum('');
    setTicketMessage('');
    showToast('Support request created.', 'success');
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="pb-8 border-b border-[#E5DCCB] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs tracking-[0.14em] text-[#702F32] font-medium">Customer Account</p>
          <h1 className="font-display text-4xl font-semibold text-[#242320]">
            {user ? `Namaste, ${profile?.displayName || user.displayName || 'Guest'}` : 'Orders, Wishlist & Account'}
          </h1>
          {user && <p className="text-xs text-[#5C574F]">{user.email}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate({ page: 'admin' })}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#34483B] text-[#FAF7F0] text-xs font-medium hover:opacity-90"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Open Admin Dashboard</span>
            </button>
          )}
          {user ? (
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center gap-2 px-4 py-2 border border-[#E5DCCB] bg-white text-xs font-medium text-[#242320] hover:border-[#702F32]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void signInWithGoogle()}
              className="px-5 py-2.5 bg-[#702F32] text-[#FAF7F0] text-xs font-medium hover:bg-[#582225] transition-colors"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="py-5 border-b border-[#E5DCCB] flex flex-wrap gap-2">
        {(
          [
            { id: 'orders', label: `Orders (${orders.length})` },
            { id: 'wishlist', label: `Wishlist (${wishlistProducts.length})` },
            { id: 'addresses', label: `Address Book (${addresses.length})` },
            { id: 'refunds', label: `Returns & Refunds (${refunds.length})` },
            { id: 'support', label: `Support (${supportTickets.length})` },
            { id: 'profile', label: 'Profile' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
              tab === t.id
                ? 'bg-[#702F32] text-[#FAF7F0]'
                : 'bg-[#F3EDE0] text-[#242320] hover:bg-[#E5DCCB]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-8">
        {tab === 'orders' && (
          <div className="space-y-6">
            {!user && orders.length > 0 && (
              <p className="text-xs text-[#5C574F] bg-[#F3EDE0] px-4 py-2.5 border border-[#E5DCCB]">
                Showing guest orders placed on this device. Sign in with Google to sync future orders across devices.
              </p>
            )}
            {orders.length === 0 ? (
              <div className="p-12 bg-white border border-[#E5DCCB] text-center space-y-4">
                <Package className="w-8 h-8 text-[#B99357] mx-auto" />
                <h2 className="font-display text-2xl font-semibold text-[#242320]">No orders yet</h2>
                <p className="text-sm text-[#5C574F] max-w-sm mx-auto">
                  When you place an order, its shipment timeline, courier tracking number, and GST receipt appear here.
                </p>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'shop' })}
                  className="px-6 py-2.5 bg-[#702F32] text-[#FAF7F0] text-xs font-medium"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              orders.map((ord) => (
                <article key={ord.id} className="bg-white border border-[#E5DCCB] p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E5DCCB]">
                    <div>
                      <p className="text-xs text-[#5C574F]">
                        Order <strong className="text-[#242320]">{ord.orderNumber}</strong> ·{' '}
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-[#5C574F] mt-0.5">
                        Status: <strong className="text-[#34483B] capitalize">{ord.orderStatus}</strong> · Payment:{' '}
                        <span className="capitalize">{ord.paymentStatus}</span>
                        {ord.trackingNumber && (
                          <span>
                            {' '}
                            · Tracking: {ord.shipmentCarrier || 'Courier'} #{ord.trackingNumber}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-base font-semibold tabular-nums text-[#242320]">
                        {formatInr(ord.totalInr)}
                      </span>
                      {user && ord.orderStatus === 'confirmed' && (
                        <button
                          type="button"
                          onClick={async () => {
                            await cancelOwnOrder(ord.id);
                            showToast(`Order ${ord.orderNumber} cancelled.`, 'neutral');
                          }}
                          className="text-xs text-[#702F32] underline"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-sm">
                    {ord.items.map((item) => (
                      <li key={item.variantSku} className="flex justify-between text-[#242320]">
                        <span>
                          {item.productName} <span className="text-xs text-[#5C574F]">({item.variantLabel} × {item.quantity})</span>
                        </span>
                        <span className="tabular-nums">{formatInr(item.lineTotalInr)}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))
            )}
          </div>
        )}

        {tab === 'wishlist' && (
          <div>
            {wishlistProducts.length === 0 ? (
              <div className="p-12 bg-white border border-[#E5DCCB] text-center space-y-3">
                <h2 className="font-display text-2xl font-semibold text-[#242320]">Your wishlist is empty</h2>
                <p className="text-sm text-[#5C574F]">Save pooja kits or brass vessels to revisit before upcoming festivals.</p>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'shop' })}
                  className="px-6 py-2.5 bg-[#702F32] text-[#FAF7F0] text-xs font-medium"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlistProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'addresses' && (
          !user ? (
            <div className="p-10 bg-white border border-[#E5DCCB] text-center space-y-4">
              <p className="text-sm text-[#5C574F]">Sign in with Google to save and reuse addresses across checkouts.</p>
              <button type="button" onClick={() => void signInWithGoogle()} className="px-5 py-2.5 bg-[#702F32] text-[#FAF7F0] text-xs font-medium">
                Sign in with Google
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-6 space-y-4">
                <h2 className="font-display text-2xl font-semibold text-[#242320]">Saved Addresses</h2>
                {addresses.length === 0 ? (
                  <p className="text-sm text-[#5C574F]">No saved addresses yet.</p>
                ) : (
                  addresses.map((addr) => (
                    <div key={addr.id} className="p-5 bg-white border border-[#E5DCCB] flex justify-between gap-4">
                      <div className="text-sm space-y-1">
                        <p className="font-semibold text-[#242320]">{addr.label} · {addr.fullName}</p>
                        <p className="text-[#5C574F]">{addr.line1}</p>
                        <p className="text-[#5C574F]">{addr.city}, {addr.state} — {addr.pincode}</p>
                        <p className="text-xs text-[#5C574F] tabular-nums">{addr.phone}</p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Delete ${addr.label} address`}
                        onClick={() => void deleteUserAddress(user.uid, addr.id)}
                        className="text-[#5C574F] hover:text-[#702F32] self-start p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSaveAddress} className="lg:col-span-6 p-6 bg-white border border-[#E5DCCB] space-y-4">
                <h2 className="font-display text-2xl font-semibold text-[#242320]">Add New Address</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="addr-label" className="block text-xs mb-1">Label</label>
                    <input id="addr-label" value={addrLabel} onChange={(e) => setAddrLabel(e.target.value)} required className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB] text-sm" />
                  </div>
                  <div>
                    <label htmlFor="addr-name" className="block text-xs mb-1">Full Name</label>
                    <input id="addr-name" value={addrName} onChange={(e) => setAddrName(e.target.value)} required className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB] text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="addr-phone" className="block text-xs mb-1">Phone</label>
                    <input id="addr-phone" value={addrPhone} onChange={(e) => setAddrPhone(e.target.value)} required className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB] text-sm" />
                  </div>
                  <div>
                    <label htmlFor="addr-pin" className="block text-xs mb-1">PIN Code</label>
                    <input id="addr-pin" maxLength={6} value={addrPin} onChange={(e) => setAddrPin(e.target.value.replace(/\D/g, ''))} required className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB] text-sm" />
                  </div>
                </div>
                <div>
                  <label htmlFor="addr-line1" className="block text-xs mb-1">Street Address</label>
                  <input id="addr-line1" value={addrLine1} onChange={(e) => setAddrLine1(e.target.value)} required className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB] text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="addr-city" className="block text-xs mb-1">City</label>
                    <input id="addr-city" value={addrCity} onChange={(e) => setAddrCity(e.target.value)} required className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB] text-sm" />
                  </div>
                  <div>
                    <label htmlFor="addr-state" className="block text-xs mb-1">State</label>
                    <select id="addr-state" value={addrState} onChange={(e) => setAddrState(e.target.value)} className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB] text-sm">
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" className="px-5 py-2.5 bg-[#702F32] text-[#FAF7F0] text-xs font-medium">
                  Save Address
                </button>
              </form>
            </div>
          )
        )}

        {tab === 'refunds' && (
          !user ? (
            <div className="p-10 bg-white border border-[#E5DCCB] text-center space-y-4">
              <p className="text-sm text-[#5C574F]">Sign in with Google to submit or track return and refund requests.</p>
              <button type="button" onClick={() => void signInWithGoogle()} className="px-5 py-2.5 bg-[#702F32] text-[#FAF7F0] text-xs font-medium">Sign in with Google</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-6 space-y-4">
                <h2 className="font-display text-2xl font-semibold text-[#242320]">Your Return & Refund Requests</h2>
                {refunds.length === 0 ? (
                  <p className="text-sm text-[#5C574F]">No return or refund requests submitted.</p>
                ) : (
                  refunds.map((ref) => (
                    <div key={ref.id} className="p-5 bg-white border border-[#E5DCCB] space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-semibold text-[#242320]">{ref.orderNumber}</span>
                        <span className="text-xs font-medium capitalize text-[#702F32]">{ref.status}</span>
                      </div>
                      <p className="text-xs text-[#5C574F]">{ref.reason} · {formatInr(ref.amountInr)}</p>
                      <p className="text-[#5C574F]">{ref.details}</p>
                      {ref.adminNote && <p className="text-xs text-[#34483B] pt-2 border-t border-[#E5DCCB]">Note: {ref.adminNote}</p>}
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleRefundSubmit} className="lg:col-span-6 p-6 bg-white border border-[#E5DCCB] space-y-4">
                <h2 className="font-display text-2xl font-semibold text-[#242320]">Request a Return or Refund</h2>
                <div>
                  <label htmlFor="ref-order" className="block text-xs mb-1">Select Order</label>
                  <select id="ref-order" value={refundOrderId} onChange={(e) => setRefundOrderId(e.target.value)} required className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB] text-sm">
                    <option value="">Choose an order...</option>
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.orderNumber} — {formatInr(o.totalInr)} ({o.orderStatus})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="ref-reason" className="block text-xs mb-1">Reason</label>
                  <select id="ref-reason" value={refundReason} onChange={(e) => setRefundReason(e.target.value)} className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB] text-sm">
                    <option>Damaged in transit</option>
                    <option>Missing item in kit</option>
                    <option>Unopened return within 7 days</option>
                    <option>Wrong variant received</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="ref-details" className="block text-xs mb-1">Details</label>
                  <textarea id="ref-details" rows={4} required value={refundDetails} onChange={(e) => setRefundDetails(e.target.value)} className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB] text-sm" />
                </div>
                <button type="submit" className="px-5 py-2.5 bg-[#702F32] text-[#FAF7F0] text-xs font-medium">
                  Submit Request
                </button>
              </form>
            </div>
          )
        )}

        {tab === 'support' && (
          !user ? (
            <div className="p-10 bg-white border border-[#E5DCCB] text-center space-y-4">
              <p className="text-sm text-[#5C574F]">Sign in with Google to raise and track customer support tickets.</p>
              <button type="button" onClick={() => void signInWithGoogle()} className="px-5 py-2.5 bg-[#702F32] text-[#FAF7F0] text-xs font-medium">Sign in with Google</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-6 space-y-4">
                <h2 className="font-display text-2xl font-semibold text-[#242320]">Support History</h2>
                {supportTickets.length === 0 ? (
                  <p className="text-sm text-[#5C574F]">No support tickets yet.</p>
                ) : (
                  supportTickets.map((t) => (
                    <div key={t.id} className="p-5 bg-white border border-[#E5DCCB] space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-semibold text-[#242320]">{t.subject}</span>
                        <span className="text-xs capitalize text-[#702F32]">{t.status.replace('_', ' ')}</span>
                      </div>
                      <p className="text-[#5C574F]">{t.message}</p>
                      {t.adminReply && <p className="text-xs text-[#34483B] pt-2 border-t border-[#E5DCCB]">AKSHAT Care: {t.adminReply}</p>}
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSupportSubmit} className="lg:col-span-6 p-6 bg-white border border-[#E5DCCB] space-y-4">
                <h2 className="font-display text-2xl font-semibold text-[#242320]">New Support Ticket</h2>
                <div>
                  <label htmlFor="sup-subject" className="block text-xs mb-1">Subject</label>
                  <input id="sup-subject" required value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB] text-sm" />
                </div>
                <div>
                  <label htmlFor="sup-order" className="block text-xs mb-1">Order Number (Optional)</label>
                  <input id="sup-order" value={ticketOrderNum} onChange={(e) => setTicketOrderNum(e.target.value)} placeholder="AKS-2611-XXXX" className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB] text-sm" />
                </div>
                <div>
                  <label htmlFor="sup-msg" className="block text-xs mb-1">Message</label>
                  <textarea id="sup-msg" rows={4} required value={ticketMessage} onChange={(e) => setTicketMessage(e.target.value)} className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB] text-sm" />
                </div>
                <button type="submit" className="px-5 py-2.5 bg-[#702F32] text-[#FAF7F0] text-xs font-medium">
                  Send to Customer Care
                </button>
              </form>
            </div>
          )
        )}

        {tab === 'profile' && (
          !user ? (
            <div className="p-10 bg-white border border-[#E5DCCB] text-center space-y-4">
              <p className="text-sm text-[#5C574F]">Sign in with Google to manage your AKSHAT profile.</p>
              <button type="button" onClick={() => void signInWithGoogle()} className="px-5 py-2.5 bg-[#702F32] text-[#FAF7F0] text-xs font-medium">Sign in with Google</button>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await updateUserProfile(user.uid, profileName, profilePhone);
                showToast('Profile updated.', 'success');
              }}
              className="max-w-lg p-6 bg-white border border-[#E5DCCB] space-y-4"
            >
              <h2 className="font-display text-2xl font-semibold text-[#242320]">Profile Details</h2>
              <div>
                <label htmlFor="prof-name" className="block text-xs mb-1">Display Name</label>
                <input id="prof-name" value={profileName} onChange={(e) => setProfileName(e.target.value)} required className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB] text-sm" />
              </div>
              <div>
                <label htmlFor="prof-phone" className="block text-xs mb-1">Mobile Number</label>
                <input id="prof-phone" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} placeholder="9876543210" className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E5DCCB] text-sm" />
              </div>
              <button type="submit" className="px-5 py-2.5 bg-[#702F32] text-[#FAF7F0] text-xs font-medium">
                Save Changes
              </button>
            </form>
          )
        )}
      </div>
    </main>
  );
};
