import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ImageBackground,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { PineAudioHaptics } from './PineAudioHaptics';
import { PineNativeTouchController } from './PineNativeTouchController';
import { PINE_DAY_CONFIG } from './pine-day-config';
import { PineTreeRenderer } from './PineTreeRenderer';
import { PineSimulation } from './pine-simulation';
import type { PineDay, PineSimulationSnapshot, PineTreePracticeProps } from './pine-types';

const dayImages: Record<PineDay, number> = {
  1: require('../assets/day-01-rooting-the-seed.webp'),
  2: require('../assets/day-02-deep-anchor.webp'),
  3: require('../assets/day-03-first-light.webp'),
  4: require('../assets/day-04-developing-trunk.webp'),
  5: require('../assets/day-05-stronger-structure.webp'),
  6: require('../assets/day-06-branching-out.webp'),
  7: require('../assets/day-07-weathering-growth.webp'),
  8: require('../assets/day-08-forming-features.webp'),
  9: require('../assets/day-09-full-maturity.webp'),
};

const initialSnapshot: PineSimulationSnapshot = {
  activeDay: 1, progress: 0, contactCount: 0, soilSettle: 0, rootDepth: 0,
  barkIndent: 0, boughTension: 0, needleMotion: 0.12, wind: 0.1, completed: false,
};

/**
 * Reusable scene surface. Growth owns navigation, day unlocking, global controls, and persistence.
 * This component owns only the active ritual and emits semantic lifecycle/completion callbacks.
 */
export function PineTreePracticeScreen({
  isActive,
  activeDay,
  completedDays,
  soundEnabled,
  reducedMotion = false,
  hapticLevel = 'subtle',
  onFirstMeaningfulTouch,
  onDayComplete,
  onRecenterRequest,
  onSoundStateChange,
  onExitRequest,
}: PineTreePracticeProps) {
  const simulation = useRef(new PineSimulation(activeDay)).current;
  const controller = useRef(new PineNativeTouchController()).current;
  const sensory = useRef(new PineAudioHaptics()).current;
  const firstTouch = useRef(false);
  const size = useRef({ width: 1, height: 1 });
  const [snapshot, setSnapshot] = useState<PineSimulationSnapshot>(initialSnapshot);
  const config = PINE_DAY_CONFIG[activeDay];
  const nativeGesture = useMemo(() => Gesture.Native(), []);

  useEffect(() => {
    simulation.setDay(activeDay);
    controller.clear();
    firstTouch.current = false;
    setSnapshot(simulation.snapshot());
  }, [activeDay, controller, simulation]);

  useEffect(() => {
    if (!isActive) {
      controller.clear();
      setSnapshot(simulation.snapshot());
      return;
    }
    let frame: number;
    let previous = Date.now();
    const tick = () => {
      const now = Date.now();
      setSnapshot(simulation.tick(now - previous, reducedMotion));
      previous = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [controller, isActive, reducedMotion, simulation]);

  useEffect(() => {
    if (snapshot.completed && !completedDays.includes(activeDay)) onDayComplete?.(activeDay);
  }, [activeDay, completedDays, onDayComplete, snapshot.completed]);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    size.current = { width: Math.max(1, width), height: Math.max(1, height) };
  };

  const submit = (event: Parameters<typeof controller.normaliseEvent>[0], phase: 'begin' | 'move' | 'end' | 'cancel') => {
    if (!isActive) return;
    controller.normaliseEvent(event, phase, size.current).forEach((contact) => simulation.submitContact(contact));
    if (!firstTouch.current && simulation.consumeFirstTouch()) {
      firstTouch.current = true;
      onFirstMeaningfulTouch?.();
    }
    void sensory.respond(config, phase === 'end' ? 'release' : 'contact', hapticLevel);
    setSnapshot(simulation.snapshot());
  };

  const useAssist = () => {
    simulation.advanceWithAssist();
    setSnapshot(simulation.snapshot());
    void sensory.respond(config, snapshot.completed ? 'completion' : 'movement', hapticLevel);
  };

  return (
    <GestureDetector gesture={nativeGesture}>
      <View style={styles.root} onLayout={onLayout}>
        <ImageBackground source={dayImages[activeDay]} resizeMode="cover" style={styles.image} imageStyle={styles.imageStyle}>
          <PineTreeRenderer snapshot={snapshot} quality="standard" isActive={isActive} style={styles.renderer} />
          <View style={styles.vignette} pointerEvents="none" />
          <View
            style={styles.touchSurface}
            onTouchStart={(event) => submit(event, 'begin')}
            onTouchMove={(event) => submit(event, 'move')}
            onTouchEnd={(event) => submit(event, 'end')}
            onTouchCancel={(event) => submit(event, 'cancel')}
          />
          <View style={styles.topOverlay} pointerEvents="box-none">
            <Pressable onPress={onExitRequest} style={styles.leafButton} accessibilityLabel="Leave Pine Tree practice">
              <Text style={styles.leafGlyph}>◜</Text>
            </Pressable>
            <Pressable onPress={() => onSoundStateChange?.(!soundEnabled)} style={styles.soundButton} accessibilityRole="switch" accessibilityState={{ checked: soundEnabled }}>
              <Text style={styles.soundText}>SOUND {soundEnabled ? 'ON' : 'OFF'}</Text>
            </Pressable>
          </View>
          {activeDay === 1 && (
            <View style={styles.seedTarget} pointerEvents="none">
              <Text style={styles.seedTargetLabel}>TOUCH THE SEED</Text>
              <View style={styles.seedTargetRing}><View style={styles.seedTargetCore} /></View>
            </View>
          )}
          <View style={[styles.copy, activeDay === 1 && styles.copyDayOne]} pointerEvents="box-none">
            <Text style={styles.eyebrow}>DAY {String(activeDay).padStart(2, '0')} · {config.stage.toUpperCase()}</Text>
            <Text style={[styles.title, activeDay === 1 && styles.titleDayOne]}>{config.title}</Text>
            <Text style={styles.intent}>{config.emotionalIntent}</Text>
            {snapshot.completed ? (
              <Text style={styles.contemplation}>{config.contemplation}</Text>
            ) : (
              <>
                <Text style={styles.instruction}>{config.instruction}</Text>
                <Pressable onPress={useAssist} style={styles.assistButton} accessibilityLabel={config.accessibilityInstruction}>
                  <Text style={styles.assistText}>GUIDED GESTURE</Text>
                </Pressable>
              </>
            )}
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.round(snapshot.progress * 100)}%` }]} /></View>
          </View>
          <Pressable onPress={onRecenterRequest} style={styles.recenterButton} accessibilityLabel="Open parent journey controls">
            <Text style={styles.recenterGlyph}>⌁</Text>
          </Pressable>
        </ImageBackground>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#061e16' },
  image: { flex: 1, justifyContent: 'flex-end' },
  imageStyle: { opacity: 0.98 },
  renderer: { opacity: Platform.OS === 'web' ? 0 : 0.03 },
  touchSurface: { ...StyleSheet.absoluteFill },
  vignette: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(2, 18, 12, 0.08)' },
  topOverlay: { position: 'absolute', top: 46, left: 24, right: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leafButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(207, 185, 112, 0.55)', backgroundColor: 'rgba(4, 30, 20, 0.76)', alignItems: 'center', justifyContent: 'center' },
  leafGlyph: { color: '#c9b268', fontSize: 30, transform: [{ rotate: '-48deg' }] },
  soundButton: { paddingVertical: 10, paddingLeft: 14 },
  soundText: { color: '#f5f0dd', fontSize: 10, fontWeight: '600', letterSpacing: 1.8 },
  copy: { paddingHorizontal: 28, paddingBottom: 46, backgroundColor: 'rgba(2, 17, 11, 0.48)' },
  copyDayOne: { paddingHorizontal: 26, paddingTop: 17, paddingBottom: 28, backgroundColor: 'rgba(2, 17, 11, 0.62)' },
  seedTarget: { position: 'absolute', top: '64%', left: '50%', transform: [{ translateX: -47 }, { translateY: -47 }], alignItems: 'center' },
  seedTargetRing: { width: 94, height: 94, borderRadius: 47, borderWidth: 1, borderColor: 'rgba(221,196,114,0.9)', backgroundColor: 'rgba(17,67,47,0.18)', alignItems: 'center', justifyContent: 'center' },
  seedTargetCore: { width: 12, height: 12, borderRadius: 6, backgroundColor: 'rgba(245,240,221,0.88)' },
  seedTargetLabel: { color: '#f5f0dd', fontSize: 9, fontWeight: '600', letterSpacing: 1.5, marginBottom: 9 },
  eyebrow: { color: '#c9b268', fontSize: 10, fontWeight: '600', letterSpacing: 1.7, marginBottom: 10 },
  title: { color: '#f5f0dd', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontSize: 50, lineHeight: 48, letterSpacing: -1.6 },
  titleDayOne: { fontSize: 44, lineHeight: 43 },
  intent: { color: 'rgba(245,240,221,0.84)', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontSize: 19, fontStyle: 'italic', marginTop: 12 },
  instruction: { color: 'rgba(245,240,221,0.76)', fontSize: 14, lineHeight: 21, marginTop: 18, maxWidth: 370 },
  contemplation: { color: '#f5f0dd', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontSize: 22, fontStyle: 'italic', lineHeight: 27, marginTop: 20, maxWidth: 370 },
  assistButton: { alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(231, 219, 168, 0.52)', backgroundColor: 'rgba(4, 31, 20, 0.62)', marginTop: 16, paddingHorizontal: 13, paddingVertical: 9 },
  assistText: { color: '#f5f0dd', fontSize: 9, fontWeight: '600', letterSpacing: 1.3 },
  progressTrack: { height: 1, marginTop: 22, backgroundColor: 'rgba(245,240,221,0.25)', width: '42%' },
  progressFill: { height: 1.5, backgroundColor: '#c9b268' },
  recenterButton: { position: 'absolute', right: 23, bottom: 23, width: 62, height: 62, borderRadius: 31, borderWidth: 1, borderColor: 'rgba(207,185,112,0.55)', backgroundColor: 'rgba(4,30,20,0.76)', alignItems: 'center', justifyContent: 'center' },
  recenterGlyph: { color: '#f5f0dd', fontSize: 30, transform: [{ rotate: '-25deg' }] },
});
