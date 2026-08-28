import { Platform } from 'react-native';

export const colors = {
  background: '#F7F3E8',
  surface: '#FFFFFF',
  text: '#102F2A',
  textMuted: '#4F625E',
  primary: '#075E54',
  primaryDark: '#03463E',
  primarySoft: '#DCECE7',
  coral: '#B8472E',
  coralSoft: '#F8DDD5',
  blue: '#185E83',
  blueSoft: '#DDECF3',
  gold: '#8A6112',
  goldSoft: '#F8E7AF',
  danger: '#A51D22',
  dangerDark: '#791116',
  dangerSoft: '#F8D9DB',
  border: '#A8B4B0',
  black: '#071C18',
} as const;

export const spacing = { xs: 6, sm: 10, md: 16, lg: 22, xl: 30, xxl: 40 } as const;
export const radius = { sm: 12, md: 18, lg: 24, round: 999 } as const;
export const shadow = Platform.select({
  ios: { shadowColor: colors.black, shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  android: { elevation: 3 },
  default: {},
});
