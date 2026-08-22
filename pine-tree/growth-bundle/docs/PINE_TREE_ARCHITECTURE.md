# Pine Rooting Experience — Architecture Lock

**Status:** Approved implementation direction.  
**Scope:** A standalone, reusable nine-day tactile practice module for eventual integration into the wider HomeFlow / Growth application. The existing Flow water sanctuary, its WebView shell, and its current scenes are not modified by this module.

## Project finding

The checked-out repository is an **Expo SDK 57 bare workflow** whose current `App.tsx` hosts a bundled browser experience inside a local static-server WebView. It does not contain Expo Router, native scene source, or an existing Growth application source tree. Therefore, the Pine Tree work is isolated in `pine-tree/` as a reviewable module and web preview. It is deliberately not wired into the water experience.

The repository’s Expo packages were synchronised to the Expo-recommended SDK 57 patch versions before module work began. The eventual integrating application should install the same module source and then choose its own route, parent overlay, and shared preferences.

## Module map

| Module | Responsibility | Parent ownership boundary |
| --- | --- | --- |
| `src/pine-types.ts` | Shared day, contact, quality, and integration types. | No navigation, storage, or visual rendering side effects. |
| `src/pine-day-config.ts` | The complete immutable Day 1–9 content configuration. | Parent may select the active day and read completion metadata. |
| `src/pine-simulation.ts` | Platform-neutral deterministic growth state, per-contact material response, wind, damped recovery, completion coverage, and quality settings. | Parent passes the active day and controls active/inactive lifecycle. |
| `src/pine-touch-controller.ts` | Native-compatible contract for independently tracked contacts. | Gesture recogniser implementation belongs to the integrating Expo screen. |
| `src/pine-audio-haptics.ts` | Semantic, optional haptic/audio event mapping. | Parent owns global sound preference and may supply its own audio engine. |
| `src/PineTreePracticeScreen.tsx` | Future Expo-native integration shell: safe overlay contract, lifecycle wiring, renderer placeholder/bridge. | The Growth parent owns route, global menu, and persistent journey state. |
| `web/` | Browser review route with the same day config and simulation behaviour. | It is a review surface, not a different product or an integration replacement. |
| `assets/` | Pine-specific assets only. | Nothing in the current Flow water assets is moved or changed. |

## Rendering strategy

The future native screen uses an Expo `GLView` as its primary 2D/3D render surface, with an overlay above it for the day label, instruction, sound status, accessibility choices, and parent-owned exit/menu controls. The initial standalone review implementation uses a browser canvas because the current repository has no Expo Router/native rendering application structure. Its `PineSimulation` contract and day data are platform neutral and are intended to be shared by a native renderer later.

The quality budget has three tiers:

| Tier | Intended device condition | Visual rule |
| --- | --- | --- |
| High | Modern phone, stable graphics frame time | Full soil/bark detail, dense near-field needles, soft depth cues, mist, and constrained particles. |
| Standard | Mid-range phone or ordinary mobile browser | Moderate needle density, reduced mist/particle count, same interaction response and core materials. |
| Low | Thermal/constrained hardware or weak browser WebGL | Further reduce background depth, particle density, and render scale; never reduce interaction correctness or day content. |

The target is responsive touch and visually stable motion under normal phone-scale use. Performance reduction must affect peripheral atmosphere before it affects soil compression, root response, trunk/bough damping, or contact correctness.

## Contact contract

Every touch is independent. A new touch cannot inherit direction from a previous touch, and the simulation never uses a combined centroid as a substitute for individual contacts.

```ts
type PineContact = {
  id: number;
  phase: 'begin' | 'move' | 'end' | 'cancel';
  x: number;
  y: number;
  previousX: number;
  previousY: number;
  velocityX: number;
  velocityY: number;
  durationMs: number;
  radius?: number;
  pressure?: number;
  timestampMs: number;
};
```

The browser review route uses pointer IDs and optional pressure. The future native Expo screen receives native touch/gesture events and normalises them into the same records. Pressure can enhance a response but never determines whether a ritual can be completed.

## Parent integration contract

The future Growth app retains product navigation, calendar/day availability, safe-area menus, shared sound preference, and persistent journey history. Pine Tree is supplied the selected day and emits completion or lifecycle events.

```ts
type PineTreePracticeProps = {
  isActive: boolean;
  activeDay: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  completedDays: number[];
  soundEnabled: boolean;
  reducedMotion?: boolean;
  hapticLevel?: 'off' | 'subtle' | 'on';
  onFirstMeaningfulTouch?: () => void;
  onDayComplete?: (day: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) => void;
  onRecenterRequest?: () => void;
  onSoundStateChange?: (enabled: boolean) => void;
  onExitRequest?: () => void;
};
```

When `isActive` changes to `false`, the renderer pauses, active contacts clear, audio stops or mutes, and no haptic remains active. GPU resources can remain while the route stays mounted but must dispose on unmount.

## Asset and sensory policy

The supplied reference imagery guides mood, framing, lighting progression, and material quality only. It is not shipped as production imagery. Any production texture, photograph, generated asset, or audio file must be original, commissioned, or accompanied by a suitable distribution licence.

Sound begins only after a user gesture. Haptics are optional, semantically mapped, and no-op safely on unsupported web or disabled devices. The standalone review version illustrates material response visually; full native audio/haptic validation occurs on physical iOS and Android hardware during integration.

## Test approach

The web review validates every day’s interaction, pointer independence, stationary contact, pressure fallback, day restoration, quality tiers, and reduced-motion behaviour. Native integration validation will additionally cover GLView rendering, gesture-handler touch delivery, iOS and Android haptic availability, lifecycle cleanup, and physical-device performance. The full handoff checklist is maintained in `PINE_TREE_HANDOFF.md`.
