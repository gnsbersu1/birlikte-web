import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/i18n';
import { useAccessibleLayout } from '@/utils/accessibility';

type GestureName = 'tap' | 'swipe' | 'hold';

const gestureOptions: { id: GestureName; labelKey: TranslationKey; symbol: string }[] = [
  { id: 'tap', labelKey: 'gesture.tab.tap', symbol: '☝' },
  { id: 'swipe', labelKey: 'gesture.tab.swipe', symbol: '↔' },
  { id: 'hold', labelKey: 'gesture.tab.hold', symbol: '●' },
];

function SuccessMessage({ children }: { children: string }) {
  return (
    <View style={styles.success} accessibilityRole="alert">
      <Text allowFontScaling={false} style={styles.successMark}>✓</Text>
      <Text style={styles.successText}>{children}</Text>
    </View>
  );
}

function TapPractice() {
  const [completed, setCompleted] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;
  const { t } = useLanguage();

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    if (!completed) animation.start();
    return () => animation.stop();
  }, [completed, pulse]);

  const complete = () => {
    setCompleted(true);
    pulse.stopAnimation();
    Animated.sequence([
      Animated.spring(pulse, { toValue: 0.9, useNativeDriver: true }),
      Animated.spring(pulse, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  return (
    <View>
      <Text style={styles.practiceTitle}>{t('gesture.tap.title')}</Text>
      <Text style={styles.practiceDescription}>{t('gesture.tap.description')}</Text>
      <View style={styles.practiceArea}>
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('gesture.tap.accessibilityLabel')}
            accessibilityHint={t('gesture.tap.accessibilityHint')}
            onPress={complete}
            style={({ pressed }) => [styles.tapTarget, completed && styles.targetCompleted, pressed && styles.targetPressed]}
          >
            <Text allowFontScaling={false} style={styles.tapSymbol}>{completed ? '✓' : '☝'}</Text>
            <Text style={styles.targetLabel}>{t(completed ? 'gesture.tap.successTarget' : 'gesture.tap.target')}</Text>
          </Pressable>
        </Animated.View>
      </View>
      {completed ? <SuccessMessage>{t('gesture.tap.success')}</SuccessMessage> : <Text style={styles.helpText}>{t('gesture.tap.help')}</Text>}
    </View>
  );
}

function SwipePractice() {
  const [completed, setCompleted] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const hintX = useRef(new Animated.Value(-18)).current;
  const { t } = useLanguage();

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(hintX, { toValue: 18, duration: 900, useNativeDriver: true }),
        Animated.timing(hintX, { toValue: -18, duration: 900, useNativeDriver: true }),
      ]),
    );
    if (!completed) animation.start();
    return () => animation.stop();
  }, [completed, hintX]);

  const panResponder = useMemo(
    () => PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderMove: (_, gesture) => translateX.setValue(Math.max(-105, Math.min(105, gesture.dx))),
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) >= 70) {
          setCompleted(true);
          Animated.sequence([
            Animated.timing(translateX, { toValue: gesture.dx > 0 ? 105 : -105, duration: 160, useNativeDriver: true }),
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
          ]).start();
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
      onPanResponderTerminate: () => Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start(),
    }),
    [translateX],
  );

  return (
    <View>
      <Text style={styles.practiceTitle}>{t('gesture.swipe.title')}</Text>
      <Text style={styles.practiceDescription}>{t('gesture.swipe.description')}</Text>
      <View style={styles.swipeArea}>
        <Text allowFontScaling={false} style={styles.edgeArrow}>‹</Text>
        <Animated.View
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={t('gesture.swipe.accessibilityLabel')}
          accessibilityHint={t('gesture.swipe.accessibilityHint')}
          style={[styles.swipeCard, completed && styles.targetCompleted, { transform: [{ translateX }] }]}
          {...panResponder.panHandlers}
        >
          <Text allowFontScaling={false} style={styles.swipeSymbol}>{completed ? '✓' : '☝'}</Text>
          <Text style={styles.swipeLabel}>{completed ? t('gesture.tap.successTarget') : t('gesture.swipe.target')}</Text>
        </Animated.View>
        <Text allowFontScaling={false} style={styles.edgeArrow}>›</Text>
        {!completed ? <Animated.Text allowFontScaling={false} style={[styles.movingArrow, { transform: [{ translateX: hintX }] }]}>↔</Animated.Text> : null}
      </View>
      {completed ? <SuccessMessage>{t('gesture.swipe.success')}</SuccessMessage> : <Text style={styles.helpText}>{t('gesture.swipe.help')}</Text>}
    </View>
  );
}

function HoldPractice() {
  const [completed, setCompleted] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const { t } = useLanguage();

  const startHold = () => {
    setCompleted(false);
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: 1000, useNativeDriver: false }).start();
  };

  const cancelHold = () => {
    if (!completed) {
      progress.stopAnimation();
      Animated.timing(progress, { toValue: 0, duration: 180, useNativeDriver: false }).start();
    }
  };

  const complete = () => {
    setCompleted(true);
    progress.setValue(1);
  };

  return (
    <View>
      <Text style={styles.practiceTitle}>{t('gesture.hold.title')}</Text>
      <Text style={styles.practiceDescription}>{t('gesture.hold.description')}</Text>
      <View style={styles.practiceArea}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('gesture.hold.accessibilityLabel')}
          accessibilityHint={t('gesture.hold.accessibilityHint')}
          delayLongPress={1000}
          onPressIn={startHold}
          onPressOut={cancelHold}
          onLongPress={complete}
          style={({ pressed }) => [styles.holdTarget, completed && styles.targetCompleted, pressed && styles.targetPressed]}
        >
          <Text allowFontScaling={false} style={styles.holdSymbol}>{completed ? '✓' : '●'}</Text>
          <Text style={styles.targetLabel}>{completed ? t('gesture.tap.successTarget') : t('gesture.hold.target')}</Text>
          <View style={styles.progressTrack}><Animated.View style={[styles.progressFill, { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} /></View>
        </Pressable>
      </View>
      {completed ? <SuccessMessage>{t('gesture.hold.success')}</SuccessMessage> : <Text style={styles.helpText}>{t('gesture.hold.help')}</Text>}
    </View>
  );
}

export function GesturePractice() {
  const [gesture, setGesture] = useState<GestureName>('tap');
  const { isLargeText } = useAccessibleLayout();
  const { t } = useLanguage();
  return (
    <View style={styles.container}>
      <Text style={styles.heading} accessibilityRole="header">{t('gesture.heading')}</Text>
      <Text style={styles.intro}>{t('gesture.intro')}</Text>
      <View style={[styles.tabs, isLargeText && styles.tabsLargeText]} accessibilityRole="tablist">
        {gestureOptions.map(option => {
          const active = gesture === option.id;
          return (
            <Pressable key={option.id} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => setGesture(option.id)} style={[styles.tab, isLargeText && styles.tabLargeText, active && styles.tabActive]}>
              <Text allowFontScaling={false} style={[styles.tabSymbol, active && styles.tabTextActive]}>{option.symbol}</Text>
              <Text style={[styles.tabLabel, active && styles.tabTextActive]}>{t(option.labelKey)}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={[styles.stage, isLargeText && styles.stageLargeText]}>
        {gesture === 'tap' ? <TapPractice /> : null}
        {gesture === 'swipe' ? <SwipePractice /> : null}
        {gesture === 'hold' ? <HoldPractice /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: radius.lg, borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primarySoft, padding: spacing.md, gap: spacing.sm },
  heading: { color: colors.text, fontSize: 30, lineHeight: 42, fontWeight: '900' },
  intro: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '700' },
  tabs: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
  tabsLargeText: { flexDirection: 'column' },
  tab: { flex: 1, minHeight: 72, padding: spacing.xs, borderRadius: radius.md, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  tabLargeText: { flex: 0, padding: spacing.md },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  tabSymbol: { color: colors.primary, fontSize: 23, lineHeight: 28, fontWeight: '900' },
  tabLabel: { color: colors.text, fontSize: 18, lineHeight: 25, fontWeight: '900', textAlign: 'center' },
  tabTextActive: { color: colors.surface },
  stage: { marginTop: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surface, padding: spacing.md },
  stageLargeText: { paddingHorizontal: spacing.sm },
  practiceTitle: { color: colors.text, fontSize: 24, lineHeight: 34, fontWeight: '900', textAlign: 'center' },
  practiceDescription: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '700', textAlign: 'center', marginTop: spacing.sm },
  practiceArea: { minHeight: 205, alignItems: 'center', justifyContent: 'center' },
  tapTarget: { width: 168, minHeight: 142, borderRadius: radius.lg, backgroundColor: colors.coral, borderWidth: 4, borderColor: colors.coralSoft, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  holdTarget: { width: 190, minHeight: 156, borderRadius: 95, backgroundColor: colors.blue, borderWidth: 4, borderColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  targetPressed: { opacity: 0.72, transform: [{ scale: 0.96 }] },
  targetCompleted: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  tapSymbol: { color: colors.surface, fontSize: 40, lineHeight: 48 },
  holdSymbol: { color: colors.surface, fontSize: 35, lineHeight: 42 },
  targetLabel: { color: colors.surface, fontSize: 20, lineHeight: 28, fontWeight: '900', textAlign: 'center' },
  helpText: { color: colors.text, fontSize: 18, lineHeight: 25, fontWeight: '700', textAlign: 'center' },
  success: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.goldSoft },
  successMark: { width: 34, height: 34, borderRadius: 17, color: colors.surface, backgroundColor: colors.primary, fontSize: 20, lineHeight: 34, fontWeight: '900', textAlign: 'center' },
  successText: { flex: 1, color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '800' },
  swipeArea: { minHeight: 210, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  swipeCard: { width: 155, minHeight: 120, borderRadius: radius.lg, backgroundColor: colors.blue, borderWidth: 4, borderColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center', padding: spacing.md, zIndex: 2 },
  swipeSymbol: { color: colors.surface, fontSize: 35, lineHeight: 42 },
  swipeLabel: { color: colors.surface, fontSize: 20, lineHeight: 28, fontWeight: '900', textAlign: 'center' },
  edgeArrow: { color: colors.primary, fontSize: 50, fontWeight: '600' },
  movingArrow: { position: 'absolute', bottom: 7, alignSelf: 'center', left: '44%', color: colors.coral, fontSize: 31, fontWeight: '900' },
  progressTrack: { width: '82%', height: 10, overflow: 'hidden', borderRadius: radius.round, backgroundColor: 'rgba(255,255,255,0.42)', marginTop: spacing.sm },
  progressFill: { height: '100%', borderRadius: radius.round, backgroundColor: colors.goldSoft },
});
