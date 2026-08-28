import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAccessibleLayout } from '@/utils/accessibility';

const icons: Record<string, string> = { index: '⌂', teknoloji: '☝', yakinlar: '♥', acil: '+' };

function TabIcon({ route, focused }: { route: string; focused: boolean }) {
  return <View style={[styles.icon, focused && styles.iconActive]}><Text allowFontScaling={false} style={[styles.iconText, focused && styles.iconTextActive]}>{icons[route]}</Text></View>;
}

export default function TabLayout() {
  const { fontScale, isLargeText, isExtraLargeText } = useAccessibleLayout();
  const { language, t } = useLanguage();
  const tabBarHeight = isLargeText ? 108 + Math.round(Math.min(fontScale - 1, 1) * 42) : 108;

  return (
    <Tabs screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primaryDark,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarHideOnKeyboard: true,
      tabBarLabelStyle: styles.label,
      tabBarStyle: [styles.bar, { height: tabBarHeight }],
      tabBarItemStyle: [styles.item, isLargeText && styles.itemLargeText],
      tabBarIconStyle: isExtraLargeText ? styles.hiddenIcon : undefined,
      tabBarIcon: ({ focused }) => isExtraLargeText ? null : <TabIcon route={route.name} focused={focused} />,
    })}>
      <Tabs.Screen name="index" options={{ title: t(isLargeText || language === 'de' ? 'tabs.homeLarge' : 'tabs.home') }} />
      <Tabs.Screen name="teknoloji" options={{ title: t('tabs.phone') }} />
      <Tabs.Screen name="yakinlar" options={{ title: t(isLargeText || language === 'de' ? 'tabs.relativesLarge' : 'tabs.relatives') }} />
      <Tabs.Screen name="acil" options={{ title: t(isLargeText || language === 'de' ? 'tabs.emergencyLarge' : 'tabs.emergency') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: { height: 108, paddingTop: 8, paddingBottom: 12, backgroundColor: colors.surface, borderTopWidth: 3, borderTopColor: colors.border },
  item: { minHeight: 86 },
  itemLargeText: { paddingHorizontal: 2 },
  label: { fontSize: 18, lineHeight: 25, fontWeight: '900' },
  icon: { width: 44, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  iconActive: { backgroundColor: colors.primary },
  iconText: { color: colors.textMuted, fontSize: 27, lineHeight: 32, fontWeight: '900' },
  iconTextActive: { color: colors.surface },
  hiddenIcon: { display: 'none' },
});
