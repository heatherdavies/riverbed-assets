# Pine Rooting Experience — Integration Handoff

**Version:** First implementation review build  
**Module location:** `pine-tree/`  
**Purpose:** A complete nine-day, seed-to-maturity Pine Tree practice that can be integrated into the future HomeFlow / Growth application without changing the current Flow water sanctuary.

> The module preserves the approved nine-day content, its photorealistic woodland visual language, and its tactile ritual sequence. It does not introduce a separate product shell, global navigation pattern, generic wellness interface, or replacement for the future parent Growth application.

## 1. Current deliverable

The repository now contains a full browser review implementation, nine original photorealistic day assets, a platform-neutral simulation, a shared independent-contact contract, native Expo integration seams, and an architecture lock. The browser review is immediately usable on phone or desktop through the temporary review URL supplied with the task result. The future Growth application can import the `src/` module pieces and supply its own route, parent-owned menu, calendar policy, and persistent state.

| Deliverable | Status | Notes |
| --- | --- | --- |
| Day 1–9 rituals | Complete in the web review | Every approved title, emotion, instruction, gesture, contemplation state, and visual stage is represented. |
| Photorealistic visual progression | Complete | Nine portrait 1080 × 1920 WebP scenes progress from macro soil to mature misted forest. |
| Browser tactile review | Complete | Pointer-aware, multi-contact visual response; nine-day rail; side panel; sound, haptic, reduced-motion, and guided-accessibility controls. |
| Shared simulation/content module | Complete | TypeScript day configuration and platform-neutral material simulation are provided. |
| Expo-native integration seam | Complete | GLView renderer seam, native touch adapter, semantic Expo Haptics adapter, and reusable practice screen are included. |
| Full native scene rendering | Integration-stage work | The current repository is a WebView-based Flow application, not the future Growth source tree. The GLView seam is ready, but final native shader/material implementation requires the future Growth route and physical-device validation. |

## 2. Module map

| File or directory | Responsibility |
| --- | --- |
| `PINE_TREE_ARCHITECTURE.md` | Architecture lock, quality tiers, touch contract, lifecycle, and parent integration ownership. |
| `src/pine-types.ts` | Shared `PineDay`, `PineContact`, `PineTreePracticeProps`, simulation snapshot, and quality types. |
| `src/pine-day-config.ts` | Immutable user-approved Day 1–9 content model. This is the canonical content configuration. |
| `src/pine-simulation.ts` | Deterministic per-day interaction, progress, material response, wind, and damped recovery. No DOM, navigation, storage, or GL dependency. |
| `src/pine-touch-controller.ts` | Browser pointer normalisation into independent `PineContact` records. |
| `src/PineNativeTouchController.ts` | React Native touch-event normalisation that tracks contact identifiers individually. |
| `src/pine-audio-haptics.ts` | Browser review sound/haptic fallback; browser audio begins only after an interaction. |
| `src/PineAudioHaptics.ts` | Semantic `expo-haptics` adapter for native integration. |
| `src/PineTreeRenderer.tsx` | Expo `GLView` lifecycle and quality seam for future native renderer implementation. |
| `src/PineTreePracticeScreen.tsx` | Reusable native overlay/interaction screen supplied by parent-owned lifecycle props. |
| `assets/` | Nine mobile-optimised photorealistic visual assets. |
| `web/` | Full standalone review route. Start at `web/index.html`. |
| `tests/browser-review-notes.md` | Recorded browser validation outcomes. |

## 3. Expo compatibility

The checked-out repository was synchronised with Expo’s recommended SDK 57 package versions, then the module-specific Expo packages were installed through Expo’s compatibility-aware installer.

| Package | Resolved version | Pine Tree role |
| --- | --- | --- |
| `expo` | `~57.0.14` | Current Expo SDK baseline. |
| `react-native` | `0.86.2` | Native screen and touch surface. |
| `expo-gl` | `~57.0.2` | Future primary native GL render surface. |
| `react-native-gesture-handler` | `~2.32.0` | Native gesture-coordination boundary. |
| `expo-audio` | `~57.0.3` | Future user-initiated audio layer. |
| `expo-haptics` | `~57.0.1` | Optional semantic native haptics. |

`npx expo install --check` completed successfully after installation. The project’s existing `App.tsx` received only a small compatibility correction: two unsupported WebView props were removed after the dependency update surfaced their type mismatch. No existing Flow water content, WebView source, water asset, or interaction scene was changed.

## 4. Parent Growth integration

The parent Growth app must own navigation, active-day eligibility, completed-day persistence, global sound preference, safe-area UI, and any bottom-right right-side menu. Pine Tree owns only the selected day’s scene and emits events to the parent.

```ts
type PineTreePracticeProps = {
  isActive: boolean;
  activeDay: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  completedDays: PineDay[];
  soundEnabled: boolean;
  reducedMotion?: boolean;
  hapticLevel?: 'off' | 'subtle' | 'on';
  onFirstMeaningfulTouch?: () => void;
  onDayComplete?: (day: PineDay) => void;
  onRecenterRequest?: () => void;
  onSoundStateChange?: (enabled: boolean) => void;
  onExitRequest?: () => void;
};
```

The recommended day policy is one completed ritual per local calendar day, with a parent-owned historical record and no penalty for a missed day. The same deterministic pine seed and journey state should be retained by the parent across Days 1–9. The current review permits direct day selection solely for testing.

## 5. Visual and asset inventory

Each asset is a portrait WebP at 1080 × 1920. The nine assets total approximately 3.5 MB, replacing the original 52 MB lossless-generation output. All composition has been retained; the conversion only changed format, resolution, and compression for mobile delivery.

| Asset | Day and visual role |
| --- | --- |
| `day-01-rooting-the-seed.webp` | Dark macro damp soil and single seed. |
| `day-02-deep-anchor.webp` | Soil cross-section and descending pale taproot. |
| `day-03-first-light.webp` | Delicate new shoot in warm sunrise. |
| `day-04-developing-trunk.webp` | Slender trunk and first needle clusters. |
| `day-05-stronger-structure.webp` | Thickening young trunk and branch whorls. |
| `day-06-branching-out.webp` | Expanding branch structure and canopy. |
| `day-07-weathering-growth.webp` | Resilient tree with slow wind and mist. |
| `day-08-forming-features.webp` | Bark, sap beads, young cones, and mist. |
| `day-09-full-maturity.webp` | Solitary mature pine in a wider misted forest clearing. |

The assets were generated as original imagery using the user’s supplied visual direction. They do not contain the user-supplied references and must not be represented as stock or third-party photographs. Before commercial release, confirm the project’s preferred asset-provenance policy and record the generated-asset approval in the release record.

## 6. Interaction, audio, haptics, and accessibility

Every input reaches the simulation through a per-contact record rather than a shared pan centroid. Each record includes stable identifier, normalised present/previous position, velocity, duration, optional radius, optional pressure, and phase. A new stationary contact begins with its own present position, so it cannot inherit a previous gesture direction.

| Day group | Gesture language | Response |
| --- | --- | --- |
| 1–3 | Press/hold, downward root drag, soft soil brushes | Soil compression, root depth, emerging shoot, quiet macro feedback. |
| 4–6 | Upward trunk trace, strengthening circle, outward branch sweep | Bark/grain cue, structural tension, needle expansion, daylight clarity. |
| 7–9 | Wind brush, individual feature touches, landscape release | Slow bough recovery, mist/needle movement, fine detail, wide forest opening. |

The browser review offers an equivalent guided control for every day. This is not a shortcut to different content; it is an accessibility alternative that reaches the same visual state and completion event. The sound toggle begins disabled. If enabled, it uses only a restrained, interaction-triggered material tone in the review build. The native adapter maps the same semantic events to optional Expo Haptics; it no-ops on web and when disabled or unavailable.

## 7. Performance and lifecycle

| Quality tier | Adjustment | Must remain unchanged |
| --- | --- | --- |
| High | Full texture detail, denser needles/mist, more atmospheric response. | Gesture correctness, daily content, and core material response. |
| Standard | Moderate peripheral density and browser canvas scale. | The same contact contracts and completion behaviour. |
| Low | Reduce distant depth, particles, mist, and render scale first. | Soil/root/trunk/bough response and accessibility route. |

When `isActive` becomes false, the integration screen clears active contacts and stops its tick loop. The parent should stop/release its audio player and dispose GPU resources when the route unmounts. The web review clears active pointers on release/cancel and keeps all route controls outside the interaction surface.

## 8. Testing completed

| Check | Result |
| --- | --- |
| TypeScript | `npx tsc --noEmit` completed with no errors. |
| Expo compatibility | `npx expo install --check` reported dependencies up to date. |
| Whitespace/error check | `git diff --check` completed with no errors. |
| Day 1 review load | Passed with photorealistic seed scene, day rail, sound control, guided gesture, and side-panel opener. |
| All nine guided rituals | Passed. Every day reached completion and recorded with no lingering contact state. |
| Direct Day 2 root drag | Passed after pointer-capture resilience fix; direct drag completed Day 2. |
| Multi-contact | Passed in review; two active contacts were independently present, then both cleared on release. |
| Stationary contact | Passed; stationary Day 2 contact recorded zero directional progress. |
| Reduced motion | Passed; control switched the review into the reduced-motion state. |
| WebP delivery | Passed; Day 1 1080 × 1920 WebP decoded in the browser review. |

## 9. Remaining integration validation

The current task environment cannot replace physical iOS and Android testing. Before a native release, validate the rendered GLView scene and all nine rituals on a physical iPhone and an Android device, including low-power behaviour, haptic availability, silent mode, background/resume, renderer disposal, actual multi-touch delivery, and standard/low quality tiers. The browser review is intentionally a visual and interaction review surface, not proof of native haptic fidelity.

## 10. Integration steps

1. Copy or retain the `pine-tree/src/` and `pine-tree/assets/` directories in the future Growth Expo repository.
2. Install the listed Expo-compatible dependencies using `npx expo install` within that repository’s actual SDK context.
3. Add an Expo Router route that renders `PineTreePracticeScreen` and provides the parent-owned props above.
4. Persist a per-user `pineJourney` object containing deterministic seed, active day, completed days, last completion date, sound/haptic/reduced-motion preferences, and version.
5. Replace the renderer seam’s first-pass clear render with the approved GL material scene, retaining the `PineSimulation` contract and the day configuration intact.
6. Mount the parent’s existing bottom-right menu/control above the scene if the broader HomeFlow app uses that pattern; do not create a competing Pine-only product shell.
7. Repeat the listed physical-device validation before release.
