# Angled Intersecting Flow Experiment

## Purpose

This branch preserves the visual character of the saved **Intersecting Flat Waves** checkpoint while testing a single, coherent, gently diagonal current direction. It is intentionally separate from both the current `main` branch and the `intersecting-flat-waves` tag.

## Implementation

The experiment starts from commit `01ee5fa` and adds a very low-strength, lower-right transport offset to the **live height-and-velocity ping-pong state**. Prior state is sampled bilinearly at that offset in every simulation pass, so existing intersecting wave structures and local touch or rain disturbances travel together rather than being replaced by a scrolling texture.

The bilinear lookup is important: it prevents the staircase-like aliasing seen in the first nearest-neighbor transport test. The diagonal rate is deliberately low—approximately `(-0.003, 0.010) × delta time` per simulation pass—so the wave geometry remains the principal visual element.

## Preserved invariants

| Requirement | Experimental status |
|---|---|
| Stationary riverbed image | Preserved; riverbed texture coordinates are unchanged. |
| Live height-and-velocity ping-pong simulation | Preserved; only the previous-state sampling position is offset. |
| Current read texture rebound to the display shader every frame | Preserved. |
| Height-driven refraction, ripples, and glints | Preserved. |
| No scrolling background or overlay texture | Preserved. |
| Original Intersecting Flat Waves checkpoint | Untouched at `intersecting-flat-waves` / `01ee5fa`. |
| Current `main` branch | Untouched. |

## Repeatable patch

The full experimental change is reproduced by:

```text
scripts/patch-smooth-angled-intersecting-flow.js
```

The experiment should remain a branch for visual comparison until explicitly chosen for promotion or further refinement.
