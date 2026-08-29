import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { LargeButton } from '@/components/Buttons';
import { colors, radius, spacing } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/i18n';
import { useAccessibleLayout } from '@/utils/accessibility';

type GestureName = 'tap' | 'doubleTap' | 'swipe' | 'verticalSwipe' | 'hold' | 'pinchZoomIn' | 'pinchZoomOut';

type GestureStep = {
  id: GestureName;
  nameKey: TranslationKey;
  symbol: string;
};

const gestureSteps: GestureStep[] = [
  { id: 'tap', nameKey: 'gesture.tab.tap', symbol: '☝' },
  { id: 'doubleTap', nameKey: 'gesture.tab.doubleTap', symbol: '☝☝' },
  { id: 'swipe', nameKey: 'gesture.tab.swipe', symbol: '↔' },
  { id: 'verticalSwipe', nameKey: 'gesture.tab.verticalSwipe', symbol: '↕' },
  { id: 'hold', nameKey: 'gesture.tab.hold', symbol: '●' },
  { id: 'pinchZoomIn', nameKey: 'gesture.tab.pinchZoomIn', symbol: '⤢' },
  { id: 'pinchZoomOut', nameKey: 'gesture.tab.pinchZoomOut', symbol: '⤡' },
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
  const [swipeStep, setSwipeStep] = useState<'up' | 'down'>('up');
  const translateY = useRef(new Animated.Value(0)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;
  const { t } = useLanguage();

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, { toValue: swipeStep === 'up' ? -14 : 14, duration: 700, useNativeDriver: true }),
        Animated.timing(arrowAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    );
    if (!completed) animation.start();
    return () => animation.stop();
  }, [completed, swipeStep, arrowAnim]);

  const panResponder = useMemo(
    () => PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 6,
      onPanResponderMove: (_, gesture) => translateY.setValue(Math.max(-85, Math.min(85, gesture.dy))),
      onPanResponderRelease: (_, gesture) => {
        if (swipeStep === 'up' && gesture.dy <= -35) {
          // Upward swipe step completed (approx 35-40px upward)
          Animated.sequence([
            Animated.timing(translateY, { toValue: -80, duration: 150, useNativeDriver: true }),
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
          ]).start(() => {
            setSwipeStep('down');
          });
        } else if (swipeStep === 'down' && gesture.dy >= 35) {
          // Downward swipe step completed (approx 35-40px downward)
          setCompleted(true);
          Animated.sequence([
            Animated.timing(translateY, { toValue: 80, duration: 150, useNativeDriver: true }),
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
          ]).start();
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
      onPanResponderTerminate: () => Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start(),
    }),
    [swipeStep, translateY],
  );

  const handleRetry = () => {
    setCompleted(false);
    setSwipeStep('up');
    translateY.setValue(0);
  };

  return (
    <View>
      <Text style={styles.practiceTitle}>{t('gesture.verticalSwipe.title')}</Text>
      <Text style={styles.practiceDescription}>{t('gesture.verticalSwipe.description')}</Text>
      <View style={styles.verticalSwipeArea}>
        <Animated.Text
          allowFontScaling={false}
          style={[
            styles.verticalBigArrow,
            swipeStep === 'up' ? styles.arrowActive : styles.arrowInactive,
            { transform: [{ translateY: swipeStep === 'up' ? arrowAnim : 0 }] },
          ]}
        >
          ▲
        </Animated.Text>

        <Animated.View
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={t('gesture.verticalSwipe.accessibilityLabel')}
          accessibilityHint={t('gesture.verticalSwipe.accessibilityHint')}
          style={[styles.verticalSwipeCard, completed && styles.targetCompleted, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          <Text allowFontScaling={false} style={styles.swipeSymbol}>
            {completed ? '✓' : swipeStep === 'up' ? '▲' : '▼'}
          </Text>
          <Text style={styles.swipeLabel}>
            {completed
              ? t('gesture.tap.successTarget')
              : swipeStep === 'up'
              ? t('gesture.verticalSwipe.targetUp')
              : t('gesture.verticalSwipe.targetDown')}
          </Text>
          {!completed ? (
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>
                {swipeStep === 'up' ? '1 / 2 ↑' : '2 / 2 ↓'}
              </Text>
            </View>
          ) : null}
        </Animated.View>

        <Animated.Text
          allowFontScaling={false}
          style={[
            styles.verticalBigArrow,
            swipeStep === 'down' ? styles.arrowActive : styles.arrowInactive,
            { transform: [{ translateY: swipeStep === 'down' ? arrowAnim : 0 }] },
          ]}
        >
          ▼
        </Animated.Text>
      </View>
      {completed ? (
        <SuccessMessage onRetry={handleRetry}>{t('gesture.verticalSwipe.success')}</SuccessMessage>
      ) : swipeStep === 'down' ? (
        <Text style={styles.stepFeedbackText}>{t('gesture.verticalSwipe.step1Done')}</Text>
      ) : (
        <Text style={styles.helpText}>{t('gesture.verticalSwipe.help')}</Text>
      )}
    </View>
  );
}

function HoldPractice() {
  const [completed, setCompleted] = useState(false);
  const [earlyRelease, setEarlyRelease] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const isHeldRef = useRef(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useLanguage();

  const handleTouchStart = (e: any) => {
    if (completed) return;
    setEarlyRelease(false);
    isHeldRef.current = true;
    if (e.nativeEvent) {
      startPos.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
    }
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: 700, useNativeDriver: false }).start();

    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    holdTimerRef.current = setTimeout(() => {
      if (isHeldRef.current) {
        setCompleted(true);
        setEarlyRelease(false);
        progress.setValue(1);
      }
    }, 700);
  };

  const handleTouchMove = (e: any) => {
    if (completed || !isHeldRef.current || !startPos.current || !e.nativeEvent) return;
    const dx = e.nativeEvent.pageX - startPos.current.x;
    const dy = e.nativeEvent.pageY - startPos.current.y;
    // Tolerate small finger movement up to 20px
    if (Math.hypot(dx, dy) > 26) {
      cancelHold();
    }
  };

  const handleTouchEnd = () => {
    if (completed) return;
    if (isHeldRef.current) {
      cancelHold();
      setEarlyRelease(true);
    }
  };

  const cancelHold = () => {
    isHeldRef.current = false;
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    progress.stopAnimation();
    Animated.timing(progress, { toValue: 0, duration: 150, useNativeDriver: false }).start();
  };

  const handleRetry = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    isHeldRef.current = false;
    setCompleted(false);
    setEarlyRelease(false);
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
          onPressIn={handleTouchStart}
          onPressOut={handleTouchEnd}
          onTouchMove={handleTouchMove}
          style={({ pressed }) => [styles.holdTarget, completed && styles.targetCompleted, pressed && styles.targetPressed]}
        >
          <Text allowFontScaling={false} style={styles.holdSymbol}>{completed ? '✓' : '●'}</Text>
          <Text style={styles.targetLabel}>{completed ? t('gesture.tap.successTarget') : t('gesture.hold.target')}</Text>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
              ]}
            />
          </View>
        </Pressable>
      </View>
      {completed ? (
        <SuccessMessage onRetry={handleRetry}>{t('gesture.hold.success')}</SuccessMessage>
      ) : earlyRelease ? (
        <Text style={styles.warningGuideText}>{t('gesture.hold.earlyRelease')}</Text>
      ) : (
        <Text style={styles.helpText}>{t('gesture.hold.help')}</Text>
      )}
    </View>
  );
}

function PinchZoomInPractice() {
  const [completed, setCompleted] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const dotSpread = useRef(new Animated.Value(0)).current;
  const initialDistance = useRef<number | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(dotSpread, { toValue: 24, duration: 1100, useNativeDriver: true }),
        Animated.timing(dotSpread, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]),
    );
    if (!completed) animation.start();
    return () => animation.stop();
  }, [completed, dotSpread]);

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
      const delta = currentDist - initialDistance.current;

      scale.setValue(Math.min(1.4, Math.max(1, ratio)));

      // Genuine ~12-15% expansion or at least 20px distance increase
      if (ratio >= 1.13 || delta >= 20) {
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
      Animated.timing(scale, { toValue: 1.32, duration: 200, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1.25, useNativeDriver: true }),
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

          {!completed ? (
            <View style={styles.dotsDemoRow}>
              <Animated.View
                style={[
                  styles.fingerDot,
                  { transform: [{ translateX: Animated.multiply(dotSpread, -1) }] },
                ]}
              >
                <Text allowFontScaling={false} style={styles.dotText}>👈</Text>
              </Animated.View>
              <Text allowFontScaling={false} style={styles.dotsCenterArrow}>⇦ ⇨</Text>
              <Animated.View
                style={[
                  styles.fingerDot,
                  { transform: [{ translateX: dotSpread }] },
                ]}
              >
                <Text allowFontScaling={false} style={styles.dotText}>👉</Text>
              </Animated.View>
            </View>
          ) : null}
        </Animated.View>
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
  const scale = useRef(new Animated.Value(1.25)).current;
  const dotPinch = useRef(new Animated.Value(24)).current;
  const initialDistance = useRef<number | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(dotPinch, { toValue: 4, duration: 1100, useNativeDriver: true }),
        Animated.timing(dotPinch, { toValue: 24, duration: 350, useNativeDriver: true }),
      ]),
    );
    if (!completed) animation.start();
    return () => animation.stop();
  }, [completed, dotPinch]);

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
      const delta = initialDistance.current - currentDist;

      const targetScale = Math.max(0.75, Math.min(1.25, 1.25 * ratio));
      scale.setValue(targetScale);

      // Genuine ~12-15% contraction or at least 20px distance decrease
      if (ratio <= 0.87 || delta >= 20) {
        completeZoomOut();
      }
    }
  };

  const handleTouchEnd = () => {
    initialDistance.current = null;
    if (!completed) {
      Animated.spring(scale, { toValue: 1.25, useNativeDriver: true }).start();
    }
  };

  const completeZoomOut = () => {
    setCompleted(true);
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.82, duration: 200, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 0.88, useNativeDriver: true }),
    ]).start();
  };

  const handleRetry = () => {
    setCompleted(false);
    initialDistance.current = null;
    scale.setValue(1.25);
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

          {!completed ? (
            <View style={styles.dotsDemoRow}>
              <Animated.View
                style={[
                  styles.fingerDot,
                  { transform: [{ translateX: dotPinch }] },
                ]}
              >
                <Text allowFontScaling={false} style={styles.dotText}>👉</Text>
              </Animated.View>
              <Text allowFontScaling={false} style={styles.dotsCenterArrow}>⇨ ⇦</Text>
              <Animated.View
                style={[
                  styles.fingerDot,
                  { transform: [{ translateX: Animated.multiply(dotPinch, -1) }] },
                ]}
              >
                <Text allowFontScaling={false} style={styles.dotText}>👈</Text>
              </Animated.View>
            </View>
          ) : null}
        </Animated.View>
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
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const { isLargeText } = useAccessibleLayout();
  const { t } = useLanguage();

  const totalSteps = gestureSteps.length;
  const currentStep = gestureSteps[currentStepIndex];

  const goToNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const goToPrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setIsCompleted(false);
  };

  if (isCompleted) {
    return (
      <View style={styles.container}>
        <View style={styles.completedCard}>
          <View style={styles.completedIconWrapper}>
            <Text allowFontScaling={false} style={styles.completedIcon}>✓</Text>
          </View>
          <Text style={styles.completedTitle} accessibilityRole="header">
            {t('gesture.completedTitle')}
          </Text>
          <Text style={styles.completedText}>
            {t('gesture.completedText')}
          </Text>
          <LargeButton
            label={t('gesture.restart')}
            onPress={handleRestart}
            accessibilityHint={t('gesture.restartHint')}
            style={styles.restartButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[styles.stepBanner, isLargeText && styles.stepBannerLargeText]}
        accessible
        accessibilityRole="summary"
        accessibilityLabel={t('gesture.progressAccessibility', {
          current: currentStepIndex + 1,
          name: t(currentStep.nameKey),
        })}
      >
        <View style={styles.stepInfoRow}>
          <Text style={styles.stepProgressNumber}>
            {t('gesture.progressTitle', {
              current: currentStepIndex + 1,
              total: totalSteps,
              name: t(currentStep.nameKey),
            })}
          </Text>
          <Text allowFontScaling={false} style={styles.stepSymbolBadge}>
            {currentStep.symbol}
          </Text>
        </View>
        <View style={styles.progressBarTrack} accessible={false}>
          {gestureSteps.map((step, idx) => (
            <View
              key={step.id}
              style={[
                styles.progressBarSegment,
                idx <= currentStepIndex && styles.progressBarSegmentActive,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={[styles.stage, isLargeText && styles.stageLargeText]}>
        {currentStep.id === 'tap' ? <TapPractice key="tap" /> : null}
        {currentStep.id === 'doubleTap' ? <DoubleTapPractice key="doubleTap" /> : null}
        {currentStep.id === 'swipe' ? <SwipePractice key="swipe" /> : null}
        {currentStep.id === 'verticalSwipe' ? <VerticalSwipePractice key="verticalSwipe" /> : null}
        {currentStep.id === 'hold' ? <HoldPractice key="hold" /> : null}
        {currentStep.id === 'pinchZoomIn' ? <PinchZoomInPractice key="pinchZoomIn" /> : null}
        {currentStep.id === 'pinchZoomOut' ? <PinchZoomOutPractice key="pinchZoomOut" /> : null}
      </View>

      <View style={styles.navigationStack}>
        {currentStepIndex < totalSteps - 1 ? (
          <LargeButton
            label={t('gesture.next')}
            onPress={goToNext}
            accessibilityHint={t('gesture.nextHint')}
            style={styles.navButton}
          />
        ) : (
          <LargeButton
            label={t('gesture.finish')}
            onPress={goToNext}
            accessibilityHint={t('gesture.finishHint')}
            style={styles.navButton}
          />
        )}

        {currentStepIndex > 0 ? (
          <LargeButton
            label={t('gesture.prev')}
            secondary
            onPress={goToPrev}
            accessibilityHint={t('gesture.prevHint')}
            style={styles.navButton}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: radius.lg, borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primarySoft, padding: spacing.sm, gap: spacing.sm },
  stepBanner: { padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, gap: spacing.xs },
  stepBannerLargeText: { padding: spacing.sm },
  stepInfoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs },
  stepProgressNumber: { color: colors.primary, fontSize: 21, lineHeight: 28, fontWeight: '900', flex: 1 },
  stepSymbolBadge: { color: colors.primary, fontSize: 24, lineHeight: 28, fontWeight: '900', backgroundColor: colors.primarySoft, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
  progressBarTrack: { flexDirection: 'row', gap: 4, marginTop: 2 },
  progressBarSegment: { flex: 1, height: 7, borderRadius: radius.round, backgroundColor: colors.border, opacity: 0.45 },
  progressBarSegmentActive: { backgroundColor: colors.primary, opacity: 1 },
  stage: { borderRadius: radius.md, backgroundColor: colors.surface, padding: spacing.md },
  stageLargeText: { paddingHorizontal: spacing.sm },
  practiceTitle: { color: colors.text, fontSize: 26, lineHeight: 34, fontWeight: '900', textAlign: 'center' },
  practiceDescription: { color: colors.text, fontSize: 19, lineHeight: 26, fontWeight: '700', textAlign: 'center', marginTop: spacing.xs },
  practiceArea: { minHeight: 185, alignItems: 'center', justifyContent: 'center' },
  tapTarget: { width: 172, minHeight: 138, borderRadius: radius.lg, backgroundColor: colors.coral, borderWidth: 4, borderColor: colors.coralSoft, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  doubleTapTarget: { width: 184, minHeight: 144, borderRadius: radius.lg, backgroundColor: colors.coral, borderWidth: 4, borderColor: colors.coralSoft, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  doubleTapFirstActive: { borderColor: colors.goldSoft, backgroundColor: colors.gold },
  stepBadge: { marginTop: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.round, backgroundColor: 'rgba(0,0,0,0.3)' },
  stepBadgeText: { color: colors.surface, fontSize: 16, fontWeight: '900' },
  holdTarget: { width: 195, minHeight: 150, borderRadius: radius.lg, backgroundColor: colors.blue, borderWidth: 4, borderColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  targetPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  targetCompleted: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  tapSymbol: { color: colors.surface, fontSize: 38, lineHeight: 46 },
  doubleTapSymbol: { color: colors.surface, fontSize: 34, lineHeight: 42, fontWeight: '900' },
  holdSymbol: { color: colors.surface, fontSize: 34, lineHeight: 40 },
  targetLabel: { color: colors.surface, fontSize: 20, lineHeight: 27, fontWeight: '900', textAlign: 'center' },
  helpText: { color: colors.text, fontSize: 18, lineHeight: 25, fontWeight: '700', textAlign: 'center', marginTop: spacing.xs },
  stepFeedbackText: { color: colors.primary, fontSize: 18, lineHeight: 25, fontWeight: '900', textAlign: 'center', marginTop: spacing.xs },
  warningGuideText: { color: colors.coral, fontSize: 18, lineHeight: 25, fontWeight: '800', textAlign: 'center', marginTop: spacing.xs },
  successWrapper: { gap: spacing.xs, marginTop: spacing.xs },
  success: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.goldSoft },
  successMark: { width: 34, height: 34, borderRadius: 17, color: colors.surface, backgroundColor: colors.primary, fontSize: 20, lineHeight: 34, fontWeight: '900', textAlign: 'center' },
  successText: { flex: 1, color: colors.text, fontSize: 19, lineHeight: 26, fontWeight: '800' },
  retryButton: { marginTop: spacing.xs },
  swipeArea: { minHeight: 190, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  swipeCard: { width: 155, minHeight: 118, borderRadius: radius.lg, backgroundColor: colors.blue, borderWidth: 4, borderColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center', padding: spacing.md, zIndex: 2 },
  swipeSymbol: { color: colors.surface, fontSize: 34, lineHeight: 40 },
  swipeLabel: { color: colors.surface, fontSize: 19, lineHeight: 26, fontWeight: '900', textAlign: 'center' },
  edgeArrow: { color: colors.primary, fontSize: 46, fontWeight: '600' },
  movingArrow: { position: 'absolute', bottom: 4, alignSelf: 'center', left: '44%', color: colors.coral, fontSize: 28, fontWeight: '900' },
  verticalSwipeArea: { minHeight: 220, overflow: 'hidden', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xs },
  verticalSwipeCard: { width: '88%', maxWidth: 230, minHeight: 112, borderRadius: radius.lg, backgroundColor: colors.blue, borderWidth: 4, borderColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center', padding: spacing.md, zIndex: 2 },
  verticalBigArrow: { fontSize: 32, lineHeight: 36, fontWeight: '900' },
  arrowActive: { color: colors.coral, opacity: 1 },
  arrowInactive: { color: colors.primary, opacity: 0.3 },
  progressTrack: { width: '85%', height: 10, overflow: 'hidden', borderRadius: radius.round, backgroundColor: 'rgba(255,255,255,0.42)', marginTop: spacing.xs },
  progressFill: { height: '100%', borderRadius: radius.round, backgroundColor: colors.goldSoft },
  pinchContainer: { minHeight: 260, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, overflow: 'hidden' },
  pinchCard: { width: 180, minHeight: 165, borderRadius: radius.lg, backgroundColor: colors.blue, borderWidth: 4, borderColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  pinchCardLarge: { width: 190, minHeight: 175 },
  pinchSymbol: { color: colors.surface, fontSize: 36, lineHeight: 44, fontWeight: '900' },
  pinchLabel: { color: colors.surface, fontSize: 19, lineHeight: 26, fontWeight: '900', textAlign: 'center' },
  dotsDemoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, marginTop: spacing.sm },
  fingerDot: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  dotText: { fontSize: 18 },
  dotsCenterArrow: { color: colors.goldSoft, fontSize: 16, fontWeight: '900' },
  navigationStack: { marginTop: spacing.sm, gap: spacing.xs },
  navButton: { minHeight: 58 },
  completedCard: { padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.primary, alignItems: 'center', gap: spacing.md },
  completedIconWrapper: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  completedIcon: { color: colors.surface, fontSize: 40, lineHeight: 68, fontWeight: '900', textAlign: 'center' },
  completedTitle: { color: colors.text, fontSize: 26, lineHeight: 36, fontWeight: '900', textAlign: 'center' },
  completedText: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '700', textAlign: 'center' },
  restartButton: { minHeight: 58, width: '100%', marginTop: spacing.sm },
});
