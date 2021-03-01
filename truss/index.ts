import { generate, GenerateOpts, generateRules, makeRule, makeRules } from '@homebound/truss';
import { palette } from './palette';

const increment = 8;
const numberOfIncrements = 7;

// Abbr, pixels, line height, letter spacing.
// Line-height is generally `px * 1.1` except for the smaller sizes which have nudged-up heights.
const fonts: Record<string, { px: number; lh: number; ls: number }> = {
  f108: { px: 108, lh: 118, ls: -1.6 },
  f96: { px: 96, lh: 105, ls: -1.6 },
  f72: { px: 72, lh: 79, ls: -1.6 },
  f48: { px: 48, lh: 52, ls: -1.6 },
  f32: { px: 32, lh: 35, ls: -1.6 },
  f24: { px: 24, lh: 26, ls: -1.6 },
  f18: { px: 18, lh: 20, ls: -0.8 },
  f16: { px: 16, lh: 18, ls: -0.8 },
  f14: { px: 14, lh: 16, ls: -0.8 },
  f12: { px: 12, lh: 17, ls: -0.8 },
  f10: { px: 10, lh: 12, ls: -0.8 },
};

// Pass fonts: {} b/c we create our own font rules
const methods = generateRules({ palette, fonts: {}, numberOfIncrements });

// Customize type-scale with per-fontSize letterSpacing and lineHeight
methods['type-scale'] = Object.entries(fonts).map(([abbr, { px, lh, ls }]) =>
  makeRule(abbr, { fontSize: `${px}px`, lineHeight: `${lh}px`, letterSpacing: `${ls}px` })
);

// TODO: It would be nice to bring this into the TRUSS lib
methods['borderRadiusRules'] = makeRules('borderRadius', {
  br0: 0,
  br3: '3px',
  br5: '5px',
  br16: '16px',
  br100: '100%',
  brPill: '9999px',
});

methods['boxShadowRules'] = [
  ...methods['boxShadowRules'],
  ...makeRules('boxShadow', {
    shadowBasic: `0px 4px 8px ${palette.TransparentGray}, 0px 2px 16px rgba(53, 53, 53, 0.03)`,
    shadowHover: `0px 4px 8px rgba(53, 53, 53, 0.1), 0px 2px 24px ${palette.TransparentGray}`,
  }),
];

const aliases: Record<string, string[]> = {
  bodyText: ['f14', 'black'],
  t10: ['f10', 'black'],
  t12: ['f12', 'black'],
  t12up: ['f12', 'black', 'ttu'],
  t14: ['f14', 'black'],
  t14up: ['f14', 'black', 'ttu'],
  t16: ['f16', 'black'],
  t18: ['f18', 'black'],
  t24: ['f24', 'black'],
  t32: ['f32', 'black'],
};

const typeAliases: GenerateOpts['typeAliases'] = {
  Position: ['top', 'right', 'bottom', 'left', 'position', 'zIndex'],
};

// Optionally configure breakpoints to sm/md/mdAndUp/mdOrLg/etc. media query consts
const breakpoints = { xs: 0, sm: 600, md: 960, lg: 1280, xl: 1920 };

generate({
  outputPath: '../src/Css.ts',
  methods,
  palette,
  increment,
  aliases,
  typeAliases,
  breakpoints,
}).then(
  () => console.log('done'),
  (err) => console.error(err)
);
