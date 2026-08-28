# Angled Intersecting Flow Experiment

The first coherent-flow test preserved the original live height-and-velocity solver and riverbed sampling, but its initial diagonal transport rate became too assertive after repeated simulation passes. The resulting frame sequence showed dense, high-contrast distortion that distracted from the shallow-river realism and made the wave intersections less graceful.

The next experimental adjustment will retain the same single lower-right transport vector but reduce its magnitude substantially. This is intended to let the original broad intersecting wave structures remain legible while giving them a shared, slow directional drift.

## Reduced-drift observation

At the reduced diagonal rate, the wave structures continue to move as a shared field, but they still become more dense and grid-like over time than the selected Intersecting Flat Waves baseline. The live-state advection itself is therefore too invasive for this visual character, even at a modest speed. The experimental direction cue should instead move only the *sampling position of the already-live height field* in the display shader while leaving the selected simulation’s evolution exactly as it was.

## Smooth low-strength transport validation

The revised test samples the existing live height-and-velocity field bilinearly at a very small upper-left offset. The two preview frames show the original intersecting, angled water structures remaining soft and fluid rather than collapsing into a dense staircase pattern. The stone bed is not translated; its visible change continues to arise only from the live height-derived refraction.
