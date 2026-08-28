import { StyleSheet, Text, View } from 'react-native';
import { LargeButton } from '@/components/Buttons';
import { Screen } from '@/components/Screen';
import { colors, radius, shadow, spacing } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { confirmPhoneCall } from '@/utils/phone';
import { useAccessibleLayout } from '@/utils/accessibility';

export default function EmergencyScreen() {
  const { isLargeText } = useAccessibleLayout();
  const { t } = useLanguage();

  return (
    <Screen title={t('emergency.title')} eyebrow={t('emergency.eyebrow')} description={t('emergency.description')}>
      <View style={styles.emergencyCard}>
        <View style={styles.cross}><Text allowFontScaling={false} style={styles.crossText}>+</Text></View>
        <Text style={styles.emergencyTitle}>{t('emergency.help')}</Text>
        <Text style={styles.number}>112</Text>
        <Text style={styles.emergencyText}>{t('emergency.lifeThreat')}</Text>
        <LargeButton label={t('emergency.call112')} danger onPress={() => confirmPhoneCall(`${t('emergency.help')} 112`, '112', t('emergency.call112Message'))} accessibilityHint={t('emergency.call112Hint')} style={styles.fullButton} />
      </View>

      <Text style={styles.sectionTitle} accessibilityRole="header">{t('emergency.otherNumbers')}</Text>
      <View style={styles.list}>
        <View style={[styles.contactCard, isLargeText && styles.contactCardLargeText]}><View style={[styles.badge, styles.policeBadge]}><Text style={styles.badgeText}>110</Text></View><View style={styles.copy}><Text style={styles.title}>{t('emergency.police')}</Text><Text style={styles.description}>{t('emergency.policeDescription')}</Text></View><LargeButton label={t('common.call')} secondary onPress={() => confirmPhoneCall(`${t('emergency.police')} 110`, '110')} style={[styles.callButton, isLargeText && styles.callButtonLargeText]} /></View>
        <View style={[styles.contactCard, isLargeText && styles.contactCardLargeText]}><View style={[styles.badge, styles.doctorBadge]}><Text style={styles.badgeText}>116{`\n`}117</Text></View><View style={styles.copy}><Text style={styles.title}>{t('emergency.doctor')}</Text><Text style={styles.description}>{t('emergency.doctorDescription')}</Text></View><LargeButton label={t('common.call')} secondary onPress={() => confirmPhoneCall(t('emergency.doctor'), '116117')} style={[styles.callButton, isLargeText && styles.callButtonLargeText]} /></View>
      </View>

      <View style={styles.guide}>
        <Text style={styles.guideTitle}>{t('emergency.which')}</Text>
        <View style={[styles.guideRow, isLargeText && styles.guideRowLargeText]}><Text style={[styles.guideNumber, isLargeText && styles.guideNumberLargeText]}>112</Text><Text style={styles.guideText}>{t('emergency.112Guide')}</Text></View>
        <View style={styles.divider} />
        <View style={[styles.guideRow, isLargeText && styles.guideRowLargeText]}><Text style={[styles.guideNumber, isLargeText && styles.guideNumberLargeText]}>116117</Text><Text style={styles.guideText}>{t('emergency.116117Guide')}</Text></View>
      </View>
      <Text style={styles.disclaimer}>{t('emergency.disclaimer')}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emergencyCard: { marginTop: spacing.xl, alignItems: 'center', padding: spacing.xl, borderRadius: radius.lg, borderWidth: 3, borderColor: colors.danger, backgroundColor: colors.dangerSoft, ...shadow },
  cross: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.danger },
  crossText: { color: colors.surface, fontSize: 48, lineHeight: 55, fontWeight: '700' },
  emergencyTitle: { color: colors.dangerDark, fontSize: 30, lineHeight: 42, fontWeight: '900', marginTop: spacing.md },
  number: { color: colors.dangerDark, fontSize: 55, lineHeight: 77, fontWeight: '900', letterSpacing: 3 },
  emergencyText: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '700', textAlign: 'center' },
  fullButton: { alignSelf: 'stretch', minHeight: 66, marginTop: spacing.lg },
  sectionTitle: { color: colors.text, fontSize: 30, lineHeight: 42, fontWeight: '900', marginTop: spacing.xxl, marginBottom: spacing.md },
  list: { gap: spacing.md },
  contactCard: { minHeight: 124, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radius.lg, padding: spacing.md, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border },
  contactCardLargeText: { alignItems: 'stretch', flexDirection: 'column' },
  badge: { minWidth: 68, minHeight: 68, alignSelf: 'flex-start', padding: spacing.sm, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  policeBadge: { backgroundColor: colors.blue },
  doctorBadge: { backgroundColor: colors.primary },
  badgeText: { color: colors.surface, fontSize: 19, lineHeight: 21, textAlign: 'center', fontWeight: '900' },
  copy: { flex: 1 },
  title: { color: colors.text, fontSize: 24, lineHeight: 34, fontWeight: '900' },
  description: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '700', marginTop: spacing.xs },
  callButton: { minWidth: 76, paddingHorizontal: spacing.sm },
  callButtonLargeText: { alignSelf: 'stretch' },
  guide: { marginTop: spacing.xl, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.goldSoft, borderWidth: 2, borderColor: colors.gold },
  guideTitle: { color: colors.text, fontSize: 30, lineHeight: 42, fontWeight: '900', marginBottom: spacing.md },
  guideRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  guideRowLargeText: { flexDirection: 'column' },
  guideNumber: { width: 76, color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '900' },
  guideNumberLargeText: { width: 'auto' },
  guideText: { flex: 1, color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '700' },
  divider: { height: 2, backgroundColor: colors.gold, opacity: 0.45, marginVertical: spacing.md },
  disclaimer: { color: colors.text, fontSize: 18, lineHeight: 25, fontWeight: '700', textAlign: 'center', marginTop: spacing.lg },
});
