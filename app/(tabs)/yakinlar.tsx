import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, StyleSheet, Text, TextInput, View } from 'react-native';
import { LargeButton } from '@/components/Buttons';
import { Screen } from '@/components/Screen';
import { colors, radius, shadow, spacing } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { confirmMessage, confirmPhoneCall } from '@/utils/phone';
import { useAccessibleLayout } from '@/utils/accessibility';

type Person = { id: string; initials: string; name: string; relation: string; phone: string; color: string };

const RELATIVES_STORAGE_KEY = '@birlikte/relatives';
const DEMO_PERSON_IDS = new Set(['ayse', 'mehmet', 'sevim']);

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0).toLocaleUpperCase('tr-TR')).join('');
}

function isPerson(value: unknown): value is Person {
  if (!value || typeof value !== 'object') return false;
  const person = value as Record<string, unknown>;
  return typeof person.id === 'string'
    && typeof person.initials === 'string'
    && typeof person.name === 'string'
    && typeof person.relation === 'string'
    && typeof person.phone === 'string'
    && typeof person.color === 'string';
}

export default function RelativesScreen() {
  const { isLargeText } = useAccessibleLayout();
  const { t } = useLanguage();
  const [people, setPeople] = useState<Person[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [phone, setPhone] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [canPersist, setCanPersist] = useState(false);
  const persistenceQueue = useRef(Promise.resolve());

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(RELATIVES_STORAGE_KEY)
      .then(storedPeople => {
        if (!isMounted) return;
        if (storedPeople === null) {
          setCanPersist(true);
          return;
        }

        try {
          const parsedPeople: unknown = JSON.parse(storedPeople);
          if (Array.isArray(parsedPeople) && parsedPeople.every(isPerson)) {
            setPeople(parsedPeople.filter(person => !DEMO_PERSON_IDS.has(person.id)));
            setCanPersist(true);
          }
        } catch {
          setCanPersist(false);
        }
      })
      .catch(() => {
        if (isMounted) setCanPersist(false);
      })
      .finally(() => {
        if (isMounted) setIsHydrated(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated || !canPersist) return;
    const serializedPeople = JSON.stringify(people);
    persistenceQueue.current = persistenceQueue.current
      .catch(() => undefined)
      .then(() => AsyncStorage.setItem(RELATIVES_STORAGE_KEY, serializedPeople))
      .catch(() => undefined);
  }, [canPersist, isHydrated, people]);

  const closeForm = () => {
    setIsFormOpen(false);
    setName('');
    setRelation('');
    setPhone('');
    Keyboard.dismiss();
  };

  const addPerson = () => {
    const cleanName = name.trim();
    const cleanRelation = relation.trim();
    const cleanPhone = phone.replace(/[^\d+]/g, '');

    if (!cleanName || !cleanRelation || !cleanPhone) {
      Alert.alert(t('relatives.missingTitle'), t('relatives.missingText'));
      return;
    }
    if (cleanPhone.replace(/\D/g, '').length < 7) {
      Alert.alert(t('relatives.invalidPhoneTitle'), t('relatives.invalidPhoneText'));
      return;
    }

    setCanPersist(true);
    setPeople(current => [...current, {
      id: `${Date.now()}`,
      initials: getInitials(cleanName),
      name: cleanName,
      relation: cleanRelation,
      phone: cleanPhone,
      color: colors.gold,
    }]);
    closeForm();
    Alert.alert(t('relatives.addedTitle'), t('relatives.addedText', { name: cleanName }));
  };

  const clearAllPeople = () => {
    Alert.alert(t('relatives.deleteAllTitle'), t('relatives.deleteAllText'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('relatives.deleteAllConfirm'),
        style: 'destructive',
        onPress: () => {
          persistenceQueue.current = persistenceQueue.current
            .catch(() => undefined)
            .then(() => AsyncStorage.setItem(RELATIVES_STORAGE_KEY, '[]'))
            .then(() => {
              setPeople([]);
              Alert.alert(t('relatives.deletedAllTitle'), t('relatives.deletedAllText'));
            })
            .catch(() => {
              Alert.alert(t('relatives.deleteErrorTitle'), t('relatives.deleteErrorText'));
            });
        },
      },
    ]);
  };

  return (
    <Screen title={t('relatives.title')} eyebrow={t('relatives.eyebrow')} description={t('relatives.description')}>
      <View style={[styles.privacy, isLargeText && styles.verticalRow]}>
        <Text allowFontScaling={false} style={styles.lock}>✓</Text>
        <Text style={styles.privacyText}>{t('relatives.privacy')}</Text>
      </View>

      {isHydrated && people.length === 0 && !isFormOpen ? <Text style={styles.emptyText}>{t('relatives.empty')}</Text> : null}

      {isFormOpen ? (
        <View style={styles.form} accessibilityLabel={t('relatives.formLabel')}>
          <Text style={styles.formTitle} accessibilityRole="header">{t('relatives.formTitle')}</Text>
          <Text style={styles.formDescription}>{t('relatives.formDescription')}</Text>

          <Text style={styles.label}>{t('relatives.nameLabel')}</Text>
          <TextInput value={name} onChangeText={setName} placeholder={t('relatives.namePlaceholder')} placeholderTextColor={colors.textMuted} style={styles.input} autoFocus autoCapitalize="words" returnKeyType="next" accessibilityLabel={t('relatives.nameAccessibility')} />

          <Text style={styles.label}>{t('relatives.relationLabel')}</Text>
          <TextInput value={relation} onChangeText={setRelation} placeholder={t('relatives.relationPlaceholder')} placeholderTextColor={colors.textMuted} style={styles.input} autoCapitalize="sentences" returnKeyType="next" accessibilityLabel={t('relatives.relationAccessibility')} />

          <Text style={styles.label}>{t('relatives.phoneLabel')}</Text>
          <TextInput value={phone} onChangeText={setPhone} placeholder={t('relatives.phonePlaceholder')} placeholderTextColor={colors.textMuted} style={styles.input} keyboardType="phone-pad" returnKeyType="done" onSubmitEditing={addPerson} accessibilityLabel={t('relatives.phoneAccessibility')} />

          <LargeButton label={t('relatives.save')} onPress={addPerson} accessibilityHint={t('relatives.saveHint')} style={styles.saveButton} />
          <LargeButton label={t('common.cancel')} secondary onPress={closeForm} accessibilityHint={t('relatives.cancelHint')} style={styles.cancelButton} />
        </View>
      ) : (
        <LargeButton label={t('relatives.add')} secondary onPress={() => setIsFormOpen(true)} accessibilityHint={t('relatives.addHint')} style={styles.addButton} />
      )}

      <View style={styles.list}>
        {people.map(person => {
          const translatedRelation = person.id === 'ayse' ? t('relatives.daughter') : person.id === 'mehmet' ? t('relatives.son') : person.id === 'sevim' ? t('relatives.friend') : person.relation;
          return (
          <View key={person.id} style={styles.card} accessibilityLabel={`${person.name}, ${translatedRelation}`}>
            <View style={[styles.profile, isLargeText && styles.verticalRow]}>
              <View style={[styles.avatar, { backgroundColor: person.color }]}><Text allowFontScaling={false} style={styles.initials}>{person.initials}</Text></View>
              <View style={styles.copy}><Text style={styles.name}>{person.name}</Text><Text style={styles.relation}>{translatedRelation}</Text></View>
            </View>
            <View style={[styles.actions, isLargeText && styles.actionsLargeText]}>
              <LargeButton label={t('common.call')} onPress={() => confirmPhoneCall(person.name, person.phone)} accessibilityHint={t('relatives.callHint')} style={styles.action} />
              <LargeButton label={t('common.message')} secondary onPress={() => confirmMessage(person.name, person.phone)} accessibilityHint={t('relatives.messageHint')} style={styles.action} />
            </View>
          </View>
        );})}
      </View>
      {isHydrated && people.length > 0 ? (
        <LargeButton
          label={t('relatives.deleteAll')}
          danger
          onPress={clearAllPeople}
          accessibilityHint={t('relatives.deleteAllHint')}
          style={styles.deleteAllButton}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  privacy: { marginTop: spacing.xl, flexDirection: 'row', gap: spacing.sm, alignItems: 'center', padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.primarySoft },
  verticalRow: { alignItems: 'flex-start', flexDirection: 'column' },
  lock: { width: 38, height: 38, borderRadius: 19, color: colors.surface, backgroundColor: colors.primary, fontSize: 21, lineHeight: 38, fontWeight: '900', textAlign: 'center' },
  privacyText: { flex: 1, color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '700' },
  emptyText: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '700', textAlign: 'center', marginTop: spacing.xl, marginBottom: spacing.sm },
  form: { marginTop: spacing.xl, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 3, borderColor: colors.primary, backgroundColor: colors.surface, ...shadow },
  formTitle: { color: colors.text, fontSize: 30, lineHeight: 42, fontWeight: '900' },
  formDescription: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '700', marginTop: spacing.sm, marginBottom: spacing.md },
  label: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '900', marginTop: spacing.md, marginBottom: spacing.sm },
  input: { minHeight: 62, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.background, color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '700' },
  saveButton: { marginTop: spacing.lg },
  cancelButton: { marginTop: spacing.sm },
  list: { marginTop: spacing.lg, gap: spacing.lg },
  card: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface, ...shadow },
  profile: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  avatar: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.surface, fontSize: 23, fontWeight: '900' },
  copy: { flex: 1 },
  name: { color: colors.text, fontSize: 24, lineHeight: 34, fontWeight: '900' },
  relation: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  actionsLargeText: { flexDirection: 'column' },
  action: { flex: 1 },
  addButton: { marginTop: spacing.xl },
  deleteAllButton: { marginTop: spacing.xl },
});
