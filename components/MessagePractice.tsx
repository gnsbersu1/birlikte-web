import { useEffect, useState } from 'react';
import { Alert, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LargeButton } from '@/components/Buttons';
import { colors, radius, spacing } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/i18n';
import { useAccessibleLayout } from '@/utils/accessibility';

const recipients = ['Ayşe', 'Mehmet'];
const readyMessageKeys: TranslationKey[] = ['message.ready1', 'message.ready2', 'message.ready3'];

export function MessagePractice() {
  const { isLargeText } = useAccessibleLayout();
  const [recipient, setRecipient] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [selectedReadyMessage, setSelectedReadyMessage] = useState<TranslationKey | null>(null);
  const { t } = useLanguage();
  const readyMessages = readyMessageKeys.map(key => ({ key, text: t(key) }));

  useEffect(() => {
    if (selectedReadyMessage) setMessage(t(selectedReadyMessage));
  }, [selectedReadyMessage, t]);

  const chooseRecipient = (name: string) => {
    setRecipient(name);
    setSent(false);
  };

  const chooseReadyMessage = (key: TranslationKey, text: string) => {
    setSelectedReadyMessage(key);
    setMessage(text);
    setSent(false);
    Keyboard.dismiss();
  };

  const sendPracticeMessage = () => {
    if (!recipient) {
      Alert.alert(t('message.choosePersonTitle'), t('message.choosePersonText'));
      return;
    }
    if (!message.trim()) {
      Alert.alert(t('message.emptyTitle'), t('message.emptyText'));
      return;
    }
    Keyboard.dismiss();
    setSent(true);
  };

  const restart = () => {
    setRecipient(null);
    setMessage('');
    setSent(false);
    setSelectedReadyMessage(null);
  };

  if (sent) {
    return (
      <View style={styles.container} accessibilityRole="alert">
        <View style={styles.successMark}><Text allowFontScaling={false} style={styles.successSymbol}>✓</Text></View>
        <Text style={styles.successTitle}>{t('message.successTitle')}</Text>
        <Text style={styles.successText}>{t('message.successText', { message: message.trim(), name: recipient ?? '' })}</Text>
        <View style={styles.safetyBox}>
          <Text style={styles.safetyText}>{t('message.safety')}</Text>
        </View>
        <LargeButton label={t('message.retry')} secondary onPress={restart} accessibilityHint={t('message.retryHint')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading} accessibilityRole="header">{t('message.practiceTitle')}</Text>
      <Text style={styles.intro}>{t('message.practiceIntro')}</Text>

      <View style={styles.section}>
        <View style={[styles.stepHeading, isLargeText && styles.stepHeadingLargeText]}>
          <Text allowFontScaling={false} style={styles.stepNumber}>1</Text>
          <Text style={styles.stepTitle}>{t('message.step1')}</Text>
        </View>
        <View style={[styles.recipientRow, isLargeText && styles.recipientRowLargeText]}>
          {recipients.map(name => {
            const selected = recipient === name;
            return (
              <Pressable
                key={name}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={t('message.selectPerson', { name })}
                onPress={() => chooseRecipient(name)}
                style={({ pressed }) => [styles.recipient, selected && styles.recipientSelected, pressed && styles.pressed]}
              >
                <Text allowFontScaling={false} style={[styles.avatar, selected && styles.avatarSelected]}>{name.charAt(0)}</Text>
                <Text style={[styles.recipientName, selected && styles.selectedText]}>{selected ? `✓ ${name}` : name}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <View style={[styles.stepHeading, isLargeText && styles.stepHeadingLargeText]}>
          <Text allowFontScaling={false} style={styles.stepNumber}>2</Text>
          <Text style={styles.stepTitle}>{t('message.step2')}</Text>
        </View>
        <Text style={styles.help}>{t('message.readyHelp')}</Text>
        <View style={styles.readyList}>
          {readyMessages.map(item => (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel={t('message.readyLabel', { message: item.text })}
              onPress={() => chooseReadyMessage(item.key, item.text)}
              style={({ pressed }) => [styles.readyMessage, selectedReadyMessage === item.key && styles.readyMessageSelected, pressed && styles.pressed]}
            >
              <Text style={styles.readyMessageText}>{selectedReadyMessage === item.key ? '✓ ' : ''}{item.text}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.orText}>{t('message.orWrite')}</Text>
        <TextInput
          value={message}
          onChangeText={text => { setMessage(text); setSelectedReadyMessage(null); setSent(false); }}
          placeholder={t('message.placeholder')}
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={180}
          textAlignVertical="top"
          style={styles.input}
          accessibilityLabel={t('message.inputLabel')}
          accessibilityHint={t('message.inputHint')}
        />
        <Text style={styles.characterCount}>{t('message.characterCount', { count: message.length })}</Text>
      </View>

      <View style={styles.section}>
        <View style={[styles.stepHeading, isLargeText && styles.stepHeadingLargeText]}>
          <Text allowFontScaling={false} style={styles.stepNumber}>3</Text>
          <Text style={styles.stepTitle}>{t('message.step3')}</Text>
        </View>
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>{t('message.to')}</Text>
          <Text style={styles.previewValue}>{recipient ?? t('message.noPerson')}</Text>
          <Text style={styles.previewLabel}>{t('message.message')}</Text>
          <Text style={styles.previewValue}>{message.trim() || t('message.noMessage')}</Text>
        </View>
        <LargeButton label={t('message.finishButton')} onPress={sendPracticeMessage} accessibilityHint={t('message.finishHint')} />
        <Text style={styles.notReal}>{t('message.notReal')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: radius.lg, borderWidth: 2, borderColor: colors.blue, backgroundColor: colors.blueSoft, padding: spacing.md, gap: spacing.md },
  heading: { color: colors.text, fontSize: 30, lineHeight: 42, fontWeight: '900' },
  intro: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '700' },
  section: { borderRadius: radius.md, backgroundColor: colors.surface, padding: spacing.md, gap: spacing.sm },
  stepHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepHeadingLargeText: { alignItems: 'flex-start', flexDirection: 'column' },
  stepNumber: { width: 40, height: 40, borderRadius: 20, color: colors.surface, backgroundColor: colors.primary, fontSize: 20, lineHeight: 40, fontWeight: '900', textAlign: 'center' },
  stepTitle: { flex: 1, color: colors.text, fontSize: 24, lineHeight: 34, fontWeight: '900' },
  recipientRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  recipientRowLargeText: { flexDirection: 'column' },
  recipient: { flex: 1, minHeight: 92, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.background, padding: spacing.sm },
  recipientSelected: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  avatar: { width: 40, height: 40, borderRadius: 20, color: colors.surface, backgroundColor: colors.blue, fontSize: 21, lineHeight: 40, fontWeight: '900', textAlign: 'center' },
  avatarSelected: { color: colors.primary, backgroundColor: colors.surface },
  recipientName: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '900', marginTop: spacing.sm },
  selectedText: { color: colors.surface },
  help: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '700' },
  readyList: { gap: spacing.xs },
  readyMessage: { minHeight: 56, justifyContent: 'center', borderRadius: radius.md, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.background, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  readyMessageSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  readyMessageText: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '800' },
  pressed: { opacity: 0.72 },
  orText: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '800', marginTop: spacing.sm },
  input: { minHeight: 118, borderRadius: radius.md, borderWidth: 3, borderColor: colors.primary, backgroundColor: colors.background, color: colors.text, padding: spacing.md, fontSize: 20, lineHeight: 28, fontWeight: '700' },
  characterCount: { color: colors.text, fontSize: 18, lineHeight: 25, fontWeight: '700', textAlign: 'right' },
  preview: { borderRadius: radius.md, backgroundColor: colors.goldSoft, padding: spacing.md, gap: spacing.xs },
  previewLabel: { color: colors.text, fontSize: 18, lineHeight: 25, fontWeight: '900' },
  previewValue: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '800', marginBottom: spacing.sm },
  notReal: { color: colors.text, fontSize: 18, lineHeight: 25, fontWeight: '700', textAlign: 'center' },
  successMark: { alignSelf: 'center', width: 82, height: 82, borderRadius: 41, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  successSymbol: { color: colors.surface, fontSize: 46, lineHeight: 54, fontWeight: '900' },
  successTitle: { color: colors.text, fontSize: 30, lineHeight: 42, fontWeight: '900', textAlign: 'center' },
  successText: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '700', textAlign: 'center' },
  safetyBox: { borderRadius: radius.md, backgroundColor: colors.surface, padding: spacing.md },
  safetyText: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '800', textAlign: 'center' },
});
