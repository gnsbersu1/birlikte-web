import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { ActionCard } from '@/components/ActionCard';
import { LanguageChooser } from '@/components/LanguageChooser';
import { Screen } from '@/components/Screen';
import { useLanguage } from '@/contexts/LanguageContext';
import { colors, radius, spacing } from '@/constants/theme';
import { useAccessibleLayout } from '@/utils/accessibility';

export default function HomeScreen() {
  const router = useRouter();
  const [showLanguageChooser, setShowLanguageChooser] = useState(false);
  const { isLargeText } = useAccessibleLayout();
  const { language, t } = useLanguage();
  return (
    <Screen title={t('home.title')} description={t('home.description')}>
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
  cards: { gap: spacing.lg, marginTop: spacing.xl },
  safety: { marginTop: spacing.xl, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.primary, flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  safetyLargeText: { alignItems: 'flex-start', flexDirection: 'column' },
  safetyIcon: { width: 42, height: 42, borderRadius: 21, color: colors.surface, backgroundColor: colors.primary, fontSize: 25, lineHeight: 42, fontWeight: '900', textAlign: 'center' },
  safetyCopy: { flex: 1 },
  safetyTitle: { color: colors.text, fontSize: 24, lineHeight: 34, fontWeight: '900' },
  safetyText: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '700', marginTop: spacing.xs },
});
