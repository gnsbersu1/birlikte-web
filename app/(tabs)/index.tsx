import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Modal, StyleSheet, Text, View } from 'react-native';
import { ActionCard } from '@/components/ActionCard';
import { LanguageChooser } from '@/components/LanguageChooser';
import { Screen } from '@/components/Screen';
import { useLanguage } from '@/contexts/LanguageContext';
import { colors, radius, shadow, spacing } from '@/constants/theme';
import { useAccessibleLayout } from '@/utils/accessibility';

export default function HomeScreen() {
  const router = useRouter();
  const [showLanguageChooser, setShowLanguageChooser] = useState(false);
  const { isLargeText } = useAccessibleLayout();
  const { language, t } = useLanguage();
  return (
    <Screen title={t('home.title')} description={t('home.description')}>
      <View style={styles.logoCard}>
        <Image
          source={require('@/assets/wiser-logo.jpeg')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel="WISER logosu"
        />
      </View>

      <View style={styles.cards}>
        <ActionCard title={t('home.learnTitle')} description={t('home.learnDescription')} symbol="☝" color={colors.blue} backgroundColor={colors.blueSoft} onPress={() => router.push('/teknoloji')} accessibilityHint={t('home.learnHint')} />
        <ActionCard title={t('home.relativeTitle')} description={t('home.relativeDescription')} symbol="♥" color={colors.primary} backgroundColor={colors.primarySoft} onPress={() => router.push('/yakinlar')} accessibilityHint={t('home.relativeHint')} />
        <ActionCard title={t('home.emergencyTitle')} description={t('home.emergencyDescription')} symbol="+" color={colors.danger} backgroundColor={colors.dangerSoft} onPress={() => router.push('/acil')} accessibilityHint={t('home.emergencyHint')} />
        <ActionCard title={t('language.change')} description={t(language === 'de' ? 'language.currentGerman' : 'language.currentTurkish')} symbol="Aa" color={colors.gold} backgroundColor={colors.goldSoft} onPress={() => setShowLanguageChooser(true)} accessibilityHint={t('home.languageHint')} />
      </View>

      <View style={[styles.safety, isLargeText && styles.safetyLargeText]}><Text allowFontScaling={false} style={styles.safetyIcon}>✓</Text><View style={styles.safetyCopy}><Text style={styles.safetyTitle}>{t('home.safeTitle')}</Text><Text style={styles.safetyText}>{t('home.safeText')}</Text></View></View>
      <Modal visible={showLanguageChooser} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setShowLanguageChooser(false)}>
        <LanguageChooser onClose={() => setShowLanguageChooser(false)} />
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logoCard: {
    width: '75%',
    maxWidth: 360,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadow,
  },
  logo: {
    width: '100%',
    height: 72,
    maxWidth: 320,
    aspectRatio: 386 / 190,
  },
  cards: { gap: spacing.lg, marginTop: spacing.lg },
  safety: { marginTop: spacing.xl, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.primary, flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  safetyLargeText: { alignItems: 'flex-start', flexDirection: 'column' },
  safetyIcon: { width: 42, height: 42, borderRadius: 21, color: colors.surface, backgroundColor: colors.primary, fontSize: 25, lineHeight: 42, fontWeight: '900', textAlign: 'center' },
  safetyCopy: { flex: 1 },
  safetyTitle: { color: colors.text, fontSize: 26, lineHeight: 36, fontWeight: '900' },
  safetyText: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '700', marginTop: spacing.xs },
});

