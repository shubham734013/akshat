import React, { useState } from 'react';
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { LotusMedallion } from './IndianMotifs';

export const Header: React.FC = () => {
  const {
    route,
    navigate,
    user,
    isAdmin,
    homepageConfig,
    cartTotals,
    wishlistIds,
    setCartDrawerOpen,
  } = useStore();

  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    setSearchOpen(false);
    setMobileMenuOpen(false);
    navigate({ page: 'shop', search: q || undefined });
  };

  const navItems: { label: string; active: boolean; onClick: () => void }[] = [
    {
      label: 'Shop',
      active: route.page === 'shop' && !route.festival && route.category !== 'pooja-kits',
      onClick: () => navigate({ page: 'shop' }),
    },
    {
      label: 'Pooja Kits',
      active: route.page === 'shop' && route.category === 'pooja-kits',
      onClick: () => navigate({ page: 'shop', category: 'pooja-kits' }),
    },
    {
      label: 'Festivals',
      active: route.page === 'shop' && Boolean(route.festival),
      onClick: () => navigate({ page: 'shop', festival: 'diwali' }),
    },
    {
      label: 'Ritual Guides',
      active: route.page === 'guides',
      onClick: () => navigate({ page: 'guides' }),
    },
    {
      label: 'Our Story',
      active: route.page === 'about',
      onClick: () => navigate({ page: 'about' }),
    },
  ];

  return (
    <div className="sticky top-0 z-40 border-b border-[var(--theme-primary-dark)]/40 transition-colors duration-300 shadow-sm">
      {/* Slim Deep Royal Maroon Announcement Strip */}
      {homepageConfig.announcementActive && !bannerDismissed && (
        <div className="bg-[var(--theme-primary-dark)] text-[#F6E8CC] text-xs px-4 py-1.5 border-b border-[var(--theme-gold)]/30">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <p className="truncate tracking-wide mx-auto text-center font-normal">
              <span className="font-hi-serif text-[var(--theme-gold-bright)] mr-2 hidden sm:inline">शुभम्</span>
              {homepageConfig.announcementText}
            </p>
            <button
              type="button"
              aria-label="Dismiss announcement"
              onClick={() => setBannerDismissed(true)}
              className="text-[#F6E8CC]/80 hover:text-[#F6E8CC] shrink-0 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Embossed Antique Gold Heritage Top Navigation Bar (Strict 3-Zone Contract) */}
      <header className="gilded-heritage-bar">
        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4 lg:gap-8">
          {/* Zone 1: Brand Wordmark with Yatra One Devanagari Lipi */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 -ml-1 text-[var(--theme-primary-dark)] hover:text-[var(--theme-primary)]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <a
              href="#/"
              onClick={(e) => {
                e.preventDefault();
                navigate({ page: 'home' });
              }}
              className="text-[var(--theme-primary-dark)] hover:opacity-85 transition-opacity whitespace-nowrap shrink-0 flex items-center gap-1.5 sm:gap-2"
            >
              <LotusMedallion className="hidden sm:block w-6 h-4 text-[var(--theme-primary)] shrink-0" />
              <span className="font-display text-lg sm:text-2xl font-bold tracking-[0.08em] sm:tracking-[0.12em]">
                AKSHAT
              </span>
              <span className="font-hi-display text-sm sm:text-base font-normal tracking-normal text-[var(--theme-primary)]">
                अक्षत
              </span>
            </a>
          </div>

          {/* Zone 2: Primary Navigation Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-7 text-sm font-semibold text-[var(--theme-primary-dark)]/85"
          >
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                  item.active
                    ? 'text-[var(--theme-primary-dark)] border-[var(--theme-primary-dark)]'
                    : 'border-transparent hover:text-[var(--theme-primary-dark)] hover:border-[var(--theme-primary)]/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Utility Icons + Primary Cart Action */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            <button
              type="button"
              aria-label="Search products"
              onClick={() => setSearchOpen((prev) => !prev)}
              className="p-2 text-[var(--theme-primary-dark)] hover:bg-[var(--theme-primary)]/10 transition-colors"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            <button
              type="button"
              aria-label={`Wishlist (${wishlistIds.length} saved)`}
              onClick={() => navigate({ page: 'account' })}
              className="hidden sm:inline-flex items-center gap-1 p-2 text-[var(--theme-primary-dark)] hover:bg-[var(--theme-primary)]/10 transition-colors"
            >
              <Heart className="w-[18px] h-[18px]" />
              {wishlistIds.length > 0 && (
                <span className="text-xs tabular-nums text-[var(--theme-primary-dark)] font-bold">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            <button
              type="button"
              aria-label={user ? 'Customer account' : 'Sign in or account'}
              onClick={() => navigate({ page: isAdmin && route.page === 'account' ? 'admin' : 'account' })}
              className="p-2 text-[var(--theme-primary-dark)] hover:bg-[var(--theme-primary)]/10 transition-colors"
            >
              <User className="w-[18px] h-[18px]" />
            </button>

            <button
              type="button"
              aria-label={`Open shopping bag, ${cartTotals.itemCount} items`}
              onClick={() => setCartDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 bg-[var(--theme-primary)] text-[#F8ECDA] text-xs font-medium tracking-wide border border-[var(--theme-gold-bright)]/40 hover:bg-[var(--theme-primary-dark)] transition-colors whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="tabular-nums">Bag ({cartTotals.itemCount})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Expandable Search Bar */}
      {searchOpen && (
        <div className="border-t border-[var(--theme-border)] bg-[var(--theme-bg)] px-4 py-3">
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center gap-3">
            <label htmlFor="header-search-input" className="sr-only">
              Search pooja essentials, kits, or brassware
            </label>
            <Search className="w-4 h-4 text-[var(--theme-ink-muted)] shrink-0" />
            <input
              id="header-search-input"
              type="search"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Satyanarayan kit, kumkum, brass diya, camphor..."
              className="w-full bg-transparent text-sm text-[var(--theme-ink)] placeholder:text-[var(--theme-ink-muted)]/70 py-1.5 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-[var(--theme-primary)] text-[#FAF7F0] text-xs font-medium whitespace-nowrap shrink-0 hover:bg-[var(--theme-primary-dark)] transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              aria-label="Close search"
              onClick={() => setSearchOpen(false)}
              className="p-1.5 text-[var(--theme-ink-muted)] hover:text-[var(--theme-ink)]"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#241612]/50"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] bg-[var(--theme-bg)] h-full border-r border-[var(--theme-border)] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-[var(--theme-border)]">
                <span className="font-display text-xl font-bold tracking-[0.12em] text-[var(--theme-primary)] flex items-baseline gap-2">
                  AKSHAT <span className="font-hi-display text-base font-normal text-[var(--theme-accent)]">अक्षत</span>
                </span>
                <button
                  type="button"
                  aria-label="Close navigation menu"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-[var(--theme-ink)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="mt-6 flex flex-col gap-1" aria-label="Mobile navigation">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      item.onClick();
                      setMobileMenuOpen(false);
                    }}
                    className="text-left py-3 text-base font-medium text-[var(--theme-ink)] hover:text-[var(--theme-primary)] border-b border-[var(--theme-border)]/60"
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    navigate({ page: 'account' });
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-3 text-base font-medium text-[var(--theme-ink)] hover:text-[var(--theme-primary)] border-b border-[var(--theme-border)]/60"
                >
                  Account & Orders
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate({ page: 'contact' });
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-3 text-base font-medium text-[var(--theme-ink)] hover:text-[var(--theme-primary)] border-b border-[var(--theme-border)]/60"
                >
                  Contact Us
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate({ page: 'admin' });
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-3 text-sm text-[var(--theme-ink-muted)] hover:text-[var(--theme-primary)]"
                >
                  Admin Console
                </button>
              </nav>
            </div>
            <p className="text-xs text-[var(--theme-ink-muted)] font-hi-serif">
              परंपरा से जुड़ा · आज के लिए निर्मित
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
