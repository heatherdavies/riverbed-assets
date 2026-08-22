import { useEffect, useRef } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { GLView, type ExpoWebGLRenderingContext } from 'expo-gl';

import type { PineQualityTier, PineSimulationSnapshot } from './pine-types';

type PineTreeRendererProps = {
  snapshot: PineSimulationSnapshot;
  quality: PineQualityTier;
  isActive: boolean;
  style?: ViewStyle;
};

/**
 * Native rendering seam. The integrating Growth app supplies the scene assets/materials while
 * this component owns the GL context lifecycle. The browser preview is intentionally separate.
 */
export function PineTreeRenderer({ snapshot, quality, isActive, style }: PineTreeRendererProps) {
  const glRef = useRef<ExpoWebGLRenderingContext | null>(null);
  const frameRef = useRef<number | null>(null);

  const onContextCreate = (gl: ExpoWebGLRenderingContext) => {
    glRef.current = gl;
    const render = () => {
      if (!isActive || !glRef.current) return;
      const materialEnergy = snapshot.soilSettle + snapshot.rootDepth + snapshot.barkIndent + snapshot.boughTension;
      const mist = snapshot.activeDay >= 7 ? 0.05 + snapshot.wind * 0.08 : 0;
      const qualityShade = quality === 'high' ? 1 : quality === 'standard' ? 0.92 : 0.84;
      gl.clearColor(0.024 * qualityShade + mist, 0.11 * qualityShade + materialEnergy * 0.02, 0.075 * qualityShade + mist, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.flush();
      gl.endFrameEXP();
      frameRef.current = requestAnimationFrame(render);
    };
    render();
  };

  useEffect(() => {
    if (Platform.OS === 'web' || !isActive) return;
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      glRef.current = null;
    };
  }, [isActive]);

  if (Platform.OS === 'web') return <View style={[styles.webFallback, style]} />;
  return <GLView style={[styles.gl, style]} onContextCreate={onContextCreate} />;
}

const styles = StyleSheet.create({
  gl: { ...StyleSheet.absoluteFill },
  webFallback: { ...StyleSheet.absoluteFill, backgroundColor: '#061e16' },
});
