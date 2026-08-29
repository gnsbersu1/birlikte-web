import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { LargeButton } from '@/components/Buttons';
import { GesturePractice } from '@/components/GesturePractice';
import { MessagePractice } from '@/components/MessagePractice';
import { Screen } from '@/components/Screen';
import { colors, radius, shadow, spacing } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAccessibleLayout } from '@/utils/accessibility';

type LessonId = 'gestures' | 'message' | 'scam';

type Lesson = {
  id: LessonId;
  number: string;
  title: string;
  duration: string;
  steps: string[];
};

export default function TechnologyScreen() {
  const [activeLessonId, setActiveLessonId] = useState<LessonId | null>(null);
  const [visitedLessons, setVisitedLessons] = useState<LessonId[]>([]);
  const { isLargeText } = useAccessibleLayout();
  const { t } = useLanguage();
  const lessons: Lesson[] = [
    { id: 'gestures', number: '1', title: t('lesson.gestures.title'), duration: t('lesson.gestures.duration'), steps: [t('lesson.gestures.step1'), t('lesson.gestures.step2'), t('lesson.gestures.step3')] },
    { id: 'message', number: '2', title: t('lesson.message.title'), duration: t('lesson.message.duration'), steps: [t('lesson.message.step1'), t('lesson.message.step2'), t('lesson.message.step3')] },
    { id: 'scam', number: '3', title: t('lesson.scam.title'), duration: t('lesson.scam.duration'), steps: [t('lesson.scam.step1'), t('lesson.scam.step2'), t('lesson.scam.step3')] },
  ];
  const activeLesson = lessons.find(lesson => lesson.id === activeLessonId) ?? null;

  const startLesson = (lessonId: LessonId) => {
    setVisitedLessons(current => current.includes(lessonId) ? current : [...current, lessonId]);
    setActiveLessonId(lessonId);
  };

  const returnToLessons = () => setActiveLessonId(null);

  return (
    <Screen
      title={activeLesson?.title ?? t('technology.title')}
      eyebrow={activeLesson ? t('technology.lesson', { number: activeLesson.number }) : t('technology.eyebrow')}
      description={activeLesson?.duration ?? t('technology.description')}
      right={activeLesson ? (
        <LargeButton
          label={t('common.back')}
          secondary
          onPress={returnToLessons}
          accessibilityHint={t('technology.backHint')}
          style={styles.backButton}
        />
      ) : undefined}
    >
      {!activeLesson ? (
        <>
          <View style={styles.list}>
            {lessons.map(lesson => {
              const visited = visitedLessons.includes(lesson.id);
              return (
                <View key={lesson.id} style={styles.card}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${lesson.title}, ${lesson.duration}`}
                    accessibilityHint={t(visited ? 'technology.continueHint' : 'technology.startHint')}
                    onPress={() => startLesson(lesson.id)}
                    style={({ pressed }) => [styles.lessonHeader, isLargeText && styles.lessonHeaderLargeText, pressed && styles.pressed]}
                  >
                    <Text allowFontScaling={false} style={styles.number}>{lesson.number}</Text>
                    <View style={styles.lessonCopy}>
                      <Text style={styles.title}>{lesson.title}</Text>
                      <Text style={styles.duration}>{lesson.duration}</Text>
                    </View>
                  </Pressable>
                  <LargeButton
                    label={t(visited ? 'common.continue' : 'common.start')}
                    onPress={() => startLesson(lesson.id)}
                    accessibilityHint={t(visited ? 'technology.resumesHint' : 'technology.opensHint', { title: lesson.title })}
                    style={styles.startButton}
                  />
                </View>
              );
            })}
          </View>

          <View style={styles.support}>
            <Text style={styles.supportTitle}>{t('technology.supportTitle')}</Text>
            <Text style={styles.supportText}>{t('technology.supportText')}</Text>
            <LargeButton
              label={t('technology.supportButton')}
              secondary
              onPress={() => Alert.alert(t('technology.supportAlertTitle'), t('technology.supportAlertMessage'), [{ text: t('common.ok') }])}
            />
          </View>
        </>
      ) : null}

      {visitedLessons.map(lessonId => {
        const lesson = lessons.find(item => item.id === lessonId);
        if (!lesson) return null;
        const isActive = activeLessonId === lessonId;

        if (lesson.id === 'gestures') {
          return (
            <View key={lessonId} style={[styles.directLessonContainer, !isActive && styles.hiddenLesson]}>
              <GesturePractice />
              <View style={[styles.reassurance, styles.reassuranceBottom, isLargeText && styles.reassuranceLargeText]}>
                <Text allowFontScaling={false} style={styles.reassuranceMark}>i</Text>
                <Text style={styles.reassuranceText}>{t('technology.safeNotice')}</Text>
              </View>
            </View>
          );
        }

        if (lesson.id === 'message') {
          return (
            <View key={lessonId} style={[styles.directLessonContainer, !isActive && styles.hiddenLesson]}>
              <MessagePractice />
              <View style={[styles.reassurance, styles.reassuranceBottom, isLargeText && styles.reassuranceLargeText]}>
                <Text allowFontScaling={false} style={styles.reassuranceMark}>i</Text>
                <Text style={styles.reassuranceText}>{t('technology.safeNotice')}</Text>
              </View>
            </View>
          );
        }

        return (
          <View key={lessonId} style={!isActive ? styles.hiddenLesson : undefined}>
            <View style={[styles.reassurance, isLargeText && styles.reassuranceLargeText]}>
              <Text allowFontScaling={false} style={styles.reassuranceMark}>i</Text>
              <Text style={styles.reassuranceText}>{t('technology.safeNotice')}</Text>
            </View>

            <View style={styles.detailCard}>
              <View style={styles.steps}>
                {lesson.steps.map((step, index) => (
                  <View key={`${lesson.id}-step-${index}`} style={[styles.step, isLargeText && styles.stepLargeText]}>
                    <Text allowFontScaling={false} style={styles.stepNumber}>{index + 1}</Text>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}

                {lesson.id === 'scam' ? (
                  <LargeButton
                    label={t('technology.preparingButton')}
                    onPress={() => Alert.alert(t('technology.preparingTitle'), t('technology.preparingMessage'), [{ text: t('common.ok') }])}
                  />
                ) : null}
              </View>
            </View>
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: { minWidth: 112 },
  list: { marginTop: spacing.xl, gap: spacing.md },
  card: { overflow: 'hidden', borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, ...shadow },
  lessonHeader: { minHeight: 100, flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  lessonHeaderLargeText: { alignItems: 'flex-start' },
  pressed: { backgroundColor: colors.primarySoft },
  number: { width: 54, height: 54, borderRadius: 27, color: colors.surface, backgroundColor: colors.primary, fontSize: 24, lineHeight: 54, fontWeight: '900', textAlign: 'center' },
  lessonCopy: { flex: 1 },
  title: { color: colors.text, fontSize: 24, lineHeight: 34, fontWeight: '900' },
  duration: { color: colors.text, fontSize: 18, lineHeight: 25, fontWeight: '700', marginTop: spacing.xs },
  startButton: { marginHorizontal: spacing.md, marginBottom: spacing.md },
  directLessonContainer: { marginTop: spacing.md, gap: spacing.md },
  hiddenLesson: { display: 'none' },
  reassurance: { marginTop: spacing.xl, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radius.md, padding: spacing.md, backgroundColor: colors.blueSoft, borderWidth: 2, borderColor: colors.blue },
  reassuranceBottom: { marginTop: spacing.md },
  reassuranceLargeText: { alignItems: 'flex-start', flexDirection: 'column' },
  reassuranceMark: { width: 40, height: 40, borderRadius: 20, color: colors.surface, backgroundColor: colors.blue, fontSize: 25, lineHeight: 40, fontWeight: '900', textAlign: 'center' },
  reassuranceText: { flex: 1, color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '700' },
  detailCard: { marginTop: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, ...shadow },
  steps: { padding: spacing.lg, gap: spacing.md },
  step: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  stepLargeText: { flexDirection: 'column' },
  stepNumber: { width: 34, height: 34, borderRadius: 17, color: colors.text, backgroundColor: colors.goldSoft, fontSize: 17, lineHeight: 34, fontWeight: '900', textAlign: 'center' },
  stepText: { flex: 1, color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '700' },
  support: { marginTop: spacing.xl, borderRadius: radius.lg, padding: spacing.lg, backgroundColor: colors.primarySoft, borderWidth: 2, borderColor: colors.primary, gap: spacing.sm },
  supportTitle: { color: colors.text, fontSize: 24, lineHeight: 34, fontWeight: '900' },
  supportText: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '700', marginBottom: spacing.md },
});
