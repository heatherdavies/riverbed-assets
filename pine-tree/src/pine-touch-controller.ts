import type { ContactPhase, PineContact } from './pine-types';

type PointerLike = {
  pointerId: number;
  clientX: number;
  clientY: number;
  pressure?: number;
  width?: number;
  height?: number;
  timeStamp: number;
};

type PreviousContact = Omit<PineContact, 'phase'>;

/**
 * Browser implementation of the shared touch contract. An Expo Gesture Handler adapter can
 * use the same per-contact map and call `emitNativeContact` with normalised native data.
 */
export class PineTouchController {
  private active = new Map<number, PreviousContact>();

  public fromPointer(
    event: PointerLike,
    phase: ContactPhase,
    bounds: { left: number; top: number; width: number; height: number },
  ): PineContact {
    const now = Number.isFinite(event.timeStamp) ? event.timeStamp : performance.now();
    const x = this.normalise(event.clientX, bounds.left, bounds.width);
    const y = this.normalise(event.clientY, bounds.top, bounds.height);
    const previous = this.active.get(event.pointerId);
    const previousX = previous?.x ?? x;
    const previousY = previous?.y ?? y;
    const elapsed = previous ? Math.max(1, now - previous.timestampMs) : 1;
    const durationMs = previous ? previous.durationMs + elapsed : 0;

    const contact: PineContact = {
      id: event.pointerId,
      phase,
      x,
      y,
      previousX,
      previousY,
      velocityX: (x - previousX) / elapsed * 1000,
      velocityY: (y - previousY) / elapsed * 1000,
      durationMs,
      radius: this.radius(event),
      pressure: typeof event.pressure === 'number' && event.pressure > 0 ? event.pressure : undefined,
      timestampMs: now,
    };

    if (phase === 'end' || phase === 'cancel') {
      this.active.delete(event.pointerId);
    } else {
      const { phase: _phase, ...stored } = contact;
      this.active.set(event.pointerId, stored);
    }

    return contact;
  }

  public clear(): void {
    this.active.clear();
  }

  private normalise(value: number, start: number, length: number): number {
    if (!length) return 0;
    return Math.max(0, Math.min(1, (value - start) / length));
  }

  private radius(event: PointerLike): number | undefined {
    const width = Number(event.width);
    const height = Number(event.height);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return undefined;
    return (width + height) / 4;
  }
}
