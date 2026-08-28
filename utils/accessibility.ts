import { useWindowDimensions } from 'react-native';

export function useAccessibleLayout() {
  const { fontScale } = useWindowDimensions();

  return {
    fontScale,
    isLargeText: fontScale >= 1.3,
    isExtraLargeText: fontScale >= 1.8,
  };
}
