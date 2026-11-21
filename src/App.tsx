import React from 'react';
import { X } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './components/HomePage';
import { CatalogPage } from './components/CatalogPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CheckoutPage } from './components/CheckoutPage';
import { AccountPage } from './components/AccountPage';
import {
  AboutPage,
  ContactPage,
  FaqPage,
  PolicyPage,
  RitualGuidesPage,
} from './components/EditorialPages';
import { AdminDashboard } from './components/AdminDashboard';

const AppShell: React.FC = () => {
  const { route, toast, dismissToast } = useStore();

  const renderPage = () => {
    switch (route.page) {
      case 'shop':
        return <CatalogPage />;
      case 'product':
        return <ProductDetailPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'account':
        return <AccountPage />;
      case 'guides':
        return <RitualGuidesPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'faq':
        return <FaqPage />;
      case 'shipping-policy':
      case 'returns-policy':
      case 'privacy-policy':
      case 'terms':
        return <PolicyPage type={route.page} />;
      case 'admin':
        return <AdminDashboard />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--theme-bg)] text-[var(--theme-ink)] transition-colors duration-300">
      <Header />
      <div className="flex-1">{renderPage()}</div>
      <Footer />
      <CartDrawer />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 right-5 z-50 max-w-sm px-4 py-3 text-xs font-medium shadow-md border flex items-center justify-between gap-4 ${
            toast.tone === 'error'
              ? 'bg-[var(--theme-primary)] text-[#FAF7F0] border-[var(--theme-primary-dark)]'
              : toast.tone === 'success'
              ? 'bg-[var(--theme-secondary)] text-[#FAF7F0] border-[var(--theme-secondary-deep)]'
              : 'bg-[var(--theme-ink)] text-[#FAF7F0] border-[#3a3833]'
          }`}
        >
          <span>{toast.text}</span>
          <button type="button" aria-label="Dismiss notification" onClick={dismissToast} className="opacity-80 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <AppShell />
      </StoreProvider>
    </ErrorBoundary>
  );
}
