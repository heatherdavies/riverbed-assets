# Vertical Inlet Flow Experiment

## Purpose

This isolated experiment starts from the saved **Angled Intersecting Flow Experiment** checkpoint and tests a more organic, clearly top-to-bottom current. It intentionally leaves both the saved base checkpoint and the repository `main` branch unchanged.

## Current model

Instead of synthesizing wave activity everywhere on the surface, the experiment schedules small, varied local impulses at `y = 0.988` in the live simulation buffer. The display samples only the interior `y = 0.036–0.964` interval, so this input occurs above the visible water field. The same height-and-velocity ping-pong solver transports the resulting wavelets straight downward at a low rate, allowing them to form and intersect naturally before they leave through a softly absorbing lower boundary.

The individual impulses reuse Flow’s existing drop queue, which is why their behavior resembles locally created touch waves rather than a scrolling or repeated graphic layer.

## Preserved rendering contract

| Requirement | Status |
|---|---|
| Stationary riverbed image | Preserved; bed sampling retains the original display coordinates. |
| Live height-and-velocity ping-pong simulation | Preserved; every wavelet is generated and propagated in the live state. |
| Current read texture rebound to the display material every frame | Preserved. |
| Height-driven refraction, fine ripples, and glints | Preserved. |
| No scrolling texture, animated background, or topographic line treatment | Preserved. |
| Angled Intersecting Flow base checkpoint | Untouched at `angled-intersecting-flow-experiment`. |
| Current `main` branch | Untouched. |

## Reproduction sequence

Apply the following scripts, in order, to the saved Angled Intersecting Flow baseline:

```text
scripts/patch-vertical-inlet-intersecting-flow.js
scripts/patch-varied-top-inlet.js
scripts/tune-varied-top-inlet.js
```

This remains an experiment for visual comparison and should be promoted only if explicitly selected.
