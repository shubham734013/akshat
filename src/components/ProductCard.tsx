import React from 'react';
import { Heart } from 'lucide-react';
import type { Product } from '../types/commerce';
import { useStore } from '../context/StoreContext';
import { formatInr } from '../utils/commerce';
import { SafeImage } from './SafeImage';
import { SpotlightHeritageCard } from './HeritageMotion';
import { CraftCornerOrnament } from './IndianMotifs';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { navigate, addToCart, wishlistIds, toggleWishlist } = useStore();
  const isSaved = wishlistIds.includes(product.id);
  const defaultVariant = product.variants[0];
  const inStock = product.totalStock > 0 && defaultVariant && defaultVariant.stock > 0;

  return (
    <SpotlightHeritageCard className="group flex flex-col bg-[var(--theme-surface-alt)] border border-[var(--theme-border)] hover:border-[var(--theme-gold)]">
      <article className="flex flex-col flex-1">
        <div className="relative aspect-[4/3] bg-[var(--theme-surface)] overflow-hidden">
          <a
            href={`#/product/${encodeURIComponent(product.slug)}`}
            onClick={(e) => {
              e.preventDefault();
              navigate({ page: 'product', slug: product.slug });
            }}
            className="block w-full h-full"
          >
            <SafeImage
              src={product.imageUrl}
              alt={product.name}
              fallbackTitle={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </a>
          <CraftCornerOrnament position="tl" />
          <CraftCornerOrnament position="bl" />
          <button
            type="button"
            aria-label={isSaved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            onClick={() => void toggleWishlist(product.id)}
            className="absolute top-3 right-3 z-20 p-2 bg-[var(--theme-bg)]/90 text-[var(--theme-ink)] hover:text-[var(--theme-primary)] transition-colors border border-[var(--theme-border)]/70"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-[var(--theme-primary)] text-[var(--theme-primary)]' : ''}`} />
          </button>
        </div>

        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4 relative z-20">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-[var(--theme-ink-muted)] truncate">
              <span className="truncate">{product.origin.split(';')[0]}</span>
              <span aria-hidden="true">·</span>
              <span className="shrink-0">{defaultVariant?.weightOrCount || 'Standard'}</span>
            </div>
            <h3 className="font-display text-xl font-semibold text-[var(--theme-ink)] leading-snug">
              <a
                href={`#/product/${encodeURIComponent(product.slug)}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate({ page: 'product', slug: product.slug });
                }}
                className="hover:text-[var(--theme-primary)] transition-colors"
              >
                {product.name}
              </a>
            </h3>
            {product.nameHi && (
              <p className="font-hi-serif text-[13px] text-[var(--theme-accent)]">{product.nameHi}</p>
            )}
            <p className="text-xs text-[var(--theme-ink-muted)] line-clamp-2 leading-relaxed pt-0.5">
              {product.shortDescription}
            </p>
          </div>

          <div className="pt-3 border-t border-[var(--theme-border)]/80 flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-2 tabular-nums">
              <span className="text-base font-semibold text-[var(--theme-ink)]">
                {formatInr(product.basePriceInr)}
              </span>
              {product.compareAtPriceInr && product.compareAtPriceInr > product.basePriceInr && (
                <span className="text-xs text-[var(--theme-ink-muted)] line-through">
                  {formatInr(product.compareAtPriceInr)}
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={!inStock}
              onClick={() => defaultVariant && addToCart(product, defaultVariant, 1, true)}
              className={`px-3.5 py-2 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                inStock
                  ? 'bg-[var(--theme-ink)] text-[#FAF7F0] hover:bg-[var(--theme-primary)]'
                  : 'bg-[var(--theme-border)] text-[var(--theme-ink-muted)] cursor-not-allowed'
              }`}
            >
              {inStock ? 'Add to Bag' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </article>
    </SpotlightHeritageCard>
  );
};
