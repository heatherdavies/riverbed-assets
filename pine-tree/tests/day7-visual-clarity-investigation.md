# Day 7 Visual-Clarity Investigation

## Finding

The repeated horizontal lines are an eight-stroke canvas overlay. They were added as wind streaks to imply a left-to-right brushing direction and make the canopy-motion prompt legible. They are drawn across the full scene even at rest, using a pale opacity tied to the baseline wind state, rather than appearing only in response to the gesture.

## Visual effect

On the photorealistic tree image, the eight full-width strokes compete with the needles and branches. They can read as arbitrary stripes rather than wind, making the intended interaction less clear.

## Approved correction

The user selected removal of the wind-streak overlay only. The fresh cache-busted build loaded successfully before visual inspection. Visual confirmation shows the uncluttered photorealistic tree and retains the existing `SWAY THE CANOPY` cue; the eight horizontal overlay lines are absent.

A horizontal canopy brush still advanced Day 7 progress to `0.5045` and applied the existing trunk-anchored sway transform (`translateX(1.107%) rotate(3.362deg) skewX(-0.738deg) scale(1.015)`).
