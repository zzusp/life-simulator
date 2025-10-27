// Design tokens for UI/UX redesign
// These tokens are presentation-oriented and do not affect business logic.

export const motion = {
  duration: {
    fast: 150,
    standard: 200,
    emphasized: 250,
    slow: 300,
    scoreAnimationMin: 800,
    scoreAnimationMax: 1200,
    toastItem: 3000,
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)', // ease-out like curve
  },
  extent: {
    translateMaxPx: 8, // <= 8px
    scaleMaxPct: 0.02, // <= 2%
  },
  throttleMs: 300,
};

export const radius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
};

export const colors = {
  // Semantic palette placeholders (Tailwind variables are primary)
  info: 'hsl(var(--accent))',
  success: '#16a34a',
  warning: '#f59e0b',
  danger: 'hsl(var(--destructive))',
};

export const scoreLabels = [
  { min: 90, label: '卓越' },
  { min: 80, label: '优秀' },
  { min: 70, label: '良好' },
  { min: 60, label: '及格' },
  { min: 40, label: '一般' },
  { min: -Infinity, label: '需要努力' },
];

export function getScoreLabelFor(score: number): string {
  const item = scoreLabels.find((s) => score >= s.min);
  return item ? item.label : '需要努力';
}
