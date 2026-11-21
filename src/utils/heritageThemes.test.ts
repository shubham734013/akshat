import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_HERITAGE_THEME,
  HERITAGE_THEME_LIST,
  HERITAGE_THEMES,
  getHeritageThemeSpec,
  resolveHeritageTheme,
} from './heritageThemes';

test('resolveHeritageTheme returns valid theme IDs and falls back to sanganeri', () => {
  assert.equal(resolveHeritageTheme('sanganeri'), 'sanganeri');
  assert.equal(resolveHeritageTheme('madhubani'), 'madhubani');
  assert.equal(resolveHeritageTheme('pichwai'), 'pichwai');
  assert.equal(resolveHeritageTheme('unknown-theme'), DEFAULT_HERITAGE_THEME);
  assert.equal(resolveHeritageTheme(null), DEFAULT_HERITAGE_THEME);
  assert.equal(resolveHeritageTheme(undefined), DEFAULT_HERITAGE_THEME);
});

test('all cultural heritage themes provide Devanagari names, shlokas, artwork paths, and hex swatches', () => {
  assert.equal(HERITAGE_THEME_LIST.length, 3);
  const hexPattern = /^#[0-9A-Fa-f]{6}$/;

  for (const spec of HERITAGE_THEME_LIST) {
    assert.ok(spec.name.length > 0);
    assert.ok(/[\u0900-\u097F]/.test(spec.nameHi), `${spec.id} nameHi must contain Devanagari script`);
    assert.ok(/[\u0900-\u097F]/.test(spec.shloka), `${spec.id} shloka must contain Devanagari script`);
    assert.ok(spec.artImageUrl.startsWith('/src/assets/images/'));
    assert.match(spec.swatches.canvas, hexPattern);
    assert.match(spec.swatches.primary, hexPattern);
    assert.match(spec.swatches.secondary, hexPattern);
    assert.match(spec.swatches.accent, hexPattern);
    assert.match(spec.swatches.gold, hexPattern);
  }
});

test('getHeritageThemeSpec matches HERITAGE_THEMES lookup', () => {
  assert.deepEqual(getHeritageThemeSpec('madhubani'), HERITAGE_THEMES.madhubani);
  assert.deepEqual(getHeritageThemeSpec('pichwai'), HERITAGE_THEMES.pichwai);
});
