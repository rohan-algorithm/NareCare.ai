/**
 * NariCare visual system — Lotus Coral
 * Brand mark: lotus + heart on coral→plum. UI stays warm coral + deep moss
 * (plum only in logo moments — avoid purple-washed screens).
 */
export const colors = {
  ink: '#1C1A22',
  forest: '#2A3D38',
  teal: '#3D6B5C',
  tealMid: '#4F8A76',
  mist: '#F3EDEB',
  mistDeep: '#E8D9D4',
  blush: '#FF7A6A',
  blushSoft: '#FFE4DE',
  blushDeep: '#E24B5A',
  amber: '#E8A23A',
  amberSoft: '#FFF1D6',
  surface: '#FFF8F6',
  surfaceElevated: '#FFFFFF',
  paper: '#FFF8F6',
  paperDeep: '#F3E8E4',
  white: '#FFFFFF',
  line: 'rgba(28,26,34,0.08)',
  lineStrong: 'rgba(28,26,34,0.14)',
  muted: '#6B646E',
  good: '#2A8F6A',
  warn: '#D4922A',
  danger: '#E24B5A',
  overlay: 'rgba(28,26,34,0.5)',
  coral: '#FF7A6A',
  coralSoft: '#FFE4DE',
  pearl: '#FFF8F6',
  moss: '#2A3D38',
  plum: '#6A3093',
  plumSoft: '#F3E8F5',

  // Back-compat aliases
  olive: '#2F6B5A',
  oliveMid: '#4A8F7A',
  sage: '#7EB8A4',
  sageMist: '#E6F2ED',
  marigold: '#E8A23A',
  marigoldSoft: '#FFF1D6',
  rose: '#E25548',
  roseSoft: '#FFE9E5',
  clay: '#C4785A',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const fonts = {
  display: 'Outfit_600SemiBold',
  displayBold: 'Outfit_700Bold',
  body: 'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodyBold: 'PlusJakartaSans_700Bold',
} as const;

export const shadow = {
  soft: {
    shadowColor: '#1C1A22',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  lift: {
    shadowColor: '#1C1A22',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
} as const;

export const phaseColor: Record<string, string> = {
  follicular: '#4A8F7A',
  ovulation: '#E8A23A',
  luteal: '#FF7A6A',
  unknown: '#5E6F69',
};

/** Slot accent colors for Diet meal chart (sellable, scannable). */
export const mealSlotAccent = {
  breakfast: { bg: '#FFF1D6', ink: '#9A6A12', bar: '#E8A23A' },
  midMorning: { bg: '#E6F2ED', ink: '#2F6B5A', bar: '#4A8F7A' },
  lunch: { bg: '#FFE9E5', ink: '#C4453A', bar: '#FF7A6A' },
  evening: { bg: '#EEF0FF', ink: '#4A4F8A', bar: '#6B72C4' },
  dinner: { bg: '#E8F2ED', ink: '#244A3F', bar: '#244A3F' },
} as const;

export const gradients = {
  hero: ['#FF8A7A', '#E24B5A', '#9B3A74'],
  forest: ['#35524A', '#22332E'],
  ai: ['#7C5CFF', '#E24B5A'],
  soft: ['#FFFFFF', '#FFF3F0'],
} as const;

export const shadowCard = {
  shadowColor: '#3A1F2B',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.1,
  shadowRadius: 22,
  elevation: 5,
} as const;
