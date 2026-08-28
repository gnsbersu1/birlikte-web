import { Platform } from 'react-native';

export const palette = {
  mavi: '#4793D7',
  lacivert: '#033461',
  koyuMetin: '#1D1F26',
  kremArkaPlan: '#FFF8EF',
  koyuKirmizi: '#440704',
  turuncu: '#C75026',
  acikBej: '#ECD0BD',
  seftali: '#FBAE84',
  yesil: '#7B9A89',
  acikMavi: '#A3C9EB',
  beyaz: '#FFFFFF',
} as const;

export const colors = {
  background: palette.kremArkaPlan,
  surface: palette.beyaz,
  text: palette.koyuMetin,
  textMuted: palette.lacivert,
  primary: palette.lacivert,
  primaryDark: palette.lacivert,
  primarySoft: palette.acikMavi,
  coral: palette.turuncu,
  coralSoft: palette.seftali,
  blue: palette.lacivert,
  blueSoft: palette.acikMavi,
  gold: palette.turuncu,
  goldSoft: palette.acikBej,
  danger: palette.koyuKirmizi,
  dangerDark: palette.koyuKirmizi,
  dangerSoft: palette.seftali,
  border: palette.yesil,
  black: palette.koyuMetin,
} as const;

export const spacing = { xs: 6, sm: 10, md: 16, lg: 22, xl: 30, xxl: 40 } as const;
export const radius = { sm: 12, md: 18, lg: 24, round: 999 } as const;
export const shadow = Platform.select({
  ios: { shadowColor: colors.black, shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  android: { elevation: 3 },
  default: {},
});

