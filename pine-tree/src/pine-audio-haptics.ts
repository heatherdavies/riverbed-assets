import type { HapticLevel, PineDayConfig } from './pine-types';

export type PineMaterialEvent = 'contact' | 'movement' | 'completion' | 'release';

/**
 * Browser review fallback. Native integration maps the same semantic events to expo-haptics
 * and expo-audio, while preserving user preference and platform capability checks.
 */
export class PineReviewSensoryEngine {
  private audioContext: AudioContext | null = null;
  private soundEnabled = false;
  private hapticLevel: HapticLevel = 'subtle';
  private lastHapticAt = 0;

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  public setHapticLevel(level: HapticLevel): void {
    this.hapticLevel = level;
  }

  public respond(day: PineDayConfig, event: PineMaterialEvent, intensity = 0.35): void {
    const bounded = Math.max(0.05, Math.min(1, intensity));
    if (this.soundEnabled) this.playMaterialTone(day, event, bounded);
    this.vibrate(day, event, bounded);
  }

  public dispose(): void {
    void this.audioContext?.close();
    this.audioContext = null;
  }

  private playMaterialTone(day: PineDayConfig, event: PineMaterialEvent, intensity: number): void {
    try {
      const Context = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Context) return;
      this.audioContext ??= new Context();
      if (this.audioContext.state === 'suspended') void this.audioContext.resume();

      const ctx = this.audioContext;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      const soil = day.material === 'soil' || day.material === 'root';
      const forest = day.material === 'canopy' || day.material === 'forest';
      const base = soil ? 54 : forest ? 260 : 122;
      const modifier = event === 'completion' ? 1.5 : event === 'release' ? 0.74 : 1;

      oscillator.type = soil ? 'sine' : forest ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(base * modifier, now);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, base * 0.78), now + 0.22);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.012 * intensity, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.3);
    } catch {
      // Sound is atmospheric enhancement only. Unsupported/blocked audio must remain silent.
    }
  }

  private vibrate(day: PineDayConfig, event: PineMaterialEvent, intensity: number): void {
    if (this.hapticLevel === 'off' || !('vibrate' in navigator)) return;
    const now = performance.now();
    if (now - this.lastHapticAt < 120 && event !== 'completion') return;
    this.lastHapticAt = now;

    const scale = this.hapticLevel === 'on' ? 1 : 0.62;
    const duration = Math.round((day.haptic === 'anchorage' ? 18 : day.haptic === 'fibre' ? 10 : 7) * scale * (0.7 + intensity));
    const pattern = event === 'completion' ? [duration + 14, 42, Math.max(8, duration)] : [Math.max(5, duration)];
    try {
      navigator.vibrate(pattern);
    } catch {
      // A visual material response remains the complete fallback.
    }
  }
}
