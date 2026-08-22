# Pine Tree — Growth Integration Bundle

**Bundle version:** `1.0.0-growth-handoff`  
**Entrypoint:** `src/index.ts`  
**Target:** The future native iOS and Android Growth application.  
**Included:** Native module source, production visual assets, the native haptic contract, and deferred native-audio requirements.  
**Excluded:** The browser review, HTML/CSS/JS scaffolding, generated ambience experiments, browser-only controls, and test-server files.

> This bundle is a portable native feature module. Growth owns navigation, eligibility, persistence, global preferences, safe areas, and its own right-side menu. Pine Tree owns only the selected day’s ritual surface and emits semantic lifecycle events back to Growth.

## 1. Bundle contents

| Path | Role |
|---|---|
| `src/index.ts` | Public module exports. |
| `src/PineTreePracticeScreen.tsx` | Native React Native screen shell with the day image, overlay, touch surface, lifecycle props, and completion callback. |
| `src/pine-simulation.ts` | Deterministic, platform-neutral nine-day interaction and completion engine. |
| `src/pine-day-config.ts` | Canonical Day 1–9 content and gesture configuration. |
| `src/PineNativeTouchController.ts` | Native touch normalization into independent contact records. |
| `src/PineAudioHaptics.ts` | Semantic native haptic adapter. It performs real system haptics on iOS and Android and safely no-ops on web. |
| `src/PineTreeRenderer.tsx` | GLView lifecycle seam for the future higher-fidelity native material renderer. |
| `assets/` | Pine-specific portrait scenes and needed visual overlays. The Day 2 bundle asset already uses the corrected root endpoint. |
| `docs/PINE_NATIVE_HAPTIC_CONTRACT.md` | Exact physical-feedback intent map for native implementation. |
| `docs/PINE_NATIVE_AUDIO_TODO.md` | Deferred licensed-field-recording plan. No audio assets are currently included. |

## 2. Install into Growth

1. Copy the entire `growth-bundle/` directory into the Growth source tree, for example as `src/features/pine-tree/`.
2. Preserve the relative `src/` and `assets/` layout; the practice screen resolves its scenes through local React Native `require()` calls.
3. In the actual Growth SDK context, install the required Expo-compatible packages:

```bash
npx expo install expo-gl expo-haptics react-native-gesture-handler
```

4. Add a Growth-owned route or screen that imports the module entrypoint:

```tsx
import { PineTreePracticeScreen } from '@/features/pine-tree/src';
```

5. Supply Growth-owned active-day, completion, preference, persistence, menu, and exit behavior through the props below.

## 3. Parent contract

```tsx
<PineTreePracticeScreen
  isActive={routeIsFocused}
  activeDay={pineJourney.activeDay}
  completedDays={pineJourney.completedDays}
  soundEnabled={growthPreferences.soundEnabled}
  reducedMotion={growthPreferences.reducedMotion}
  hapticLevel={growthPreferences.hapticLevel}
  onFirstMeaningfulTouch={() => analytics.track('pine_touch_started')}
  onDayComplete={(day) => completePineDay(day)}
  onRecenterRequest={() => openGrowthJourneyMenu()}
  onSoundStateChange={(enabled) => setGrowthSoundPreference(enabled)}
  onExitRequest={() => navigation.goBack()}
/>
```

The Growth application remains the source of truth for this durable state:

```ts
type PineJourneyRecord = {
  version: 1;
  activeDay: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  completedDays: Array<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>;
  completedAtByDay: Partial<Record<number, string>>;
  lastCompletedLocalDate?: string;
};
```

## 4. Required native parity

The browser review is the approved visual and interaction reference. The native Growth implementation must preserve these product decisions:

| Area | Required behavior |
|---|---|
| Journey | The complete, non-negotiable Day 1 seed-to-Day 9 mature-pine progression. |
| First encounter | Forest-led only. Do not introduce Personal Story, journaling, or personal data capture. |
| Opening sequence | Day 1 retains the veil and intention reflection. Days 2–9 open with title, purpose, and gold contemplation; the practical instruction appears after Begin Practice. |
| Instructions | Keep post-Begin guidance quiet and unobtrusive; do not place a large instruction card over the ritual focal point. |
| Completion | Trigger completion at the visible natural endpoint; do not ask for invisible extra gestures. This is particularly important for Days 3, 5, and 9. |
| Scene handoff | Preload the next scene before continuation. Hold the completed outgoing scene until the incoming image is ready; never reveal a new opening over the previous day’s photograph. |
| Day 8 | Keep the five targets in their correct locations and use subtle staggered warm guidance without turning the image into a diagram. |
| Day 9 | The forest opens through the outward gesture. At completion, show the quiet reflection and evergreen Return to the Forest guidance. |
| Sound | No continuous ambience is currently approved for shipping. Leave audio silent until a licensed or commissioned pine-wind field recording is selected. |
| Haptics | Use the supplied native haptic contract on real iOS and Android hardware. Browser vibration behavior is not a product reference. |

## 5. Native haptics

The bundle’s `PineAudioHaptics` adapter establishes the native code path. Implement or refine its semantic events according to `docs/PINE_NATIVE_HAPTIC_CONTRACT.md` and test them on physical iOS and Android devices.

The parent should offer a single global preference with `off`, `subtle`, and `on` modes. On physical devices, haptic events should happen only at meaningful milestones—not continuously during a gesture.

## 6. Deferred native audio

Do **not** restore any previously generated flute, piano, pad, or ambient-music clips. The accepted future direction is a licensed or commissioned, genuinely non-musical pine-wind field recording: quiet, deep, slow, and naturally ebbing without foreground instruments. See `docs/PINE_NATIVE_AUDIO_TODO.md`.

## 7. Validation before release

Validate on a physical iPhone and Android device before releasing the feature:

- All nine direct touch rituals and their accessible guided alternatives.
- Continuation image preloading and all eight day-to-day handoffs.
- Day 3 brush completion, Day 5 coil endpoint, and Day 9 visible forest-open completion.
- Multi-touch, cancellation, background/resume, safe-area layouts, and reduced motion.
- Haptic intensity in `off`, `subtle`, and `on` modes.
- GPU/GLView cleanup and low-quality fallback behavior.

## 8. Current implementation boundary

This bundle is ready to be copied into Growth as the module’s canonical content, simulation, native screen shell, scene assets, and sensory contracts. `PineTreeRenderer` intentionally remains a renderer seam: it manages the GLView lifecycle, while final production-grade native soil, root, bark, bough, mist, and tree-material rendering must be completed within the Growth app and validated on physical devices.

The browser review is retained in the repository only as a visual reference; it is not part of this bundle and should not be embedded into Growth.
