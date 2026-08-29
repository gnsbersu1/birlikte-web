import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
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
        <Text allowFontScaling={false} selectable={false} style={styles.successMark}>✓</Text>
        <Text selectable={false} style={styles.successText}>{children}</Text>
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
      <Text selectable={false} style={styles.practiceTitle}>{t('gesture.tap.title')}</Text>
      <Text selectable={false} style={styles.practiceDescription}>{t('gesture.tap.description')}</Text>
      <View style={styles.practiceArea}>
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('gesture.tap.accessibilityLabel')}
            accessibilityHint={t('gesture.tap.accessibilityHint')}
            onPress={complete}
            style={({ pressed }) => [styles.tapTarget, completed && styles.targetCompleted, pressed && styles.targetPressed]}
          >
            <Text allowFontScaling={false} selectable={false} style={styles.tapSymbol}>{completed ? '✓' : '☝'}</Text>
            <Text selectable={false} style={styles.targetLabel}>{t(completed ? 'gesture.tap.successTarget' : 'gesture.tap.target')}</Text>
          </Pressable>
        </Animated.View>
      </View>
      {completed ? (
        <SuccessMessage onRetry={handleRetry}>{t('gesture.tap.success')}</SuccessMessage>
      ) : (
        <Text selectable={false} style={styles.helpText}>{t('gesture.tap.help')}</Text>
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
      <Text selectable={false} style={styles.practiceTitle}>{t('gesture.doubleTap.title')}</Text>
      <Text selectable={false} style={styles.practiceDescription}>{t('gesture.doubleTap.description')}</Text>
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
            <Text allowFontScaling={false} selectable={false} style={styles.doubleTapSymbol}>
              {completed ? '✓' : '☝☝'}
            </Text>
            <Text selectable={false} style={styles.targetLabel}>
              {completed
                ? t('gesture.doubleTap.successTarget')
                : tapCount === 1
                ? t('gesture.doubleTap.firstTap')
                : t('gesture.doubleTap.target')}
            </Text>
            {!completed ? (
              <View style={styles.stepBadge}>
                <Text selectable={false} style={styles.stepBadgeText}>{tapCount === 1 ? '1 / 2' : '0 / 2'}</Text>
              </View>
            ) : null}
          </Pressable>
        </Animated.View>
      </View>
      {completed ? (
        <SuccessMessage onRetry={handleRetry}>{t('gesture.doubleTap.success')}</SuccessMessage>
      ) : (
        <Text selectable={false} style={styles.helpText}>{t('gesture.doubleTap.help')}</Text>
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
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 6,
      onPanResponderMove: (_, gesture) => translateX.setValue(Math.max(-105, Math.min(105, gesture.dx))),
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) >= 60) {
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
      <Text selectable={false} style={styles.practiceTitle}>{t('gesture.swipe.title')}</Text>
      <Text selectable={false} style={styles.practiceDescription}>{t('gesture.swipe.description')}</Text>
      <View style={styles.swipeArea}>
        <Text allowFontScaling={false} selectable={false} style={styles.edgeArrow}>‹</Text>
        <Animated.View
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={t('gesture.swipe.accessibilityLabel')}
          accessibilityHint={t('gesture.swipe.accessibilityHint')}
          style={[styles.swipeCard, completed && styles.targetCompleted, { transform: [{ translateX }] }]}
          {...panResponder.panHandlers}
        >
          <Text allowFontScaling={false} selectable={false} style={styles.swipeSymbol}>{completed ? '✓' : '☝'}</Text>
          <Text selectable={false} style={styles.swipeLabel}>{completed ? t('gesture.tap.successTarget') : t('gesture.swipe.target')}</Text>
        </Animated.View>
        <Text allowFontScaling={false} selectable={false} style={styles.edgeArrow}>›</Text>
        {!completed ? <Animated.Text allowFontScaling={false} selectable={false} style={[styles.movingArrow, { transform: [{ translateX: hintX }] }]}>↔</Animated.Text> : null}
      </View>
      {completed ? (
        <SuccessMessage onRetry={handleRetry}>{t('gesture.swipe.success')}</SuccessMessage>
      ) : (
        <Text selectable={false} style={styles.helpText}>{t('gesture.swipe.help')}</Text>
      )}
    </View>
  );
}

function VerticalSwipePractice() {
  const [completed, setCompleted] = useState(false);
  const [swipeStep, setSwipeStep] = useState<'up' | 'down'>('up');
  const translateY = useRef(new Animated.Value(0)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;
  const containerRef = useRef<View>(null);

  const isTrackingRef = useRef(false);
  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const swipeStepRef = useRef<'up' | 'down'>('up');
  const completedRef = useRef(false);
  const isTouchInteractionRef = useRef(false);

  const { t } = useLanguage();

  swipeStepRef.current = swipeStep;
  completedRef.current = completed;

  // Arrow bounce animation
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

  // Robust Native Web DOM Touch Layer for iOS Safari & Android Chrome
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const element = containerRef.current as unknown as HTMLElement | null;
    if (!element) return;

    element.style.setProperty('touch-action', 'none');
    element.style.setProperty('overscroll-behavior', 'contain');
    element.style.setProperty('-webkit-user-select', 'none');
    element.style.setProperty('-webkit-touch-callout', 'none');
    element.style.setProperty('user-select', 'none');

    const handleDocTouchMove = (e: TouchEvent) => {
      if (!isTrackingRef.current || completedRef.current) return;
      // Prevent page scroll during active vertical swipe inside the exercise box
      if (e.cancelable) {
        e.preventDefault();
      }
      const touch = e.touches[0];
      if (touch) {
        const dy = touch.clientY - startYRef.current;
        translateY.setValue(Math.max(-85, Math.min(85, dy)));
      }
    };

    const handleDocTouchEnd = (e: TouchEvent) => {
      if (!isTrackingRef.current) return;
      isTrackingRef.current = false;

      document.removeEventListener('touchmove', handleDocTouchMove, { capture: true } as any);
      document.removeEventListener('touchend', handleDocTouchEnd, { capture: true } as any);
      document.removeEventListener('touchcancel', handleDocTouchEnd, { capture: true } as any);

      // Prevent simulated mouse events on mobile browsers
      setTimeout(() => {
        isTouchInteractionRef.current = false;
      }, 400);

      if (completedRef.current) return;

      const touch = e.changedTouches[0];
      if (touch) {
        const dy = touch.clientY - startYRef.current;
        const dx = touch.clientX - startXRef.current;

        // Tolerate horizontal deviation up to 30px
        if (Math.abs(dx) <= 30 || Math.abs(dy) >= Math.abs(dx)) {
          if (swipeStepRef.current === 'up' && dy <= -25) {
            // Stage 1 UP completed (25-30px upward movement)
            Animated.sequence([
              Animated.timing(translateY, { toValue: -75, duration: 140, useNativeDriver: true }),
              Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
            ]).start(() => {
              setSwipeStep('down');
            });
            return;
          } else if (swipeStepRef.current === 'down' && dy >= 25) {
            // Stage 2 DOWN completed (25-30px downward movement)
            setCompleted(true);
            Animated.sequence([
              Animated.timing(translateY, { toValue: 75, duration: 140, useNativeDriver: true }),
              Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
            ]).start();
            return;
          }
        }
      }

      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
    };

    const handleContainerTouchStart = (e: TouchEvent) => {
      if (completedRef.current) return;
      const touch = e.touches[0];
      if (!touch) return;

      isTouchInteractionRef.current = true;
      isTrackingRef.current = true;
      startYRef.current = touch.clientY;
      startXRef.current = touch.clientX;

      document.addEventListener('touchmove', handleDocTouchMove, { passive: false, capture: true });
      document.addEventListener('touchend', handleDocTouchEnd, { passive: false, capture: true });
      document.addEventListener('touchcancel', handleDocTouchEnd, { passive: false, capture: true });
    };

    // Desktop Mouse support (ignored if mobile touch is active)
    const handleDocMouseMove = (e: MouseEvent) => {
      if (isTouchInteractionRef.current || !isTrackingRef.current || completedRef.current) return;
      e.preventDefault();
      const dy = e.clientY - startYRef.current;
      translateY.setValue(Math.max(-85, Math.min(85, dy)));
    };

    const handleDocMouseUp = (e: MouseEvent) => {
      if (isTouchInteractionRef.current || !isTrackingRef.current) return;
      isTrackingRef.current = false;

      document.removeEventListener('mousemove', handleDocMouseMove);
      document.removeEventListener('mouseup', handleDocMouseUp);

      if (completedRef.current) return;

      const dy = e.clientY - startYRef.current;
      const dx = e.clientX - startXRef.current;

      if (Math.abs(dx) <= 30 || Math.abs(dy) >= Math.abs(dx)) {
        if (swipeStepRef.current === 'up' && dy <= -25) {
          Animated.sequence([
            Animated.timing(translateY, { toValue: -75, duration: 140, useNativeDriver: true }),
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
          ]).start(() => {
            setSwipeStep('down');
          });
          return;
        } else if (swipeStepRef.current === 'down' && dy >= 25) {
          setCompleted(true);
          Animated.sequence([
            Animated.timing(translateY, { toValue: 75, duration: 140, useNativeDriver: true }),
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
          ]).start();
          return;
        }
      }

      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
    };

    const handleContainerMouseDown = (e: MouseEvent) => {
      if (isTouchInteractionRef.current || completedRef.current) return;
      isTrackingRef.current = true;
      startYRef.current = e.clientY;
      startXRef.current = e.clientX;

      document.addEventListener('mousemove', handleDocMouseMove);
      document.addEventListener('mouseup', handleDocMouseUp);
    };

    element.addEventListener('touchstart', handleContainerTouchStart, { passive: false, capture: true });
    element.addEventListener('mousedown', handleContainerMouseDown);

    return () => {
      element.removeEventListener('touchstart', handleContainerTouchStart, { capture: true } as any);
      element.removeEventListener('mousedown', handleContainerMouseDown);
      document.removeEventListener('touchmove', handleDocTouchMove, { capture: true } as any);
      document.removeEventListener('touchend', handleDocTouchEnd, { capture: true } as any);
      document.removeEventListener('touchcancel', handleDocTouchEnd, { capture: true } as any);
      document.removeEventListener('mousemove', handleDocMouseMove);
      document.removeEventListener('mouseup', handleDocMouseUp);
    };
  }, []);

  const handleRetry = () => {
    setCompleted(false);
    setSwipeStep('up');
    translateY.setValue(0);
  };

  return (
    <View>
      <Text selectable={false} style={styles.practiceTitle}>{t('gesture.verticalSwipe.title')}</Text>
      <Text selectable={false} style={styles.practiceDescription}>{t('gesture.verticalSwipe.description')}</Text>
      <View
        ref={containerRef}
        style={styles.verticalSwipeArea}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={t('gesture.verticalSwipe.accessibilityLabel')}
        accessibilityHint={t('gesture.verticalSwipe.accessibilityHint')}
      >
        <Animated.Text
          allowFontScaling={false}
          selectable={false}
          style={[
            styles.verticalBigArrow,
            swipeStep === 'up' ? styles.arrowActive : styles.arrowInactive,
            { transform: [{ translateY: swipeStep === 'up' ? arrowAnim : 0 }] },
          ]}
        >
          ▲
        </Animated.Text>

        <Animated.View
          style={[styles.verticalSwipeCard, completed && styles.targetCompleted, { transform: [{ translateY }] }]}
        >
          <Text allowFontScaling={false} selectable={false} style={styles.swipeSymbol}>
            {completed ? '✓' : swipeStep === 'up' ? '▲' : '▼'}
          </Text>
          <Text selectable={false} style={styles.swipeLabel}>
            {completed
              ? t('gesture.tap.successTarget')
              : swipeStep === 'up'
              ? t('gesture.verticalSwipe.targetUp')
              : t('gesture.verticalSwipe.targetDown')}
          </Text>
          {!completed ? (
            <View style={styles.stepBadge}>
              <Text selectable={false} style={styles.stepBadgeText}>
                {swipeStep === 'up' ? '1 / 2 ↑' : '2 / 2 ↓'}
              </Text>
            </View>
          ) : null}
        </Animated.View>

        <Animated.Text
          allowFontScaling={false}
          selectable={false}
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
        <Text selectable={false} style={styles.stepFeedbackText}>{t('gesture.verticalSwipe.step1Done')}</Text>
      ) : (
        <Text selectable={false} style={styles.helpText}>{t('gesture.verticalSwipe.help')}</Text>
      )}
    </View>
  );
}

function HoldPractice() {
  const [completed, setCompleted] = useState(false);
  const [earlyRelease, setEarlyRelease] = useState(false);
  const [isHoldingVisual, setIsHoldingVisual] = useState(false);

  const progress = useRef(new Animated.Value(0)).current;
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const isHeldRef = useRef(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<View>(null);
  const completedRef = useRef(false);
  const isTouchInteractionRef = useRef(false);

  const { t } = useLanguage();
  completedRef.current = completed;

  // Web Touch & Text-Selection / Magnifier Prevention Layer for iOS Safari & Android Chrome
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const element = containerRef.current as unknown as HTMLElement | null;
    if (!element) return;

    element.style.setProperty('-webkit-touch-callout', 'none');
    element.style.setProperty('-webkit-user-select', 'none');
    element.style.setProperty('user-select', 'none');
    element.style.setProperty('touch-action', 'none');

    const preventDefaultAction = (e: Event) => {
      e.preventDefault();
    };

    element.addEventListener('contextmenu', preventDefaultAction);
    element.addEventListener('selectstart', preventDefaultAction);
    element.addEventListener('dragstart', preventDefaultAction);

    const cancelHold = () => {
      isHeldRef.current = false;
      setIsHoldingVisual(false);
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      progress.stopAnimation();
      Animated.timing(progress, { toValue: 0, duration: 120, useNativeDriver: false }).start();

      document.removeEventListener('touchmove', handleDocTouchMove, { capture: true } as any);
      document.removeEventListener('touchend', handleDocTouchEnd, { capture: true } as any);
      document.removeEventListener('touchcancel', handleDocTouchEnd, { capture: true } as any);
      document.removeEventListener('mousemove', handleDocMouseMove);
      document.removeEventListener('mouseup', handleDocMouseUp);
    };

    const handleDocTouchMove = (e: TouchEvent) => {
      if (!isHeldRef.current || completedRef.current) return;
      if (e.cancelable) e.preventDefault();
      const touch = e.touches[0];
      if (touch && startPosRef.current) {
        const dx = touch.clientX - startPosRef.current.x;
        const dy = touch.clientY - startPosRef.current.y;
        // Tolerate small finger movement up to 30px
        if (Math.hypot(dx, dy) > 30) {
          cancelHold();
          setEarlyRelease(true);
        }
      }
    };

    const handleDocTouchEnd = () => {
      if (completedRef.current) return;
      setTimeout(() => {
        isTouchInteractionRef.current = false;
      }, 400);
      if (isHeldRef.current) {
        cancelHold();
        setEarlyRelease(true);
      }
    };

    const handleContainerTouchStart = (e: TouchEvent) => {
      if (completedRef.current) return;
      if (e.cancelable) e.preventDefault();

      const touch = e.touches[0];
      if (!touch) return;

      isTouchInteractionRef.current = true;
      isHeldRef.current = true;
      setIsHoldingVisual(true);
      setEarlyRelease(false);
      startPosRef.current = { x: touch.clientX, y: touch.clientY };

      progress.setValue(0);
      Animated.timing(progress, { toValue: 1, duration: 600, useNativeDriver: false }).start();

      document.addEventListener('touchmove', handleDocTouchMove, { passive: false, capture: true });
      document.addEventListener('touchend', handleDocTouchEnd, { passive: false, capture: true });
      document.addEventListener('touchcancel', handleDocTouchEnd, { passive: false, capture: true });

      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      holdTimerRef.current = setTimeout(() => {
        if (isHeldRef.current) {
          setCompleted(true);
          setEarlyRelease(false);
          setIsHoldingVisual(false);
          progress.setValue(1);
          cancelHold();
        }
      }, 600);
    };

    // Desktop Mouse support (ignored if touch active)
    const handleDocMouseMove = (e: MouseEvent) => {
      if (isTouchInteractionRef.current || !isHeldRef.current || completedRef.current) return;
      if (startPosRef.current) {
        const dx = e.clientX - startPosRef.current.x;
        const dy = e.clientY - startPosRef.current.y;
        if (Math.hypot(dx, dy) > 30) {
          cancelHold();
          setEarlyRelease(true);
        }
      }
    };

    const handleDocMouseUp = () => {
      if (isTouchInteractionRef.current || completedRef.current) return;
      if (isHeldRef.current) {
        cancelHold();
        setEarlyRelease(true);
      }
    };

    const handleContainerMouseDown = (e: MouseEvent) => {
      if (isTouchInteractionRef.current || completedRef.current) return;
      e.preventDefault();

      isHeldRef.current = true;
      setIsHoldingVisual(true);
      setEarlyRelease(false);
      startPosRef.current = { x: e.clientX, y: e.clientY };

      progress.setValue(0);
      Animated.timing(progress, { toValue: 1, duration: 600, useNativeDriver: false }).start();

      document.addEventListener('mousemove', handleDocMouseMove);
      document.addEventListener('mouseup', handleDocMouseUp);

      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      holdTimerRef.current = setTimeout(() => {
        if (isHeldRef.current) {
          setCompleted(true);
          setEarlyRelease(false);
          setIsHoldingVisual(false);
          progress.setValue(1);
          cancelHold();
        }
      }, 600);
    };

    element.addEventListener('touchstart', handleContainerTouchStart, { passive: false, capture: true });
    element.addEventListener('mousedown', handleContainerMouseDown);

    return () => {
      element.removeEventListener('contextmenu', preventDefaultAction);
      element.removeEventListener('selectstart', preventDefaultAction);
      element.removeEventListener('dragstart', preventDefaultAction);
      element.removeEventListener('touchstart', handleContainerTouchStart, { capture: true } as any);
      element.removeEventListener('mousedown', handleContainerMouseDown);
      cancelHold();
    };
  }, []);

  const handleRetry = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    isHeldRef.current = false;
    setIsHoldingVisual(false);
    setCompleted(false);
    setEarlyRelease(false);
    progress.setValue(0);
  };

  return (
    <View>
      <Text selectable={false} style={styles.practiceTitle}>{t('gesture.hold.title')}</Text>
      <Text selectable={false} style={styles.practiceDescription}>{t('gesture.hold.description')}</Text>
      <View
        ref={containerRef}
        style={styles.holdArea}
        accessible
        accessibilityRole="button"
        accessibilityLabel={t('gesture.hold.accessibilityLabel')}
        accessibilityHint={t('gesture.hold.accessibilityHint')}
      >
        <View style={[styles.holdTarget, completed && styles.targetCompleted, isHoldingVisual && styles.targetPressed]}>
          <Text allowFontScaling={false} selectable={false} style={styles.holdSymbol}>{completed ? '✓' : '●'}</Text>
          <Text selectable={false} style={styles.targetLabel}>{completed ? t('gesture.tap.successTarget') : t('gesture.hold.target')}</Text>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
              ]}
            />
          </View>
        </View>
      </View>
      {completed ? (
        <SuccessMessage onRetry={handleRetry}>{t('gesture.hold.success')}</SuccessMessage>
      ) : earlyRelease ? (
        <Text selectable={false} style={styles.warningGuideText}>{t('gesture.hold.earlyRelease')}</Text>
      ) : (
        <Text selectable={false} style={styles.helpText}>{t('gesture.hold.help')}</Text>
      )}
    </View>
  );
}

function PinchZoomInPractice() {
  const [completed, setCompleted] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const dotSpread = useRef(new Animated.Value(0)).current;

  const isTrackingRef = useRef(false);
  const initialDistanceRef = useRef<number | null>(null);
  const containerRef = useRef<View>(null);
  const completedRef = useRef(false);

  const { t } = useLanguage();
  completedRef.current = completed;

  // Outward finger dot demo animation
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

  // Robust Native Web DOM Multi-Touch Layer for Android Chrome & iOS Safari
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const element = containerRef.current as unknown as HTMLElement | null;
    if (!element) return;

    element.style.setProperty('touch-action', 'none');
    element.style.setProperty('overscroll-behavior', 'contain');
    element.style.setProperty('-webkit-user-select', 'none');
    element.style.setProperty('-webkit-touch-callout', 'none');
    element.style.setProperty('user-select', 'none');

    // Safari-only extra protection (causes no harm on Android Chrome)
    const preventDocGesture = (e: any) => {
      if (isTrackingRef.current && e.cancelable) {
        e.preventDefault();
      }
    };

    const cleanupDocListeners = () => {
      isTrackingRef.current = false;
      initialDistanceRef.current = null;
      document.removeEventListener('touchmove', handleDocTouchMove, { capture: true } as any);
      document.removeEventListener('touchend', handleDocTouchEnd, { capture: true } as any);
      document.removeEventListener('touchcancel', handleDocTouchEnd, { capture: true } as any);
      document.removeEventListener('gesturestart', preventDocGesture, { capture: true } as any);
      document.removeEventListener('gesturechange', preventDocGesture, { capture: true } as any);
      document.removeEventListener('gestureend', preventDocGesture, { capture: true } as any);
    };

    // Universal W3C multi-touch move handler (Android Chrome + iOS Safari)
    const handleDocTouchMove = (e: TouchEvent) => {
      if (!isTrackingRef.current || completedRef.current) return;
      if (e.cancelable) e.preventDefault();

      if (e.touches.length >= 2 && initialDistanceRef.current) {
        const [t1, t2] = [e.touches[0], e.touches[1]];
        const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const ratio = currentDist / initialDistanceRef.current;
        const delta = currentDist - initialDistanceRef.current;

        scale.setValue(Math.min(1.4, Math.max(1, ratio)));

        // ~8-10% or at least 14-16px outward distance increase accepted as success
        if (ratio >= 1.09 || delta >= 15) {
          setCompleted(true);
          Animated.sequence([
            Animated.timing(scale, { toValue: 1.32, duration: 180, useNativeDriver: true }),
            Animated.spring(scale, { toValue: 1.25, useNativeDriver: true }),
          ]).start();
          cleanupDocListeners();
        }
      }
    };

    const handleDocTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        cleanupDocListeners();
        if (!completedRef.current) {
          Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
        }
      }
    };

    const handleContainerTouchStart = (e: TouchEvent) => {
      if (completedRef.current) return;
      if (e.touches.length >= 2) {
        if (e.cancelable) e.preventDefault();
        const [t1, t2] = [e.touches[0], e.touches[1]];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        if (dist > 15) {
          initialDistanceRef.current = dist;
          isTrackingRef.current = true;

          document.addEventListener('touchmove', handleDocTouchMove, { passive: false, capture: true });
          document.addEventListener('touchend', handleDocTouchEnd, { passive: false, capture: true });
          document.addEventListener('touchcancel', handleDocTouchEnd, { passive: false, capture: true });
          document.addEventListener('gesturestart', preventDocGesture, { passive: false, capture: true });
          document.addEventListener('gesturechange', preventDocGesture, { passive: false, capture: true });
          document.addEventListener('gestureend', preventDocGesture, { passive: false, capture: true });
        }
      }
    };

    element.addEventListener('touchstart', handleContainerTouchStart, { passive: false, capture: true });

    return () => {
      element.removeEventListener('touchstart', handleContainerTouchStart, { capture: true } as any);
      cleanupDocListeners();
    };
  }, []);

  const handleRetry = () => {
    setCompleted(false);
    initialDistanceRef.current = null;
    isTrackingRef.current = false;
    scale.setValue(1);
  };

  return (
    <View>
      <Text selectable={false} style={styles.practiceTitle}>{t('gesture.pinchZoomIn.title')}</Text>
      <Text selectable={false} style={styles.practiceDescription}>{t('gesture.pinchZoomIn.description')}</Text>
      <View
        ref={containerRef}
        style={styles.pinchContainer}
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
          <Text allowFontScaling={false} selectable={false} style={styles.pinchSymbol}>{completed ? '✓' : '⤢'}</Text>
          <Text selectable={false} style={styles.pinchLabel}>
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
                <Text allowFontScaling={false} selectable={false} style={styles.dotText}>👈</Text>
              </Animated.View>
              <Text allowFontScaling={false} selectable={false} style={styles.dotsCenterArrow}>⇦ ⇨</Text>
              <Animated.View
                style={[
                  styles.fingerDot,
                  { transform: [{ translateX: dotSpread }] },
                ]}
              >
                <Text allowFontScaling={false} selectable={false} style={styles.dotText}>👉</Text>
              </Animated.View>
            </View>
          ) : null}
        </Animated.View>
      </View>
      {completed ? (
        <SuccessMessage onRetry={handleRetry}>{t('gesture.pinchZoomIn.success')}</SuccessMessage>
      ) : (
        <Text selectable={false} style={styles.helpText}>{t('gesture.pinchZoomIn.help')}</Text>
      )}
    </View>
  );
}

function PinchZoomOutPractice() {
  const [completed, setCompleted] = useState(false);
  const scale = useRef(new Animated.Value(1.25)).current;
  const dotPinch = useRef(new Animated.Value(24)).current;

  const isTrackingRef = useRef(false);
  const initialDistanceRef = useRef<number | null>(null);
  const containerRef = useRef<View>(null);
  const completedRef = useRef(false);

  const { t } = useLanguage();
  completedRef.current = completed;

  // Inward finger dot demo animation
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

  // Robust Native Web DOM Multi-Touch Layer for Android Chrome & iOS Safari
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const element = containerRef.current as unknown as HTMLElement | null;
    if (!element) return;

    element.style.setProperty('touch-action', 'none');
    element.style.setProperty('overscroll-behavior', 'contain');
    element.style.setProperty('-webkit-user-select', 'none');
    element.style.setProperty('-webkit-touch-callout', 'none');
    element.style.setProperty('user-select', 'none');

    // Safari-only extra protection
    const preventDocGesture = (e: any) => {
      if (isTrackingRef.current && e.cancelable) {
        e.preventDefault();
      }
    };

    const cleanupDocListeners = () => {
      isTrackingRef.current = false;
      initialDistanceRef.current = null;
      document.removeEventListener('touchmove', handleDocTouchMove, { capture: true } as any);
      document.removeEventListener('touchend', handleDocTouchEnd, { capture: true } as any);
      document.removeEventListener('touchcancel', handleDocTouchEnd, { capture: true } as any);
      document.removeEventListener('gesturestart', preventDocGesture, { capture: true } as any);
      document.removeEventListener('gesturechange', preventDocGesture, { capture: true } as any);
      document.removeEventListener('gestureend', preventDocGesture, { capture: true } as any);
    };

    // Universal W3C multi-touch move handler (Android Chrome + iOS Safari)
    const handleDocTouchMove = (e: TouchEvent) => {
      if (!isTrackingRef.current || completedRef.current) return;
      if (e.cancelable) e.preventDefault();

      if (e.touches.length >= 2 && initialDistanceRef.current) {
        const [t1, t2] = [e.touches[0], e.touches[1]];
        const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const ratio = currentDist / initialDistanceRef.current;
        const delta = initialDistanceRef.current - currentDist;

        const targetScale = Math.max(0.75, Math.min(1.25, 1.25 * ratio));
        scale.setValue(targetScale);

        // ~8-10% or at least 14-16px inward distance decrease accepted as success
        if (ratio <= 0.91 || delta >= 15) {
          setCompleted(true);
          Animated.sequence([
            Animated.timing(scale, { toValue: 0.82, duration: 180, useNativeDriver: true }),
            Animated.spring(scale, { toValue: 0.88, useNativeDriver: true }),
          ]).start();
          cleanupDocListeners();
        }
      }
    };

    const handleDocTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        cleanupDocListeners();
        if (!completedRef.current) {
          Animated.spring(scale, { toValue: 1.25, useNativeDriver: true }).start();
        }
      }
    };

    const handleContainerTouchStart = (e: TouchEvent) => {
      if (completedRef.current) return;
      if (e.touches.length >= 2) {
        if (e.cancelable) e.preventDefault();
        const [t1, t2] = [e.touches[0], e.touches[1]];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        if (dist > 15) {
          initialDistanceRef.current = dist;
          isTrackingRef.current = true;

          document.addEventListener('touchmove', handleDocTouchMove, { passive: false, capture: true });
          document.addEventListener('touchend', handleDocTouchEnd, { passive: false, capture: true });
          document.addEventListener('touchcancel', handleDocTouchEnd, { passive: false, capture: true });
          document.addEventListener('gesturestart', preventDocGesture, { passive: false, capture: true });
          document.addEventListener('gesturechange', preventDocGesture, { passive: false, capture: true });
          document.addEventListener('gestureend', preventDocGesture, { passive: false, capture: true });
        }
      }
    };

    element.addEventListener('touchstart', handleContainerTouchStart, { passive: false, capture: true });

    return () => {
      element.removeEventListener('touchstart', handleContainerTouchStart, { capture: true } as any);
      cleanupDocListeners();
    };
  }, []);

  const handleRetry = () => {
    setCompleted(false);
    initialDistanceRef.current = null;
    isTrackingRef.current = false;
    scale.setValue(1.25);
  };

  return (
    <View>
      <Text selectable={false} style={styles.practiceTitle}>{t('gesture.pinchZoomOut.title')}</Text>
      <Text selectable={false} style={styles.practiceDescription}>{t('gesture.pinchZoomOut.description')}</Text>
      <View
        ref={containerRef}
        style={styles.pinchContainer}
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
          <Text allowFontScaling={false} selectable={false} style={styles.pinchSymbol}>{completed ? '✓' : '⤡'}</Text>
          <Text selectable={false} style={styles.pinchLabel}>
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
                <Text allowFontScaling={false} selectable={false} style={styles.dotText}>👉</Text>
              </Animated.View>
              <Text allowFontScaling={false} selectable={false} style={styles.dotsCenterArrow}>⇨ ⇦</Text>
              <Animated.View
                style={[
                  styles.fingerDot,
                  { transform: [{ translateX: Animated.multiply(dotPinch, -1) }] },
                ]}
              >
                <Text allowFontScaling={false} selectable={false} style={styles.dotText}>👈</Text>
              </Animated.View>
            </View>
          ) : null}
        </Animated.View>
      </View>
      {completed ? (
        <SuccessMessage onRetry={handleRetry}>{t('gesture.pinchZoomOut.success')}</SuccessMessage>
      ) : (
        <Text selectable={false} style={styles.helpText}>{t('gesture.pinchZoomOut.help')}</Text>
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
            <Text allowFontScaling={false} selectable={false} style={styles.completedIcon}>✓</Text>
          </View>
          <Text selectable={false} style={styles.completedTitle} accessibilityRole="header">
            {t('gesture.completedTitle')}
          </Text>
          <Text selectable={false} style={styles.completedText}>
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
          <Text selectable={false} style={styles.stepProgressNumber}>
            {t('gesture.progressTitle', {
              current: currentStepIndex + 1,
              total: totalSteps,
              name: t(currentStep.nameKey),
            })}
          </Text>
          <Text allowFontScaling={false} selectable={false} style={styles.stepSymbolBadge}>
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
  practiceArea: {
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
  },
  tapTarget: { width: 172, minHeight: 138, borderRadius: radius.lg, backgroundColor: colors.coral, borderWidth: 4, borderColor: colors.coralSoft, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  doubleTapTarget: { width: 184, minHeight: 144, borderRadius: radius.lg, backgroundColor: colors.coral, borderWidth: 4, borderColor: colors.coralSoft, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  doubleTapFirstActive: { borderColor: colors.goldSoft, backgroundColor: colors.gold },
  stepBadge: { marginTop: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.round, backgroundColor: 'rgba(0,0,0,0.3)' },
  stepBadgeText: { color: colors.surface, fontSize: 16, fontWeight: '900' },
  holdArea: {
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    userSelect: 'none',
  },
  holdTarget: {
    width: '90%',
    maxWidth: 240,
    minHeight: 180,
    borderRadius: radius.lg,
    backgroundColor: colors.blue,
    borderWidth: 4,
    borderColor: colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    userSelect: 'none',
  },
  targetPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  targetCompleted: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  tapSymbol: { color: colors.surface, fontSize: 38, lineHeight: 46 },
  doubleTapSymbol: { color: colors.surface, fontSize: 34, lineHeight: 42, fontWeight: '900' },
  holdSymbol: { color: colors.surface, fontSize: 36, lineHeight: 44 },
  targetLabel: { color: colors.surface, fontSize: 20, lineHeight: 27, fontWeight: '900', textAlign: 'center' },
  helpText: { color: colors.text, fontSize: 18, lineHeight: 25, fontWeight: '700', textAlign: 'center', marginTop: spacing.xs },
  stepFeedbackText: { color: colors.primary, fontSize: 18, lineHeight: 25, fontWeight: '900', textAlign: 'center', marginTop: spacing.xs },
  warningGuideText: { color: colors.coral, fontSize: 18, lineHeight: 25, fontWeight: '800', textAlign: 'center', marginTop: spacing.xs },
  successWrapper: { gap: spacing.xs, marginTop: spacing.xs },
  success: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.goldSoft },
  successMark: { width: 34, height: 34, borderRadius: 17, color: colors.surface, backgroundColor: colors.primary, fontSize: 20, lineHeight: 34, fontWeight: '900', textAlign: 'center' },
  successText: { flex: 1, color: colors.text, fontSize: 19, lineHeight: 26, fontWeight: '800' },
  retryButton: { marginTop: spacing.xs },
  swipeArea: { minHeight: 200, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' },
  swipeCard: { width: 155, minHeight: 118, borderRadius: radius.lg, backgroundColor: colors.blue, borderWidth: 4, borderColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center', padding: spacing.md, zIndex: 2 },
  swipeSymbol: { color: colors.surface, fontSize: 34, lineHeight: 40 },
  swipeLabel: { color: colors.surface, fontSize: 19, lineHeight: 26, fontWeight: '900', textAlign: 'center' },
  edgeArrow: { color: colors.primary, fontSize: 46, fontWeight: '600' },
  movingArrow: { position: 'absolute', bottom: 4, alignSelf: 'center', left: '44%', color: colors.coral, fontSize: 28, fontWeight: '900' },
  verticalSwipeArea: {
    minHeight: 280,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    userSelect: 'none',
  },
  verticalSwipeCard: { width: '88%', maxWidth: 230, minHeight: 120, borderRadius: radius.lg, backgroundColor: colors.blue, borderWidth: 4, borderColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center', padding: spacing.md, zIndex: 2 },
  verticalBigArrow: { fontSize: 36, lineHeight: 40, fontWeight: '900' },
  arrowActive: { color: colors.coral, opacity: 1 },
  arrowInactive: { color: colors.primary, opacity: 0.3 },
  progressTrack: { width: '85%', height: 10, overflow: 'hidden', borderRadius: radius.round, backgroundColor: 'rgba(255,255,255,0.42)', marginTop: spacing.sm },
  progressFill: { height: '100%', borderRadius: radius.round, backgroundColor: colors.goldSoft },
  pinchContainer: {
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    overflow: 'hidden',
    userSelect: 'none',
  },
  pinchCard: { width: 185, minHeight: 175, borderRadius: radius.lg, backgroundColor: colors.blue, borderWidth: 4, borderColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  pinchCardLarge: { width: 195, minHeight: 185 },
  pinchSymbol: { color: colors.surface, fontSize: 38, lineHeight: 46, fontWeight: '900' },
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
