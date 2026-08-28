import { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { LargeButton } from '@/components/Buttons';
import { useLanguage } from '@/contexts/LanguageContext';
import { de, tr } from '@/i18n/translations';
import { colors, radius, shadow, spacing } from '@/constants/theme';
import type { Language } from '@/i18n';

type LanguageChooserProps = { onClose?: () => void };

export function LanguageChooser({ onClose }: LanguageChooserProps) {
  const { language, setLanguage, t } = useLanguage();
  const [saving, setSaving] = useState(false);

  const chooseLanguage = async (nextLanguage: Language) => {
    setSaving(true);
    try {
      await setLanguage(nextLanguage);
      onClose?.();
    } catch {
      Alert.alert(t('language.saveErrorTitle'), t('language.saveErrorMessage'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title} accessibilityRole="header">{tr['language.choose']} / {de['language.choose']}</Text>
          <Text style={styles.description}>{tr['language.chooseDescription']}</Text>
          <Text style={styles.description}>{de['language.chooseDescription']}</Text>
          {saving ? <ActivityIndicator size="large" color={colors.primary} style={styles.loading} /> : null}
          <LargeButton label={tr['language.turkish']} onPress={() => chooseLanguage('tr')} accessibilityHint={tr['language.turkishHint']} style={styles.button} />
          <LargeButton label={de['language.german']} secondary onPress={() => chooseLanguage('de')} accessibilityHint={de['language.germanHint']} style={styles.button} />
          {onClose && language ? <LargeButton label={t('common.cancel')} secondary onPress={onClose} accessibilityHint={t('language.close')} style={styles.cancel} /> : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, width: '100%', backgroundColor: colors.background },
  content: { flex: 1, width: '100%', maxWidth: 680, alignSelf: 'center', justifyContent: 'center', padding: spacing.lg },
  card: { width: '100%', maxWidth: '100%', borderRadius: radius.lg, borderWidth: 3, borderColor: colors.primary, backgroundColor: colors.surface, padding: spacing.xl, ...shadow },
  title: { color: colors.text, fontSize: 32, lineHeight: 45, fontWeight: '900', textAlign: 'center' },
  description: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '700', textAlign: 'center', marginTop: spacing.sm },
  loading: { marginTop: spacing.md },
  button: { marginTop: spacing.lg },
  cancel: { marginTop: spacing.sm },
});
