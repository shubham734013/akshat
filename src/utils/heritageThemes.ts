export type HeritageThemeId = 'sanganeri' | 'madhubani' | 'pichwai';

export interface HeritageThemeSpec {
  id: HeritageThemeId;
  name: string;
  nameHi: string;
  region: string;
  regionHi: string;
  traditionTag: string;
  shloka: string;
  shlokaMeaning: string;
  description: string;
  artImageUrl: string;
  swatches: {
    canvas: string;
    primary: string;
    secondary: string;
    accent: string;
    gold: string;
  };
}

export const DEFAULT_HERITAGE_THEME: HeritageThemeId = 'sanganeri';

export const HERITAGE_THEMES: Record<HeritageThemeId, HeritageThemeSpec> = {
  sanganeri: {
    id: 'sanganeri',
    name: 'Sanganeri',
    nameHi: 'सांगानेरी',
    region: 'Jaipur, Rajasthan',
    regionHi: 'जयपुर, राजस्थान',
    traditionTag: '16th-Century Hand Block Print',
    shloka: 'शुभम् करोति कल्याणम्',
    shlokaMeaning: 'May this light bring auspiciousness and peace',
    description:
      'Rooted in Jaipur’s delicate floral calico woodblocks — madder crimson lotuses, marigold butas, and forest-green vines printed on raw ivory khadi.',
    artImageUrl: '/src/assets/images/art_sanganeri_panel_1795241125892.jpg',
    swatches: {
      canvas: '#FAF6EE',
      primary: '#7A262B',
      secondary: '#2E473B',
      accent: '#C66828',
      gold: '#B9914F',
    },
  },
  madhubani: {
    id: 'madhubani',
    name: 'Madhubani',
    nameHi: 'मधुबनी',
    region: 'Mithila, Bihar',
    regionHi: 'मिथिला, बिहार',
    traditionTag: 'Mithila Kachni & Bharni Folk Art',
    shloka: 'असतो मा सद्गमय',
    shlokaMeaning: 'Lead us from the unreal toward timeless truth',
    description:
      'Inspired by Mithila’s sacred courtyard murals — fine double-line kachni ink hatching, rising sun mandalas, vermilion sindoor, and turmeric ochre on handmade paper.',
    artImageUrl: '/src/assets/images/art_madhubani_panel_1795241124341.jpg',
    swatches: {
      canvas: '#F7EFE0',
      primary: '#9A2E25',
      secondary: '#234247',
      accent: '#B9781A',
      gold: '#C4913B',
    },
  },
  pichwai: {
    id: 'pichwai',
    name: 'Pichwai',
    nameHi: 'पिछवाई',
    region: 'Nathdwara, Rajasthan',
    regionHi: 'नाथद्वारा, राजस्थान',
    traditionTag: 'Nathdwara Temple Miniature',
    shloka: 'ॐ शान्तिः शान्तिः शान्तिः',
    shlokaMeaning: 'Invoke serenity across body, mind, and home',
    description:
      'Echoing Nathdwara’s devotional cloth paintings — blooming Kamal Talai lotuses, cusped Rajasthani jharokha arches, deep temple emerald, and burnished antique gold.',
    artImageUrl: '/src/assets/images/art_pichwai_panel_1795241124488.jpg',
    swatches: {
      canvas: '#F9F4E8',
      primary: '#1E4337',
      secondary: '#7F2A36',
      accent: '#B58438',
      gold: '#C59A4B',
    },
  },
};

export const HERITAGE_THEME_LIST: HeritageThemeSpec[] = [
  HERITAGE_THEMES.sanganeri,
  HERITAGE_THEMES.madhubani,
  HERITAGE_THEMES.pichwai,
];

export function resolveHeritageTheme(raw?: string | null): HeritageThemeId {
  if (raw === 'sanganeri' || raw === 'madhubani' || raw === 'pichwai') {
    return raw;
  }
  return DEFAULT_HERITAGE_THEME;
}

export function getHeritageThemeSpec(id: HeritageThemeId): HeritageThemeSpec {
  return HERITAGE_THEMES[id] ?? HERITAGE_THEMES[DEFAULT_HERITAGE_THEME];
}
