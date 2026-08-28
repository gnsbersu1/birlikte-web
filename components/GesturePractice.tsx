import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { LargeButton } from '@/components/Buttons';
import { colors, radius, spacing } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/i18n';
import { useAccessibleLayout } from '@/utils/accessibility';

type GestureName = 'tap' | 'doubleTap' | 'swipe' | 'verticalSwipe' | 'hold' | 'pinchZoomIn' | 'pinchZoomOut';

const gestureOptions: { id: GestureName; labelKey: TranslationKey; symbol: string }[] = [
  { id: 'tap', labelKey: 'gesture.tab.tap', symbol: '☝' },
  { id: 'doubleTap', labelKey: 'gesture.tab.doubleTap', symbol: '☝☝' },
  { id: 'swipe', labelKey: 'gesture.tab.swipe', symbol: '↔' },
  { id: 'verticalSwipe', labelKey: 'gesture.tab.verticalSwipe', symbol: '↕' },
  { id: 'hold', labelKey: 'gesture.tab.hold', symbol: '●' },
  { id: 'pinchZoomIn', labelKey: 'gesture.tab.pinchZoomIn', symbol: '⤢' },
  { id: 'pinchZoomOut', labelKey: 'gesture.tab.pinchZoomOut', symbol: '⤡' },
];

function SuccessMessage({ children, onRetry }: { children: string; onRetry: () => void }) {
  const { t } = useLanguage();
  return (
    <View style={styles.successWrapper}>
      <View style={styles.success} accessibilityRole="alert">
        <Text allowFontScaling={false} style={styles.successMark}>✓</Text>
        <Text style={styles.successText}>{children}</Text>
      </View>
      <LargeButton
        label={t('gesture.retry')}
        secondary
        onPress={onRetry}
        accessibilityHint={t('gesture.retryHint')}
        style={styles.retryButton}
      />
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

  const handleRetry = () => {
    setCompleted(false);
    pulse.setValue(1);
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
      {completed ? (
        <SuccessMessage onRetry={handleRetry}>{t('gesture.tap.success')}</SuccessMessage>
      ) : (
        <Text style={styles.helpText}>{t('gesture.tap.help')}</Text>
      )}
    </View>
  );
}

function DoubleTapPractice() {
  const [completed, setCompleted] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const scale = useRef(new Animated.Value(1)).current;
  const lastTapRef = useRef(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useLanguage();

  const handlePress = () => {
    if (completed) return;
    const now = Date.now();
    const timeSinceLast = now - lastTapRef.current;

    if (timeSinceLast > 50 && timeSinceLast < 550) {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      setTapCount(2);
      setCompleted(true);
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.15, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      ]).start();
    } else {
      lastTapRef.current = now;
      setTapCount(1);
      Animated.sequence([
        Animated.timing(scale, { toValue: 0.94, duration: 100, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        setTapCount(0);
      }, 650);
    }
  };

  const handleRetry = () => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    setCompleted(false);
    setTapCount(0);
    lastTapRef.current = 0;
    scale.setValue(1);
  };

  return (
    <View>
      <Text style={styles.practiceTitle}>{t('gesture.doubleTap.title')}</Text>
      <Text style={styles.practiceDescription}>{t('gesture.doubleTap.description')}</Text>
      <View style={styles.practiceArea}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('gesture.doubleTap.accessibilityLabel')}
            accessibilityHint={t('gesture.doubleTap.accessibilityHint')}
            onPress={handlePress}
            style={({ pressed }) => [
              styles.doubleTapTarget,
              completed && styles.targetCompleted,
              tapCount === 1 && !completed && styles.doubleTapFirstActive,
              pressed && styles.targetPressed,
            ]}
          >
            <Text allowFontScaling={false} style={styles.doubleTapSymbol}>
              {completed ? '✓' : '☝☝'}
            </Text>
            <Text style={styles.targetLabel}>
              {completed
                ? t('gesture.doubleTap.successTarget')
                : tapCount === 1
                ? t('gesture.doubleTap.firstTap')
                : t('gesture.doubleTap.target')}
            </Text>
            {!completed ? (
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{tapCount === 1 ? '1 / 2' : '0 / 2'}</Text>
              </View>
            ) : null}
          </Pressable>
        </Animated.View>
      </View>
      {completed ? (
        <SuccessMessage onRetry={handleRetry}>{t('gesture.doubleTap.success')}</SuccessMessage>
      ) : (
        <Text style={styles.helpText}>{t('gesture.doubleTap.help')}</Text>
      )}
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

  const handleRetry = () => {
    setCompleted(false);
    translateX.setValue(0);
  };

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
      {completed ? (
        <SuccessMessage onRetry={handleRetry}>{t('gesture.swipe.success')}</SuccessMessage>
      ) : (
        <Text style={styles.helpText}>{t('gesture.swipe.help')}</Text>
      )}
    </View>
  );
}

function VerticalSwipePractice() {
  const [completed, setCompleted] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;
  const hintY = useRef(new Animated.Value(-16)).current;
  const { t } = useLanguage();

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(hintY, { toValue: 16, duration: 900, useNativeDriver: true }),
        Animated.timing(hintY, { toValue: -16, duration: 900, useNativeDriver: true }),
      ]),
    );
    if (!completed) animation.start();
    return () => animation.stop();
  }, [completed, hintY]);

  const panResponder = useMemo(
    () => PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_, gesture) => translateY.setValue(Math.max(-85, Math.min(85, gesture.dy))),
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dy) >= 55) {
          setCompleted(true);
          Animated.sequence([
            Animated.timing(translateY, { toValue: gesture.dy > 0 ? 85 : -85, duration: 160, useNativeDriver: true }),
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
          ]).start();
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
      onPanResponderTerminate: () => Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start(),
    }),
    [translateY],
  );

  const handleRetry = () => {
    setCompleted(false);
    translateY.setValue(0);
  };

  return (
    <View>
      <Text style={styles.practiceTitle}>{t('gesture.verticalSwipe.title')}</Text>
      <Text style={styles.practiceDescription}>{t('gesture.verticalSwipe.description')}</Text>
      <View style={styles.verticalSwipeArea}>
        <Text allowFontScaling={false} style={styles.verticalEdgeArrow}>⌃</Text>
        <Animated.View
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={t('gesture.verticalSwipe.accessibilityLabel')}
          accessibilityHint={t('gesture.verticalSwipe.accessibilityHint')}
          style={[styles.verticalSwipeCard, completed && styles.targetCompleted, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          <Text allowFontScaling={false} style={styles.swipeSymbol}>{completed ? '✓' : '↕'}</Text>
          <Text style={styles.swipeLabel}>{completed ? t('gesture.tap.successTarget') : t('gesture.verticalSwipe.target')}</Text>
        </Animated.View>
        <Text allowFontScaling={false} style={styles.verticalEdgeArrow}>⌄</Text>
        {!completed ? <Animated.Text allowFontScaling={false} style={[styles.movingVerticalArrow, { transform: [{ translateY: hintY }] }]}>↕</Animated.Text> : null}
      </View>
      {completed ? (
        <SuccessMessage onRetry={handleRetry}>{t('gesture.verticalSwipe.success')}</SuccessMessage>
      ) : (
        <Text style={styles.helpText}>{t('gesture.verticalSwipe.help')}</Text>
      )}
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

  const handleRetry = () => {
    setCompleted(false);
    progress.setValue(0);
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
      {completed ? (
        <SuccessMessage onRetry={handleRetry}>{t('gesture.hold.success')}</SuccessMessage>
      ) : (
        <Text style={styles.helpText}>{t('gesture.hold.help')}</Text>
      )}
    </View>
  );
}

function PinchZoomInPractice() {
  const [completed, setCompleted] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const initialDistance = useRef<number | null>(null);
  const { t } = useLanguage();

  const handleTouchStart = (e: any) => {
    if (e.nativeEvent?.touches && e.nativeEvent.touches.length === 2) {
      const [t1, t2] = e.nativeEvent.touches;
      initialDistance.current = Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
    }
  };

  const handleTouchMove = (e: any) => {
    if (completed) return;
    if (e.nativeEvent?.touches && e.nativeEvent.touches.length === 2 && initialDistance.current) {
      const [t1, t2] = e.nativeEvent.touches;
      const currentDist = Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
      const ratio = currentDist / initialDistance.current;
      scale.setValue(Math.min(1.5, Math.max(1, ratio)));

      if (ratio >= 1.28) {
        completeZoomIn();
      }
    }
  };

  const handleTouchEnd = () => {
    initialDistance.current = null;
    if (!completed) {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    }
  };

  const completeZoomIn = () => {
    setCompleted(true);
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.38, duration: 200, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1.28, useNativeDriver: true }),
    ]).start();
  };

  const handleRetry = () => {
    setCompleted(false);
    initialDistance.current = null;
    scale.setValue(1);
  };

  return (
    <View>
      <Text style={styles.practiceTitle}>{t('gesture.pinchZoomIn.title')}</Text>
      <Text style={styles.practiceDescription}>{t('gesture.pinchZoomIn.description')}</Text>
      <View
        style={styles.pinchContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        accessible
        accessibilityRole="image"
        accessibilityLabel={t('gesture.pinchZoomIn.accessibilityLabel')}
        accessibilityHint={t('gesture.pinchZoomIn.accessibilityHint')}
      >
        <Animated.View
          style={[
            styles.pinchCard,
            completed && styles.targetCompleted,
            { transform: [{ scale }] },
          ]}
        >
          <Text allowFontScaling={false} style={styles.pinchSymbol}>{completed ? '✓' : '⤢'}</Text>
          <Text style={styles.pinchLabel}>
            {completed ? t('gesture.tap.successTarget') : t('gesture.pinchZoomIn.target')}
          </Text>
          <Text allowFontScaling={false} style={styles.pinchSubtext}>
            {completed ? '🔍 130%' : '🔍 100%'}
          </Text>
        </Animated.View>

        {!completed ? (
          <View style={styles.pinchButtonRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('gesture.pinchZoomIn.zoomButton')}
              onPress={completeZoomIn}
              style={({ pressed }) => [styles.zoomActionButton, pressed && styles.targetPressed]}
            >
              <Text style={styles.zoomActionButtonText}>{t('gesture.pinchZoomIn.zoomButton')}</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
      {completed ? (
        <SuccessMessage onRetry={handleRetry}>{t('gesture.pinchZoomIn.success')}</SuccessMessage>
      ) : (
        <Text style={styles.helpText}>{t('gesture.pinchZoomIn.help')}</Text>
      )}
    </View>
  );
}

function PinchZoomOutPractice() {
  const [completed, setCompleted] = useState(false);
  const scale = useRef(new Animated.Value(1.3)).current;
  const initialDistance = useRef<number | null>(null);
  const { t } = useLanguage();

  const handleTouchStart = (e: any) => {
    if (e.nativeEvent?.touches && e.nativeEvent.touches.length === 2) {
      const [t1, t2] = e.nativeEvent.touches;
      initialDistance.current = Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
    }
  };

  const handleTouchMove = (e: any) => {
    if (completed) return;
    if (e.nativeEvent?.touches && e.nativeEvent.touches.length === 2 && initialDistance.current) {
      const [t1, t2] = e.nativeEvent.touches;
      const currentDist = Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
      const ratio = currentDist / initialDistance.current;
      const targetScale = Math.max(0.65, Math.min(1.3, 1.3 * ratio));
      scale.setValue(targetScale);

      if (ratio <= 0.74) {
        completeZoomOut();
      }
    }
  };

  const handleTouchEnd = () => {
    initialDistance.current = null;
    if (!completed) {
      Animated.spring(scale, { toValue: 1.3, useNativeDriver: true }).start();
    }
  };

  const completeZoomOut = () => {
    setCompleted(true);
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.78, duration: 200, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 0.86, useNativeDriver: true }),
    ]).start();
  };

  const handleRetry = () => {
    setCompleted(false);
    initialDistance.current = null;
    scale.setValue(1.3);
  };

  return (
    <View>
      <Text style={styles.practiceTitle}>{t('gesture.pinchZoomOut.title')}</Text>
      <Text style={styles.practiceDescription}>{t('gesture.pinchZoomOut.description')}</Text>
      <View
        style={styles.pinchContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        accessible
        accessibilityRole="image"
        accessibilityLabel={t('gesture.pinchZoomOut.accessibilityLabel')}
        accessibilityHint={t('gesture.pinchZoomOut.accessibilityHint')}
      >
        <Animated.View
          style={[
            styles.pinchCard,
            styles.pinchCardLarge,
            completed && styles.targetCompleted,
            { transform: [{ scale }] },
          ]}
        >
          <Text allowFontScaling={false} style={styles.pinchSymbol}>{completed ? '✓' : '⤡'}</Text>
          <Text style={styles.pinchLabel}>
            {completed ? t('gesture.tap.successTarget') : t('gesture.pinchZoomOut.target')}
          </Text>
          <Text allowFontScaling={false} style={styles.pinchSubtext}>
            {completed ? '🔍 85%' : '🔍 130%'}
          </Text>
        </Animated.View>

        {!completed ? (
          <View style={styles.pinchButtonRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('gesture.pinchZoomOut.zoomButton')}
              onPress={completeZoomOut}
              style={({ pressed }) => [styles.zoomActionButton, pressed && styles.targetPressed]}
            >
              <Text style={styles.zoomActionButtonText}>{t('gesture.pinchZoomOut.zoomButton')}</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
      {completed ? (
        <SuccessMessage onRetry={handleRetry}>{t('gesture.pinchZoomOut.success')}</SuccessMessage>
      ) : (
        <Text style={styles.helpText}>{t('gesture.pinchZoomOut.help')}</Text>
      )}
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
            <Pressable
              key={option.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => setGesture(option.id)}
              style={[styles.tab, isLargeText && styles.tabLargeText, active && styles.tabActive]}
            >
              <Text allowFontScaling={false} style={[styles.tabSymbol, active && styles.tabTextActive]}>
                {option.symbol}
              </Text>
              <Text style={[styles.tabLabel, active && styles.tabTextActive]}>
                {t(option.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={[styles.stage, isLargeText && styles.stageLargeText]}>
        {gesture === 'tap' ? <TapPractice /> : null}
        {gesture === 'doubleTap' ? <DoubleTapPractice /> : null}
        {gesture === 'swipe' ? <SwipePractice /> : null}
        {gesture === 'verticalSwipe' ? <VerticalSwipePractice /> : null}
        {gesture === 'hold' ? <HoldPractice /> : null}
        {gesture === 'pinchZoomIn' ? <PinchZoomInPractice /> : null}
        {gesture === 'pinchZoomOut' ? <PinchZoomOutPractice /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: radius.lg, borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primarySoft, padding: spacing.md, gap: spacing.sm },
  heading: { color: colors.text, fontSize: 30, lineHeight: 42, fontWeight: '900' },
  intro: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '700' },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  tabsLargeText: { flexDirection: 'column' },
  tab: { flexBasis: '31%', flexGrow: 1, minHeight: 70, padding: spacing.xs, borderRadius: radius.md, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  tabLargeText: { flexBasis: '100%', padding: spacing.md },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  tabSymbol: { color: colors.primary, fontSize: 22, lineHeight: 28, fontWeight: '900' },
  tabLabel: { color: colors.text, fontSize: 18, lineHeight: 24, fontWeight: '900', textAlign: 'center' },
  tabTextActive: { color: colors.surface },
  stage: { marginTop: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surface, padding: spacing.md },
  stageLargeText: { paddingHorizontal: spacing.sm },
  practiceTitle: { color: colors.text, fontSize: 26, lineHeight: 36, fontWeight: '900', textAlign: 'center' },
  practiceDescription: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '700', textAlign: 'center', marginTop: spacing.sm },
  practiceArea: { minHeight: 205, alignItems: 'center', justifyContent: 'center' },
  tapTarget: { width: 172, minHeight: 142, borderRadius: radius.lg, backgroundColor: colors.coral, borderWidth: 4, borderColor: colors.coralSoft, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  doubleTapTarget: { width: 184, minHeight: 148, borderRadius: radius.lg, backgroundColor: colors.coral, borderWidth: 4, borderColor: colors.coralSoft, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  doubleTapFirstActive: { borderColor: colors.goldSoft, backgroundColor: colors.gold },
  stepBadge: { marginTop: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.round, backgroundColor: 'rgba(0,0,0,0.25)' },
  stepBadgeText: { color: colors.surface, fontSize: 16, fontWeight: '900' },
  holdTarget: { width: 190, minHeight: 156, borderRadius: 95, backgroundColor: colors.blue, borderWidth: 4, borderColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  targetPressed: { opacity: 0.72, transform: [{ scale: 0.96 }] },
  targetCompleted: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  tapSymbol: { color: colors.surface, fontSize: 40, lineHeight: 48 },
  doubleTapSymbol: { color: colors.surface, fontSize: 36, lineHeight: 44, fontWeight: '900' },
  holdSymbol: { color: colors.surface, fontSize: 35, lineHeight: 42 },
  targetLabel: { color: colors.surface, fontSize: 20, lineHeight: 28, fontWeight: '900', textAlign: 'center' },
  helpText: { color: colors.text, fontSize: 18, lineHeight: 25, fontWeight: '700', textAlign: 'center' },
  successWrapper: { gap: spacing.sm },
  success: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.goldSoft },
  successMark: { width: 34, height: 34, borderRadius: 17, color: colors.surface, backgroundColor: colors.primary, fontSize: 20, lineHeight: 34, fontWeight: '900', textAlign: 'center' },
  successText: { flex: 1, color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '800' },
  retryButton: { marginTop: spacing.xs },
  swipeArea: { minHeight: 210, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  swipeCard: { width: 155, minHeight: 120, borderRadius: radius.lg, backgroundColor: colors.blue, borderWidth: 4, borderColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center', padding: spacing.md, zIndex: 2 },
  swipeSymbol: { color: colors.surface, fontSize: 35, lineHeight: 42 },
  swipeLabel: { color: colors.surface, fontSize: 20, lineHeight: 28, fontWeight: '900', textAlign: 'center' },
  edgeArrow: { color: colors.primary, fontSize: 50, fontWeight: '600' },
  movingArrow: { position: 'absolute', bottom: 7, alignSelf: 'center', left: '44%', color: colors.coral, fontSize: 31, fontWeight: '900' },
  verticalSwipeArea: { minHeight: 230, overflow: 'hidden', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xs },
  verticalSwipeCard: { width: '85%', maxWidth: 220, minHeight: 110, borderRadius: radius.lg, backgroundColor: colors.blue, borderWidth: 4, borderColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center', padding: spacing.md, zIndex: 2 },
  verticalEdgeArrow: { color: colors.primary, fontSize: 32, fontWeight: '900', lineHeight: 32 },
  movingVerticalArrow: { position: 'absolute', right: 16, alignSelf: 'center', color: colors.coral, fontSize: 31, fontWeight: '900' },
  progressTrack: { width: '82%', height: 10, overflow: 'hidden', borderRadius: radius.round, backgroundColor: 'rgba(255,255,255,0.42)', marginTop: spacing.sm },
  progressFill: { height: '100%', borderRadius: radius.round, backgroundColor: colors.goldSoft },
  pinchContainer: { minHeight: 230, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, overflow: 'hidden' },
  pinchCard: { width: 165, minHeight: 130, borderRadius: radius.lg, backgroundColor: colors.blue, borderWidth: 4, borderColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  pinchCardLarge: { width: 175, minHeight: 135 },
  pinchSymbol: { color: colors.surface, fontSize: 38, lineHeight: 46, fontWeight: '900' },
  pinchLabel: { color: colors.surface, fontSize: 19, lineHeight: 26, fontWeight: '900', textAlign: 'center' },
  pinchSubtext: { color: colors.surface, fontSize: 16, lineHeight: 22, fontWeight: '700', marginTop: 2, opacity: 0.9 },
  pinchButtonRow: { marginTop: spacing.md, alignItems: 'center' },
  zoomActionButton: { minHeight: 56, minWidth: 140, paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  zoomActionButtonText: { color: colors.primary, fontSize: 19, lineHeight: 26, fontWeight: '900' },
});

