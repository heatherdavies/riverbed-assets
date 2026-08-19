import { getPineDayConfig } from './pine-day-config';
import type { PineContact, PineDay, PineQualityTier, PineSimulationSnapshot } from './pine-types';

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

/**
 * Platform-neutral material model. Renderers read snapshots; gesture adapters only submit
 * independent contacts. It intentionally has no navigation, storage, DOM, or GL dependency.
 */
export class PineSimulation {
  private activeDay: PineDay;
  private quality: PineQualityTier;
  private contacts = new Map<number, PineContact>();
  private progress = 0;
  private soilSettle = 0;
  private rootDepth = 0;
  private barkIndent = 0;
  private boughTension = 0;
  private needleMotion = 0.14;
  private wind = 0.1;
  private completed = false;
  private firstTouchSeen = false;

  public constructor(day: PineDay, quality: PineQualityTier = 'high') {
    this.activeDay = day;
    this.quality = quality;
  }

  public setDay(day: PineDay): void {
    this.activeDay = day;
    this.resetDay();
  }

  public setQuality(quality: PineQualityTier): void {
    this.quality = quality;
  }

  public resetDay(): void {
    this.contacts.clear();
    this.progress = 0;
    this.soilSettle = 0;
    this.rootDepth = 0;
    this.barkIndent = 0;
    this.boughTension = 0;
    this.needleMotion = 0.14;
    this.wind = 0.1;
    this.completed = false;
    this.firstTouchSeen = false;
  }

  public consumeFirstTouch(): boolean {
    const value = this.firstTouchSeen;
    this.firstTouchSeen = false;
    return value;
  }

  public submitContact(contact: PineContact): void {
    if (contact.phase === 'begin') {
      this.firstTouchSeen = true;
      this.contacts.set(contact.id, contact);
    } else if (contact.phase === 'move') {
      this.contacts.set(contact.id, contact);
    } else {
      this.contacts.delete(contact.id);
    }

    this.applyMaterialResponse(contact);
  }

  /** Accessibility alternatives send the same intention without requiring a precise gesture. */
  public advanceWithAssist(amount = 0.14): void {
    this.progress = clamp01(this.progress + amount);
    this.soilSettle = Math.max(this.soilSettle, this.progress * 0.75);
    this.rootDepth = Math.max(this.rootDepth, this.progress * 0.75);
    this.barkIndent = Math.max(this.barkIndent, this.progress * 0.35);
    this.boughTension = Math.max(this.boughTension, this.progress * 0.3);
    this.needleMotion = Math.max(this.needleMotion, 0.16 + this.progress * 0.18);
    this.maybeComplete();
  }

  public tick(deltaMs: number, reducedMotion = false): PineSimulationSnapshot {
    const dt = Math.min(Math.max(deltaMs, 0), 64) / 16.667;
    const decay = reducedMotion ? 0.08 : 0.045;
    const day = getPineDayConfig(this.activeDay);
    const sustainedHold = Array.from(this.contacts.values()).some((contact) => contact.durationMs > 480);

    this.soilSettle += (0 - this.soilSettle) * decay * dt;
    this.barkIndent += (0 - this.barkIndent) * decay * dt;
    this.boughTension += (0 - this.boughTension) * (decay * 0.58) * dt;
    this.rootDepth += (0 - this.rootDepth) * (decay * 0.2) * dt;

    const unattendedWind = reducedMotion ? 0.025 : day.light === 'mist' ? 0.13 : 0.07;
    const quietNeedles = sustainedHold && this.activeDay >= 7 ? 0.045 : unattendedWind;
    this.wind += (unattendedWind - this.wind) * 0.018 * dt;
    this.needleMotion += (quietNeedles + this.boughTension * 0.38 - this.needleMotion) * 0.06 * dt;

    return this.snapshot();
  }

  public snapshot(): PineSimulationSnapshot {
    return {
      activeDay: this.activeDay,
      progress: this.progress,
      contactCount: this.contacts.size,
      soilSettle: clamp01(this.soilSettle),
      rootDepth: clamp01(this.rootDepth),
      barkIndent: clamp01(this.barkIndent),
      boughTension: clamp01(this.boughTension),
      needleMotion: clamp01(this.needleMotion),
      wind: clamp01(this.wind),
      completed: this.completed,
    };
  }

  private applyMaterialResponse(contact: PineContact): void {
    if (contact.phase === 'cancel') return;

    const dx = contact.x - contact.previousX;
    const dy = contact.y - contact.previousY;
    const speed = Math.min(1, Math.hypot(contact.velocityX, contact.velocityY) * 0.5);
    const movement = Math.min(1, Math.hypot(dx, dy) * 3.2);
    const pressure = clamp01(contact.pressure ?? 0.4);

    switch (this.activeDay) {
      case 1: {
        const hold = clamp01(contact.durationMs / 3200);
        this.soilSettle = Math.max(this.soilSettle, hold * (0.55 + pressure * 0.35));
        this.progress = Math.max(this.progress, hold);
        break;
      }
      case 2: {
        const downward = Math.max(0, dy) + Math.max(0, contact.velocityY) * 0.015;
        this.rootDepth = clamp01(this.rootDepth + downward * 1.5);
        this.progress = Math.max(this.progress, this.rootDepth);
        break;
      }
      case 3: {
        const lateralBrush = Math.abs(dx) + Math.abs(contact.velocityX) * 0.012;
        this.soilSettle = clamp01(this.soilSettle + lateralBrush * 1.8);
        this.needleMotion = Math.max(this.needleMotion, 0.2 + movement * 0.2);
        this.progress = Math.max(this.progress, this.soilSettle);
        break;
      }
      case 4: {
        const upward = Math.max(0, -dy) + Math.max(0, -contact.velocityY) * 0.015;
        this.barkIndent = Math.max(this.barkIndent, 0.08 + pressure * 0.15);
        this.progress = clamp01(this.progress + upward * 1.45);
        break;
      }
      case 5: {
        const circularEnergy = movement + Math.min(0.14, speed * 0.1);
        this.boughTension = Math.max(this.boughTension, circularEnergy * 0.85);
        this.progress = clamp01(this.progress + circularEnergy * 0.2);
        break;
      }
      case 6: {
        const outward = Math.max(0, dx) + Math.max(0, contact.velocityX) * 0.015;
        this.boughTension = clamp01(this.boughTension + outward * 1.25);
        this.needleMotion = Math.max(this.needleMotion, 0.16 + outward * 0.45);
        this.progress = clamp01(this.progress + outward * 1.25);
        break;
      }
      case 7: {
        const brush = Math.abs(dx) + Math.abs(dy) + speed * 0.05;
        this.boughTension = Math.max(this.boughTension, brush * 0.52);
        this.wind = Math.max(this.wind, 0.08 + brush * 0.36);
        this.progress = clamp01(this.progress + brush * 0.62);
        break;
      }
      case 8: {
        if (contact.phase === 'begin') {
          this.barkIndent = Math.max(this.barkIndent, 0.22 + pressure * 0.12);
          this.progress = clamp01(this.progress + 0.16);
        }
        break;
      }
      case 9: {
        const release = Math.max(0, dx) + Math.max(0, contact.velocityX) * 0.018;
        this.boughTension = Math.max(this.boughTension, release * 0.2);
        this.progress = clamp01(this.progress + release * 1.05);
        break;
      }
    }

    this.maybeComplete();
  }

  private maybeComplete(): void {
    if (this.progress >= 0.999) {
      this.progress = 1;
      this.completed = true;
    }
  }
}
