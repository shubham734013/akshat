import React, { useId } from 'react';
import type { HeritageThemeId } from '../utils/heritageThemes';

interface HeritageBorderFriezeProps {
  theme: HeritageThemeId;
  className?: string;
  tone?: 'default' | 'gold' | 'light';
}

/**
 * Handcrafted SVG border frieze inspired by Jaipur Sanganeri woodblock calico,
 * Mithila Madhubani double-line kachni hatching, and Nathdwara Pichwai temple arches.
 */
export const HeritageBorderFrieze: React.FC<HeritageBorderFriezeProps> = ({
  theme,
  className = '',
  tone = 'default',
}) => {
  const uid = useId().replace(/:/g, '');
  const patternId = `frieze-${theme}-${uid}`;

  const strokePrimary =
    tone === 'gold'
      ? 'var(--theme-gold-bright)'
      : tone === 'light'
      ? 'rgba(250, 246, 238, 0.55)'
      : 'var(--theme-primary)';
  const strokeAccent =
    tone === 'light' || tone === 'gold' ? 'var(--theme-gold)' : 'var(--theme-accent)';

  return (
    <div className={`w-full overflow-hidden select-none ${className}`} aria-hidden="true">
      <svg className="w-full h-5 block" preserveAspectRatio="none">
        <defs>
          {theme === 'sanganeri' && (
            <pattern id={patternId} width="64" height="20" patternUnits="userSpaceOnUse">
              <line x1="0" y1="2" x2="64" y2="2" stroke={strokePrimary} strokeWidth="0.7" strokeOpacity="0.45" />
              <line x1="0" y1="18" x2="64" y2="18" stroke={strokePrimary} strokeWidth="0.7" strokeOpacity="0.45" />
              <path
                d="M0 10 C8 5, 14 15, 22 10 C27 7, 29 7, 32 10 C35 13, 37 13, 42 10 C50 5, 56 15, 64 10"
                fill="none"
                stroke={strokePrimary}
                strokeWidth="0.9"
                strokeOpacity="0.65"
              />
              <path d="M32 5 L35 10 L32 15 L29 10 Z" fill={strokeAccent} fillOpacity="0.6" />
              <circle cx="11" cy="10" r="1.5" fill={strokeAccent} fillOpacity="0.65" />
              <circle cx="53" cy="10" r="1.5" fill={strokeAccent} fillOpacity="0.65" />
            </pattern>
          )}

          {theme === 'madhubani' && (
            <pattern id={patternId} width="48" height="20" patternUnits="userSpaceOnUse">
              <line x1="0" y1="1.5" x2="48" y2="1.5" stroke={strokePrimary} strokeWidth="0.9" strokeOpacity="0.7" />
              <line x1="0" y1="3.5" x2="48" y2="3.5" stroke={strokePrimary} strokeWidth="0.6" strokeOpacity="0.45" />
              <line x1="0" y1="16.5" x2="48" y2="16.5" stroke={strokePrimary} strokeWidth="0.6" strokeOpacity="0.45" />
              <line x1="0" y1="18.5" x2="48" y2="18.5" stroke={strokePrimary} strokeWidth="0.9" strokeOpacity="0.7" />
              <path
                d="M0 16 L8 4 L16 16 L24 4 L32 16 L40 4 L48 16"
                fill="none"
                stroke={strokePrimary}
                strokeWidth="0.9"
                strokeOpacity="0.75"
              />
              <circle cx="8" cy="12" r="1.4" fill={strokeAccent} fillOpacity="0.8" />
              <circle cx="24" cy="12" r="1.4" fill={strokeAccent} fillOpacity="0.8" />
              <circle cx="40" cy="12" r="1.4" fill={strokeAccent} fillOpacity="0.8" />
            </pattern>
          )}

          {theme === 'pichwai' && (
            <pattern id={patternId} width="56" height="20" patternUnits="userSpaceOnUse">
              <line x1="0" y1="2" x2="56" y2="2" stroke={strokeAccent} strokeWidth="0.8" strokeOpacity="0.6" />
              <line x1="0" y1="18" x2="56" y2="18" stroke={strokeAccent} strokeWidth="0.8" strokeOpacity="0.6" />
              <path
                d="M0 16 Q7 5, 14 16 Q21 5, 28 16 Q35 5, 42 16 Q49 5, 56 16"
                fill="none"
                stroke={strokePrimary}
                strokeWidth="0.9"
                strokeOpacity="0.65"
              />
              <path d="M28 5 C30 8, 30 11, 28 13 C26 11, 26 8, 28 5 Z" fill={strokeAccent} fillOpacity="0.75" />
              <circle cx="14" cy="7.5" r="1.2" fill={strokeAccent} fillOpacity="0.6" />
              <circle cx="42" cy="7.5" r="1.2" fill={strokeAccent} fillOpacity="0.6" />
            </pattern>
          )}
        </defs>
        <rect width="100%" height="20" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
};

/**
 * Woven Indian Ornamental Tapestry Strip sliced cleanly from the user's attached
 * heritage border compendium (/assets/aistudio/image_850e863c.png).
 */
export type TapestryVariant = 'amara' | 'peacock' | 'lotus' | 'paisley' | 'chandra';

const TAPESTRY_Y_OFFSET: Record<TapestryVariant, string> = {
  amara: '4.5%',
  peacock: '26.5%',
  lotus: '48.2%',
  paisley: '69.8%',
  chandra: '91.5%',
};

export const OrnamentalTapestryStrip: React.FC<{
  variant: TapestryVariant;
  className?: string;
}> = ({ variant, className = '' }) => (
  <div
    aria-hidden="true"
    className={`w-full h-11 sm:h-14 border-y border-[var(--theme-gold)] overflow-hidden relative select-none bg-[var(--theme-primary-dark)] ${className}`}
  >
    <div
      className="w-full h-full"
      style={{
        backgroundImage: 'url("/assets/aistudio/image_850e863c.png")',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '113% auto',
        backgroundPosition: `center ${TAPESTRY_Y_OFFSET[variant]}`,
      }}
    />
  </div>
);

/**
 * Intricate Royal Gold Mandala SVG designed for dark maroon/olive hero surfaces
 * (inspired directly by the golden mandala reference without white background artifacts).
 */
export const RoyalGoldMandalaSvg: React.FC<{ className?: string }> = ({
  className = 'w-64 h-64',
}) => {
  const petals12 = Array.from({ length: 12 }, (_, i) => i * 30);
  const petals24 = Array.from({ length: 24 }, (_, i) => i * 15);

  return (
    <svg viewBox="0 0 320 320" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="akshat-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F2D798" />
          <stop offset="50%" stopColor="#C9A052" />
          <stop offset="100%" stopColor="#9A722C" />
        </linearGradient>
      </defs>

      {/* Outer scalloped filigree petals (24-fold) */}
      {petals24.map((deg) => (
        <g key={`outer-${deg}`} transform={`rotate(${deg} 160 160)`}>
          <path
            d="M160 12 C167 24, 169 36, 160 48 C151 36, 153 24, 160 12 Z"
            stroke="url(#akshat-gold-grad)"
            strokeWidth="1.2"
            fill="url(#akshat-gold-grad)"
            fillOpacity="0.08"
          />
          <circle cx="160" cy="6" r="1.7" fill="#E7C888" fillOpacity="0.85" />
          <line x1="160" y1="22" x2="160" y2="41" stroke="#E7C888" strokeWidth="0.7" strokeOpacity="0.7" />
        </g>
      ))}

      {/* Concentric sacred rings */}
      <circle cx="160" cy="160" r="112" stroke="url(#akshat-gold-grad)" strokeWidth="1.4" />
      <circle cx="160" cy="160" r="106" stroke="#E7C888" strokeWidth="0.7" strokeDasharray="3 4" />
      <circle cx="160" cy="160" r="78" stroke="url(#akshat-gold-grad)" strokeWidth="1.6" />
      <circle cx="160" cy="160" r="72" stroke="#E7C888" strokeWidth="0.8" />

      {/* Mid lotus petals (12-fold) */}
      {petals12.map((deg) => (
        <g key={`mid-${deg}`} transform={`rotate(${deg} 160 160)`}>
          <path
            d="M160 52 C173 66, 174 82, 160 94 C146 82, 147 66, 160 52 Z"
            stroke="url(#akshat-gold-grad)"
            strokeWidth="1.35"
            fill="url(#akshat-gold-grad)"
            fillOpacity="0.14"
          />
          <path
            d="M160 61 C166 70, 166 79, 160 86 C154 79, 154 70, 160 61 Z"
            stroke="#F2D798"
            strokeWidth="0.8"
          />
          <circle cx="160" cy="46" r="2.2" fill="#E7C888" />
        </g>
      ))}

      {/* Inner lotus crown (12-fold rotated 15 deg) */}
      {petals12.map((deg) => (
        <g key={`inner-${deg}`} transform={`rotate(${deg + 15} 160 160)`}>
          <path
            d="M160 96 C168 112, 168 128, 160 142 C152 128, 152 112, 160 96 Z"
            stroke="url(#akshat-gold-grad)"
            strokeWidth="1.25"
            fill="url(#akshat-gold-grad)"
            fillOpacity="0.18"
          />
          <circle cx="160" cy="116" r="1.5" fill="#F2D798" />
        </g>
      ))}

      {/* Central Bindu Sunburst */}
      <circle cx="160" cy="160" r="24" stroke="#E7C888" strokeWidth="1.4" fill="#C9A052" fillOpacity="0.16" />
      <circle cx="160" cy="160" r="12" fill="url(#akshat-gold-grad)" />
    </svg>
  );
};

/**
 * Ornate Gold Scalloped Corner Filigree inspired by the royal maroon/olive hero reference.
 */
export const ScallopedHeroCorner: React.FC<{
  position: 'tl' | 'tr' | 'bl' | 'br';
  className?: string;
}> = ({ position, className = '' }) => {
  const transforms = {
    tl: 'top-0 left-0',
    tr: 'top-0 right-0 -scale-x-100',
    bl: 'bottom-0 left-0 -scale-y-100',
    br: 'bottom-0 right-0 -scale-x-100 -scale-y-100',
  };

  return (
    <svg
      viewBox="0 0 180 180"
      fill="none"
      aria-hidden="true"
      className={`pointer-events-none select-none absolute w-24 h-24 sm:w-32 sm:h-32 text-[#DFBE7B] ${transforms[position]} ${className}`}
    >
      <path
        d="M0 0 L170 0 C150 22, 128 16, 114 34 C96 28, 78 44, 68 64 C46 72, 32 92, 34 114 C16 128, 22 150, 0 170 Z"
        fill="currentColor"
        fillOpacity="0.13"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeOpacity="0.72"
      />
      <path
        d="M8 8 L142 8 C126 26, 108 22, 96 38 C80 34, 65 48, 57 64 C41 72, 30 88, 32 104 C18 116, 22 132, 8 146 Z"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeOpacity="0.58"
      />
      <circle cx="32" cy="32" r="14" stroke="currentColor" strokeWidth="1" strokeOpacity="0.65" />
      <circle cx="32" cy="32" r="5" fill="currentColor" fillOpacity="0.6" />
      <circle cx="64" cy="22" r="2.2" fill="currentColor" fillOpacity="0.75" />
      <circle cx="22" cy="64" r="2.2" fill="currentColor" fillOpacity="0.75" />
    </svg>
  );
};

/**
 * Painted Rajasthani Torana Arch Canopy using the user's attached reference painting
 * (/assets/aistudio/image_0946e3dc.png) blended seamlessly via multiply onto warm parchment.
 */
export const PaintedToranaCanopy: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    aria-hidden="true"
    className={`w-full overflow-hidden pointer-events-none select-none ${className}`}
  >
    <img
      src="/assets/aistudio/image_0946e3dc.png"
      alt=""
      referrerPolicy="no-referrer"
      className="w-full h-24 sm:h-36 lg:h-44 object-cover object-top mix-blend-multiply opacity-95"
    />
  </div>
);

/**
 * Carved Wooden Temple Yali & Elephant Bracket using the user's attached carving
 * (/assets/aistudio/image_0cb8dd20.png) blended seamlessly via multiply onto warm parchment.
 */
export const CarvedTempleBracket: React.FC<{
  side: 'left' | 'right';
  className?: string;
}> = ({ side, className = '' }) => (
  <img
    src="/assets/aistudio/image_0cb8dd20.png"
    alt=""
    aria-hidden="true"
    referrerPolicy="no-referrer"
    className={`pointer-events-none select-none mix-blend-multiply object-contain ${
      side === 'right' ? '-scale-x-100' : ''
    } ${className}`}
  />
);

/**
 * Golden Mandala Crest rendered from the user's attached golden mandala
 * (/assets/aistudio/image_7616b8fe.png) with radial mask + multiply blend on light parchment
 * so outer corners and watermarks never show.
 */
export const ParchmentMandalaCrest: React.FC<{ className?: string }> = ({
  className = 'w-16 h-16',
}) => (
  <img
    src="/assets/aistudio/image_7616b8fe.png"
    alt=""
    aria-hidden="true"
    referrerPolicy="no-referrer"
    className={`pointer-events-none select-none mix-blend-multiply mandala-radial-mask object-contain ${className}`}
  />
);

export const LotusMedallion: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 40 28" fill="none" className={className} aria-hidden="true">
    <path
      d="M20 3 C23 9, 23 16, 20 21 C17 16, 17 9, 20 3 Z"
      stroke="currentColor"
      strokeWidth="1.2"
      fill="currentColor"
      fillOpacity="0.16"
    />
    <path
      d="M19 21 C13 18, 10 12, 12 7 C15 10, 17 15, 19 21 Z"
      stroke="currentColor"
      strokeWidth="1.1"
      fill="currentColor"
      fillOpacity="0.09"
    />
    <path
      d="M21 21 C27 18, 30 12, 28 7 C25 10, 23 15, 21 21 Z"
      stroke="currentColor"
      strokeWidth="1.1"
      fill="currentColor"
      fillOpacity="0.09"
    />
    <path d="M18 22 C11 22, 5 18, 4 13 C9 14, 14 17, 18 22 Z" stroke="currentColor" strokeWidth="1.0" fill="none" />
    <path d="M22 22 C29 22, 35 18, 36 13 C31 14, 26 17, 22 22 Z" stroke="currentColor" strokeWidth="1.0" fill="none" />
    <line x1="12" y1="25" x2="28" y2="25" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.7" />
    <circle cx="20" cy="25" r="1.4" fill="currentColor" />
  </svg>
);

export const JharokhaArchOverlay: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 400 480"
    preserveAspectRatio="none"
    fill="none"
    className={`pointer-events-none select-none ${className}`}
    aria-hidden="true"
  >
    <rect x="10" y="10" width="380" height="460" stroke="var(--theme-gold)" strokeWidth="1.2" strokeOpacity="0.65" />
    <path
      d="M 22 458 L 22 130 Q 22 98 52 92 Q 60 66 92 64 Q 112 40 148 42 Q 178 20 200 18 Q 222 20 252 42 Q 288 40 308 64 Q 340 66 348 92 Q 378 98 378 130 L 378 458 Z"
      stroke="var(--theme-gold)"
      strokeWidth="1.4"
      strokeOpacity="0.85"
      fill="none"
    />
    <path
      d="M 28 452 L 28 133 Q 28 104 56 98 Q 64 73 95 71 Q 114 48 149 50 Q 178 29 200 26 Q 222 29 251 50 Q 286 48 305 71 Q 336 73 344 98 Q 372 104 372 133 L 372 452 Z"
      stroke="rgba(250, 246, 238, 0.72)"
      strokeWidth="0.8"
      fill="none"
    />
    <path d="M22 22 L38 22 L22 38 Z" fill="var(--theme-gold)" fillOpacity="0.35" />
    <path d="M378 22 L362 22 L378 38 Z" fill="var(--theme-gold)" fillOpacity="0.35" />
    <circle cx="200" cy="14" r="2.2" fill="var(--theme-gold)" />
  </svg>
);

export const CraftCornerOrnament: React.FC<{ position: 'tl' | 'tr' | 'bl' | 'br' }> = ({
  position,
}) => {
  const rotation =
    position === 'tl' ? '' : position === 'tr' ? 'rotate-90' : position === 'br' ? 'rotate-180' : '-rotate-90';
  const placement =
    position === 'tl'
      ? 'top-2 left-2'
      : position === 'tr'
      ? 'top-2 right-2'
      : position === 'br'
      ? 'bottom-2 right-2'
      : 'bottom-2 left-2';

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`pointer-events-none absolute w-4 h-4 text-[var(--theme-gold)] opacity-75 ${placement} ${rotation}`}
      aria-hidden="true"
    >
      <path d="M2 14 L2 2 L14 2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 10 L5 5 L10 5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.7" />
      <circle cx="7.5" cy="7.5" r="1" fill="currentColor" />
    </svg>
  );
};
