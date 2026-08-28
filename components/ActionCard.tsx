import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, shadow, spacing } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAccessibleLayout } from '@/utils/accessibility';

type ActionCardProps = {
  title: string;
  description: string;
  symbol: string;
  onPress: () => void;
  color?: string;
  backgroundColor?: string;
  accessibilityHint?: string;
  footer?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function ActionCard({ title, description, symbol, onPress, color = colors.primary, backgroundColor = colors.surface, accessibilityHint, footer, style }: ActionCardProps) {
  const { isLargeText } = useAccessibleLayout();
  const { t } = useLanguage();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      style={({ pressed }) => [styles.card, isLargeText && styles.cardLargeText, { backgroundColor }, pressed && styles.pressed, style]}
    >
      <View style={[styles.symbolBox, { backgroundColor: color }]} accessible={false}><Text allowFontScaling={false} style={styles.symbol}>{symbol}</Text></View>
      <View style={[styles.copy, isLargeText && styles.copyLargeText]}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <Text style={[styles.touchHint, { color }]}>{t('common.tapToOpen')}</Text>
        {footer}
      </View>
      <Text allowFontScaling={false} style={[styles.arrow, isLargeText && styles.arrowLargeText, { color }]} accessible={false}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 164, borderRadius: radius.lg, borderWidth: 3, borderColor: colors.border, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, ...shadow },
  cardLargeText: { alignItems: 'flex-start', flexDirection: 'column' },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  symbolBox: { width: 80, height: 80, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  symbol: { color: colors.surface, fontSize: 39, lineHeight: 46, fontWeight: '900' },
  copy: { flex: 1 },
  copyLargeText: { flex: 0, alignSelf: 'stretch', paddingRight: spacing.lg },
  title: { color: colors.text, fontSize: 28, lineHeight: 39, fontWeight: '900' },
  description: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '700', marginTop: spacing.xs },
  touchHint: { fontSize: 18, lineHeight: 25, fontWeight: '900', marginTop: spacing.sm },
  arrow: { fontSize: 46, lineHeight: 50, fontWeight: '700' },
  arrowLargeText: { position: 'absolute', top: spacing.lg, right: spacing.lg },
});
