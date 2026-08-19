import type { GestureResponderEvent } from 'react-native';

import type { ContactPhase, PineContact } from './pine-types';

type NativeContact = {
  identifier: string | number;
  locationX: number;
  locationY: number;
  timestamp: number;
  force?: number;
};

type StoredContact = Omit<PineContact, 'phase'>;

/**
 * Expo/React Native adapter. Call this from a transparent interaction View above the GLView.
 * It intentionally reads changed touches by identifier rather than using a pan centroid.
 */
export class PineNativeTouchController {
  private readonly contacts = new Map<number, StoredContact>();

  public normaliseEvent(
    event: GestureResponderEvent,
    phase: ContactPhase,
    size: { width: number; height: number },
  ): PineContact[] {
    const nativeEvent = event.nativeEvent as typeof event.nativeEvent & { changedTouches?: NativeContact[] };
    const changed = nativeEvent.changedTouches ?? [nativeEvent as unknown as NativeContact];
    return changed.map((touch) => this.normaliseTouch(touch, phase, size));
  }

  public clear(): void {
    this.contacts.clear();
  }

  private normaliseTouch(touch: NativeContact, phase: ContactPhase, size: { width: number; height: number }): PineContact {
    const id = this.toContactId(touch.identifier);
    const previous = this.contacts.get(id);
    const timestampMs = Number.isFinite(touch.timestamp) ? touch.timestamp : Date.now();
    const x = this.clamp(touch.locationX / Math.max(1, size.width));
    const y = this.clamp(touch.locationY / Math.max(1, size.height));
    const previousX = previous?.x ?? x;
    const previousY = previous?.y ?? y;
    const elapsed = previous ? Math.max(1, timestampMs - previous.timestampMs) : 1;
    const contact: PineContact = {
      id,
      phase,
      x,
      y,
      previousX,
      previousY,
      velocityX: (x - previousX) / elapsed * 1000,
      velocityY: (y - previousY) / elapsed * 1000,
      durationMs: previous ? previous.durationMs + elapsed : 0,
      pressure: typeof touch.force === 'number' && touch.force > 0 ? this.clamp(touch.force) : undefined,
      timestampMs,
    };

    if (phase === 'end' || phase === 'cancel') {
      this.contacts.delete(id);
    } else {
      const { phase: _phase, ...stored } = contact;
      this.contacts.set(id, stored);
    }
    return contact;
  }

  private toContactId(identifier: string | number): number {
    if (typeof identifier === 'number') return identifier;
    let hash = 0;
    for (let index = 0; index < identifier.length; index += 1) hash = ((hash << 5) - hash + identifier.charCodeAt(index)) | 0;
    return Math.abs(hash);
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(1, value));
  }
}
