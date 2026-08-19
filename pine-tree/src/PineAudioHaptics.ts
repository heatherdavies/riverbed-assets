import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

import type { HapticLevel, PineDayConfig } from './pine-types';

type PineMaterialEvent = 'contact' | 'movement' | 'completion' | 'release';

/** Semantic haptic adapter. Parent-owned audio may subscribe to the same events. */
export class PineAudioHaptics {
  private lastEventAt = 0;

  public async respond(day: PineDayConfig, event: PineMaterialEvent, level: HapticLevel = 'subtle'): Promise<void> {
    if (Platform.OS === 'web' || level === 'off') return;
    const now = Date.now();
    if (event !== 'completion' && now - this.lastEventAt < 125) return;
    this.lastEventAt = now;

    const emphasis = level === 'on' ? 1 : 0.62;
    try {
      if (event === 'completion') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return;
      }
      if (day.haptic === 'anchorage') {
        await Haptics.impactAsync(emphasis > 0.8 ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium);
        return;
      }
      if (day.haptic === 'fibre') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        return;
      }
      await Haptics.selectionAsync();
    } catch {
      // Haptics are enhancement only; unavailable system feedback remains a valid state.
    }
  }
}
