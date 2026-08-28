import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

type ButtonProps = { label: string; onPress: () => void; accessibilityHint?: string; style?: StyleProp<ViewStyle>; danger?: boolean; secondary?: boolean };

export function LargeButton({ label, onPress, accessibilityHint, style, danger, secondary }: ButtonProps) {
  const background = danger ? colors.danger : secondary ? colors.surface : colors.primary;
  const foreground = secondary ? colors.primary : colors.surface;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityHint={accessibilityHint} onPress={onPress} style={({ pressed }) => [styles.button, { backgroundColor: background, borderColor: danger ? colors.dangerDark : colors.primary }, secondary && styles.secondary, pressed && styles.pressed, style]}>
      <Text style={[styles.label, { color: foreground }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 58, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  secondary: { backgroundColor: colors.surface },
  pressed: { opacity: 0.78 },
  label: { fontSize: 20, lineHeight: 28, fontWeight: '900', textAlign: 'center' },
});
