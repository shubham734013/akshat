import React from 'react';
import { useStore } from '../context/StoreContext';
import { HERITAGE_THEME_LIST } from '../utils/heritageThemes';
import { LotusMedallion, OrnamentalTapestryStrip } from './IndianMotifs';

export const Footer: React.FC = () => {
  const { navigate, heritageTheme, setHeritageTheme } = useStore();

  return (
    <footer className="bg-[var(--theme-footer-bg)] text-[#F6EBD8] transition-colors duration-300">
      <OrnamentalTapestryStrip
        variant={
          heritageTheme === 'madhubani'
            ? 'paisley'
            : heritageTheme === 'pichwai'
            ? 'peacock'
            : 'amara'
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#F6EBD8]/15">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <LotusMedallion className="w-7 h-5 text-[var(--theme-gold-bright)]" />
              <span className="font-display text-2xl font-semibold tracking-[0.14em] text-[#F6EBD8]">AKSHAT</span>
              <span className="font-hi-display text-lg font-normal text-[var(--theme-gold-bright)]">अक्षत</span>
            </div>
            <p className="font-hi-serif text-sm text-[var(--theme-gold-bright)]">
              परंपरा से जुड़ा · आज के लिए निर्मित
            </p>
            <p className="text-sm text-[#F6EBD8]/80 max-w-sm leading-relaxed">
              Rooted in Tradition. Crafted for Today. Authentic Indian pooja essentials, complete ritual kits, and
              handcrafted brass and copper vessels with clear ingredients, weights, and regional origin.
            </p>
            <div className="pt-2 space-y-2">
              <p className="text-xs text-[#F6EBD8]/65">Cultural Art Theme</p>
              <div className="flex flex-wrap items-center gap-2">
                {HERITAGE_THEME_LIST.map((theme) => {
                  const active = heritageTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setHeritageTheme(theme.id)}
                      className={`px-3 py-1.5 text-xs border transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                        active
                          ? 'border-[var(--theme-gold-bright)] bg-[#F6EBD8]/12 text-[#F6EBD8]'
                          : 'border-[#F6EBD8]/25 text-[#F6EBD8]/75 hover:text-[#F6EBD8] hover:border-[#F6EBD8]/50'
                      }`}
                    >
                      <span>{theme.name}</span>
                      <span className="font-hi-serif text-[var(--theme-gold-bright)]">{theme.nameHi}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="text-xs text-[#F6EBD8]/65 pt-1">
              Customer Care: care@akshatrituals.in · Monday to Saturday, 9:30 AM – 6:30 PM IST
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-sans text-xs font-semibold tracking-[0.14em] text-[var(--theme-gold-bright)]">Shop</h3>
            <ul className="space-y-2.5 text-sm text-[#F6EBD8]/80">
              <li>
                <button type="button" onClick={() => navigate({ page: 'shop', category: 'daily-pooja-essentials' })} className="hover:text-white">
                  Daily Pooja Essentials
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate({ page: 'shop', category: 'pooja-kits' })} className="hover:text-white">
                  Curated Pooja Kits
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate({ page: 'shop', category: 'devotional-accessories' })} className="hover:text-white">
                  Devotional Accessories
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate({ page: 'shop', festival: 'diwali' })} className="hover:text-white">
                  Festival Collections
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-sans text-xs font-semibold tracking-[0.14em] text-[var(--theme-gold-bright)]">Learn & Care</h3>
            <ul className="space-y-2.5 text-sm text-[#F6EBD8]/80">
              <li>
                <button type="button" onClick={() => navigate({ page: 'guides' })} className="hover:text-white">
                  Ritual Guides & Blog
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate({ page: 'about' })} className="hover:text-white">
                  About AKSHAT
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate({ page: 'faq' })} className="hover:text-white">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate({ page: 'contact' })} className="hover:text-white">
                  Contact & Bulk Orders
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-sans text-xs font-semibold tracking-[0.14em] text-[var(--theme-gold-bright)]">Policies & Account</h3>
            <ul className="space-y-2.5 text-sm text-[#F6EBD8]/80">
              <li>
                <button type="button" onClick={() => navigate({ page: 'account' })} className="hover:text-white">
                  My Account & Tracking
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate({ page: 'shipping-policy' })} className="hover:text-white">
                  Shipping Policy
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate({ page: 'returns-policy' })} className="hover:text-white">
                  Returns & Refunds
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate({ page: 'privacy-policy' })} className="hover:text-white">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate({ page: 'terms' })} className="hover:text-white">
                  Terms & Conditions
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#F6EBD8]/65">
          <p>© {new Date().getFullYear()} AKSHAT (अक्षत) Essentials. All rights reserved. Prices in INR inclusive of GST.</p>
          <button
            type="button"
            onClick={() => navigate({ page: 'admin' })}
            className="text-[#F6EBD8]/75 hover:text-[var(--theme-gold-bright)] transition-colors"
          >
            Store Admin Console
          </button>
        </div>
      </div>
    </footer>
  );
};
