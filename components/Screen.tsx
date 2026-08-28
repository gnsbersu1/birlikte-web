import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/theme';
import { useAccessibleLayout } from '@/utils/accessibility';

type ScreenProps = PropsWithChildren<{
  title: string;
  eyebrow?: string;
  description?: string;
  right?: ReactNode;
}>;

export function Screen({ title, eyebrow, description, right, children }: ScreenProps) {
  const { isLargeText } = useAccessibleLayout();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, isLargeText && styles.contentLargeText]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <View style={[styles.headingRow, isLargeText && styles.headingRowLargeText]}>
          <View style={styles.headingCopy}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            <Text style={styles.title} accessibilityRole="header">{title}</Text>
            {description ? <Text style={styles.description}>{description}</Text> : null}
          </View>
          {right}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 128 },
  contentLargeText: { paddingBottom: 190 },
  headingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  headingRowLargeText: { flexDirection: 'column' },
  headingCopy: { flex: 1 },
  eyebrow: { color: colors.coral, fontSize: 18, lineHeight: 25, fontWeight: '900', letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: spacing.xs },
  title: { color: colors.text, fontSize: 34, lineHeight: 48, fontWeight: '900', letterSpacing: -0.7 },
  description: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '700', marginTop: spacing.sm },
});
