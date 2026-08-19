# Pine Tree Browser Review — Initial Verification Notes

- The local review route loaded successfully at `/web/` with the Day 1 photorealistic seed scene, woodland overlay, nine-day rail, accessible guided control, sound state, and bottom-right side-panel opener.
- The Day 1 guided accessibility action advanced progress to `1`, marked Day 1 complete, and left no active contact state.
- The exposed review state after completion was `{ "day": 1, "progress": 1, "completed": [1], "contacts": 0 }`.
- This check was performed in Chromium against the local static review route on 2026-08-19.

The guided accessibility path was then exercised for all nine days. Each day reached a progress value of `1`; the final state was `{ "day": 9, "progress": 1, "completed": [1,2,3,4,5,6,7,8,9], "contacts": 0 }`. This confirms that the complete nine-day configuration is reachable and records completion without stale active contacts.

A synthetic direct pointer drag on Day 2 did not advance progress, while the guided route remained valid. No browser runtime exception was recorded. The review interaction handler will be adjusted so that pointer events dispatched on the scene itself are accepted reliably, while preserving the rule that controls do not pass their touches into the scene.

After the safe pointer-capture adjustment and page reload, a direct Day 2 downward drag advanced progress to `1`, recorded Day 2 complete, and cleared contacts. The verified state was `{ "day": 2, "progress": 1, "completed": [2], "contacts": 0 }`.

The Day 7 canopy ritual was tested with two synthetic active pointers. The review state reported `contacts: 2` with independent accumulated progress, then reported `contacts: 0` after both pointers released. This verifies that the browser review does not collapse active touches into a single centroid or leave contact state behind on release.

A stationary Day 2 touch produced `progress: 0` and cleared its contact state on release, confirming that a tap does not inherit a prior drag direction. The in-panel Reduced motion control also changed from `OFF` to `ON` successfully during browser validation.

The Day 9 mature pine scene loaded correctly with the intended misted woodland landscape, same review controls, final-day instructional copy, and the side-panel journey context. The high-level visual progression from Day 1 macro soil through Day 9 forest scale is therefore represented in the browser review route.

The Day 1 review scene was revalidated after conversion to WebP. The browser decoded `day-01-rooting-the-seed.webp` successfully at `1080 × 1920`, confirming that the mobile-optimised production asset is served by the review route.

## Day 1 target-clarity correction

The Day 1 review now has a non-interactive, gilt-ring cue centred over the visible seed, labelled `TOUCH THE SEED`. The copy block was moved lower and tightened so it does not occupy the seed’s touch zone. Browser validation confirmed that the cue is `flex`/visible for Day 1 and `none`/hidden for Day 2, so the correction is limited to the affected ritual.

## Day 1 introduction-panel redesign

The revised Day 1 browser screen places `DAY 01 · GROUNDING & ANCHORING` above the nine-day rail, outside the seed scene. The title, intent, and instruction now appear in a compact upper introduction panel with a `BEGIN WITH THE SEED` dismissal control. Browser validation confirmed that dismissing the panel leaves only the stage label, day rail, seed cue, and control button over an otherwise open soil scene; the seed is no longer covered by persistent copy.

The revised Day 1 tactile sequence was also verified after dismissal. A direct 3.3-second hold at the seed’s visible target reached `progress: 1`, completed Day 1, and left no active contacts. Moving to Day 2 and returning to Day 1 restored the introduction panel, so the opening context remains available whenever the first ritual is revisited.

## Responsive seed anchor and dismissal hardening

The Day 1 cue now derives its position from the rendered image’s actual `object-fit: cover` crop rather than a fixed viewport percentage. The intrinsic seed anchor was calibrated against the full image and verified in the public review to centre the cue on the visible seed. The introduction control now listens for click, pointer-up, and touch-end; public browser validation confirmed that `BEGIN WITH THE SEED` dismisses the panel and leaves the seed scene open.

## Mobile long-press hardening

The scene image is now non-draggable and non-selectable, while the scene suppresses cancelable context-menu, selection, drag, touch-start, and touch-move events outside controls. Browser validation confirmed that scene-level context-menu and touch-start events are prevented, whereas the introduction button’s touch-start remains unblocked. This preserves standard button interaction while preventing the scene from yielding to native long-press save/selection behaviour.

## Stationary hold progression

A Day 1 hold was tested without any pointer movement. At 1.7 seconds, the ritual had reached `progress: 0.527` with one active contact. At 3.5 seconds, it reached `progress: 1`, marked Day 1 complete, and clearing the pointer left zero active contacts. The ritual therefore advances from elapsed hold time, not movement.

## Day 1 visible completion

After a 3.4-second stationary Day 1 hold, the review reached `progress: 1`, persisted Day 1 as complete, and activated the dedicated completion state. The completion panel had active pointer events and includes a continuation control for Day 2. Its opacity was transitioning in at the instant of the automated check, as intended by the calm entrance animation.

The completed Day 1 panel was visually inspected after its entrance animation: it presents `Rooted.`, retains an open view of the settled seed, and gives a clear `CONTINUE TO DEEP ANCHOR` action. Activating that control opened Day 2, updated the journey status to `02 / 09`, and correctly retained Day 1’s completed mark.

## Persistent Day 1 completion restoration

Validation was run for a fresh review reset, a newly completed stationary hold, and navigation away from and back to Day 1. The fresh state correctly had no saved completion; the completed state reached `progress: 1`; and returning to Day 1 restored `progress: 1` with the Day 1 completion state rather than leaving a bare completed bar. The completion panel’s visual transition was still in progress at the instant of automated state sampling and was queued for a settled-state check.

A settled-state check confirmed that resetting the review removes the completion class, hides the Day 1 completion panel, and restores the introduction panel. A separate completed-and-revisited check confirmed that returning to Day 1 restores `progress: 1`, the `day-one-complete` scene class, full completion-panel opacity, and enabled continuation controls.

## Return-to-Day-1 navigation finding

The existing lower-right Journey control and Day 1 rail dot can navigate between rituals in the review, but neither is sufficiently explicit after the Day 1 completion flow. A direct in-context return control is required on later days so a mobile user is not dependent on small rail dots or the side panel to revisit the seed.

## Direct mobile return path and robust controls

The hardened completion control successfully opened Day 2. Day 2 now displays a clearly labeled `← RETURN TO ROOTING THE SEED` action beneath the guided gesture control, providing an explicit return path without relying on the small day rail or side-panel trigger.

The explicit return-to-seed control was activated from Day 2 and restored Day 1’s rooted completion state. A direct `pointerup` validation confirmed that the action reaches Day 1 and restores the expected completion response without depending on a synthesized browser click.
