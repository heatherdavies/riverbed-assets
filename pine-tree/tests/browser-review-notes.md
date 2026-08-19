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
