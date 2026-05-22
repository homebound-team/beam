/**
 * AUTO-GENERATED — do not edit by hand. Source: tokens/tokens.json (DTCG 2025.10 — duration + cubicBezier types).
 * Run yarn generate:design-tokens, yarn build, or yarn build:truss.
 *
 * Motion tokens are JS-only literals (not CSS variables) because Beam's animation behavior
 * is static — Truss bakes these strings into class declarations at build time.
 */

export const motion = {
  duration: {
    "fast": "150ms",
    "normal": "200ms",
    "slow": "300ms",
  },
  easing: {
    "standard": "cubic-bezier(0.4, 0, 0.2, 1)",
    "decelerate": "cubic-bezier(0, 0, 0.2, 1)",
    "accelerate": "cubic-bezier(0.4, 0, 1, 1)",
  },
} as const;
