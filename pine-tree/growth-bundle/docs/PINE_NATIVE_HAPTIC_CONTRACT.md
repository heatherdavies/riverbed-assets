# Pine Tree — Native Haptic Contract

**Status:** Proposed integration contract for the future native iOS and Android Pine Tree module.

## Purpose

The Pine Tree review is a browser-based visual and audio prototype. It is not the product runtime. Physical haptics belong to the future Expo-native iOS and Android implementation, where the same ritual milestones can be routed to the device haptics engine.

> The haptic layer must confirm meaningful change. It must never buzz continuously while a finger moves.

## Platform boundary

The native module should use `expo-haptics`. Expo provides access to the iOS Taptic Engine and Android haptic/vibration systems, while its web implementation relies on the browser Vibration API.[1]

| Runtime | Required behavior |
|---|---|
| iOS native | Use the Taptic Engine through Expo haptic calls. Respect iOS system settings and gracefully no-op when unavailable. |
| Android native | Prefer Android haptic-engine effects where available; use Expo fallbacks only when needed. |
| Browser review | Treat haptics as non-verifiable. Do not promise physical feedback in the user-facing review interface. |

## Platform-neutral intents

The simulation should emit semantic intents rather than platform-specific durations or vibration patterns.

```ts
export type PineHapticIntent =
  | 'engage'
  | 'arrival'
  | 'waypoint'
  | 'detail-discovered'
  | 'wind-crest'
  | 'completion';

export type PineHapticLevel = 'off' | 'subtle' | 'on';

export type PineHapticDriver = {
  trigger(intent: PineHapticIntent, level: PineHapticLevel): Promise<void>;
};
```

The native screen owns the driver. The shared Pine simulation or controller emits only the intent and never imports iOS, Android, Expo, or browser APIs.

## Ritual map

| Journey moment | Intent | Native response — Subtle | Native response — On |
|---|---|---|---|
| First meaningful contact on any day | `engage` | One light acknowledgement | One soft acknowledgement |
| Day 1 seed settles | `arrival` | Soft impact | Soft impact, then a faint delayed echo |
| Day 2 root reaches depth | `arrival` | Medium-soft impact | Medium-soft impact with one short settling echo |
| Day 3 visible soil is fully cleared | `arrival` | Light impact | Two very light, separated taps |
| Day 4 trunk reaches crown | `arrival` | Medium-soft impact | Soft then medium progression |
| Day 5 each coil landmark | `waypoint` | One soft selection tick | One distinct light tick, limited to four landmarks |
| Day 6 branch-growth waypoints | `waypoint` | One soft selection tick | One light tick, limited to three landmarks |
| Day 7 canopy reaches wind crest | `wind-crest` | Soft airy impact | Two soft impacts with a short pause |
| Day 8 each sap, cone, or needle detail | `detail-discovered` | One clear selection tick | Two light, close-together ticks, one per discovered detail |
| Any Day 1–8 completion | `completion` | One calm confirmation | A soft confirmation followed by a gentle success response |
| Day 9 forest fully opens | `completion` | One soft arrival, then success | Soft arrival followed by a slower two-part success response |

No pointer-move event should invoke haptics directly. The existing milestone gates—root arrival, four coil landmarks, three branch landmarks, one wind crest, five details, and completion—remain the only haptic triggers.

## Expo implementation direction

The native integration should map the intents through the Expo API rather than carrying over the browser `navigator.vibrate()` timings.

```ts
import * as Haptics from 'expo-haptics';

async function triggerPineHaptic(intent: PineHapticIntent, level: PineHapticLevel) {
  if (level === 'off') return;

  if (intent === 'engage' || intent === 'waypoint' || intent === 'detail-discovered') {
    await Haptics.selectionAsync();
    return;
  }

  if (intent === 'completion') {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return;
  }

  await Haptics.impactAsync(
    level === 'on' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Soft,
  );
}
```

Android may optionally use `performAndroidHapticsAsync()` for its soft segment and confirmation effects. iOS should use the equivalent selection, soft impact, and success calls. The implementation should not use a constant vibration pattern as a substitute for the system haptic engine.

## Accessibility and lifecycle rules

The parent HomeFlow app owns the stored haptic preference. The Pine module receives `hapticLevel` as an input and must never enable haptics automatically. Every call should harmlessly no-op when native haptics are disabled by the device, Low Power Mode, an active camera, or other system constraints.[1]

When the Pine screen becomes inactive, a gesture cancels, or the user leaves the screen, no delayed haptic may remain queued. Sound and haptics are independent preferences.

## Browser-review recommendation

Because browser haptics are not a valid indicator of the native experience on iPhone, the browser review should not present an active physical-haptics control as though it works. The cleanest review treatment is to remove the Haptics selector from the browser side panel while retaining the semantic haptic event map in the native integration contract.

## References

[1] [Expo Haptics documentation](https://docs.expo.dev/versions/latest/sdk/haptics/)
