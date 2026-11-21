import React, { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  HERITAGE_THEME_LIST,
  type HeritageThemeId,
} from '../utils/heritageThemes';
import { LotusMedallion } from './IndianMotifs';

/**
 * React Bits-inspired BlurText reveal: crisp word-by-word blur-to-sharp entrance
 * using compositor-only transform, opacity, and filter properties.
 */
interface BlurTextRevealProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'p' | 'span';
  delayOffset?: number;
}

export const BlurTextReveal: React.FC<BlurTextRevealProps> = ({
  text,
  className = '',
  as = 'h1',
  delayOffset = 0,
}) => {
  const prefersReduced = useReducedMotion();
  const words = text.split(' ');
  const Tag = as;

  if (prefersReduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={className}>
      {words.map((word, idx) => (
        <motion.span
          key={`${word}-${idx}`}
          initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 0.42,
            delay: delayOffset + idx * 0.04,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="inline-block mr-[0.26em] last:mr-0"
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
};

/**
 * React Bits SpotlightCard + 21st.dev interactive radial border glow card.
 * Illuminates gently with warm antique gold / saffron sheen under the pointer.
 */
interface SpotlightHeritageCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  onClick?: () => void;
}

export const SpotlightHeritageCard: React.FC<SpotlightHeritageCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(185, 145, 79, 0.16)',
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCoords((prev) => ({ ...prev, active: false }))}
      onClick={onClick}
      className={`relative overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-10"
        style={{
          opacity: coords.active ? 1 : 0,
          background: `radial-gradient(280px circle at ${coords.x}px ${coords.y}px, ${spotlightColor}, transparent 72%)`,
        }}
      />
      {children}
    </div>
  );
};

/**
 * React Bits TiltedCard-inspired subtle 3D perspective container for heritage arch photography.
 */
interface TiltedHeritageArchProps {
  children: React.ReactNode;
  className?: string;
}

export const TiltedHeritageArch: React.FC<TiltedHeritageArchProps> = ({
  children,
  className = '',
}) => {
  const prefersReduced = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced || !frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rx: Number((-py * 4.5).toFixed(2)),
      ry: Number((px * 4.5).toFixed(2)),
    });
  };

  return (
    <div
      ref={frameRef}
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
      className={`relative [perspective:1100px] ${className}`}
    >
      <div
        className="w-full h-full transition-transform duration-200 ease-out will-change-transform"
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * 21st.dev ShimmerButton + React Bits ShinyText primary CTA button.
 */
interface ShinyHeritageButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const ShinyHeritageButton: React.FC<ShinyHeritageButtonProps> = ({
  children,
  className = '',
  type = 'button',
  ...props
}) => (
  <button
    type={type}
    {...props}
    className={`group relative overflow-hidden inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[var(--theme-primary)] text-[#FAF7F0] text-sm font-medium tracking-wide hover:bg-[var(--theme-primary-dark)] transition-colors whitespace-nowrap ${className}`}
  >
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-[#E5C98E]/30 to-transparent"
    />
    <span className="relative z-10 inline-flex items-center gap-2.5">{children}</span>
  </button>
);

/**
 * 21st.dev Animated Segmented Tabs (using Framer Motion layoutId) for switching
 * live between Sanganeri, Madhubani, and Pichwai cultural art themes.
 */
interface HeritageThemeTabsProps {
  activeTheme: HeritageThemeId;
  onSelect: (id: HeritageThemeId) => void;
  layoutNamespace?: string;
  compact?: boolean;
}

export const HeritageThemeTabs: React.FC<HeritageThemeTabsProps> = ({
  activeTheme,
  onSelect,
  layoutNamespace = 'hero-theme',
  compact = false,
}) => (
  <div
    role="group"
    aria-label="Select Indian cultural art theme"
    className="inline-flex flex-wrap items-center gap-1 p-1 bg-[var(--theme-surface)] border border-[var(--theme-border)]"
  >
    {HERITAGE_THEME_LIST.map((theme) => {
      const isActive = theme.id === activeTheme;
      return (
        <button
          key={theme.id}
          type="button"
          aria-pressed={isActive}
          onClick={() => onSelect(theme.id)}
          className={`relative ${
            compact ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-1.5 text-xs'
          } font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            isActive
              ? 'text-[#FAF7F0]'
              : 'text-[var(--theme-ink-muted)] hover:text-[var(--theme-ink)]'
          }`}
        >
          {isActive && (
            <motion.span
              layoutId={`active-heritage-tab-${layoutNamespace}`}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="absolute inset-0 bg-[var(--theme-primary)]"
              aria-hidden="true"
            />
          )}
          <span
            aria-hidden="true"
            className="relative z-10 w-2 h-2 rounded-full border border-white/40 shrink-0"
            style={{ backgroundColor: theme.swatches.accent }}
          />
          <span className="relative z-10">{theme.name}</span>
          <span
            className={`relative z-10 font-hi-serif text-[12px] ${
              isActive ? 'text-[#E7C98A]' : 'text-[var(--theme-accent)]'
            }`}
          >
            {theme.nameHi}
          </span>
        </button>
      );
    })}
  </div>
);

/**
 * 21st.dev Infinite Marquee showcasing India's sacred craft hubs in Devanagari & English.
 */
const CRAFT_CLUSTERS = [
  { hi: 'सांगानेर', en: 'Sanganer Block Print' },
  { hi: 'मिथिला', en: 'Madhubani Folk Art' },
  { hi: 'नाथद्वारा', en: 'Pichwai Miniature' },
  { hi: 'मुरादाबाद', en: 'Moradabad Solid Brass' },
  { hi: 'कन्नौज', en: 'Kannauj Natural Dhoop' },
  { hi: 'काशी', en: 'Kashi Sacred Threads' },
  { hi: 'इरोड', en: 'Erode Pure Turmeric' },
  { hi: 'उज्जैन', en: 'Ujjain Ritual Craft' },
];

export const CulturalCraftMarquee: React.FC = () => (
  <div
    className="w-full overflow-hidden bg-[var(--theme-surface)] border-y border-[var(--theme-border)] py-3.5 select-none"
    aria-label="Indian craft heritage clusters"
  >
    <div className="akshat-marquee-track flex items-center gap-8 w-max">
      {[...CRAFT_CLUSTERS, ...CRAFT_CLUSTERS].map((item, index) => (
        <div key={`${item.en}-${index}`} className="flex items-center gap-8 shrink-0">
          <div className="flex items-baseline gap-2.5 whitespace-nowrap">
            <span className="font-hi-display text-base text-[var(--theme-primary)]">
              {item.hi}
            </span>
            <span className="text-xs tracking-[0.1em] text-[var(--theme-ink-muted)] font-medium">
              {item.en}
            </span>
          </div>
          <LotusMedallion className="w-5 h-3.5 text-[var(--theme-gold)] opacity-80 shrink-0" />
        </div>
      ))}
    </div>
  </div>
);
