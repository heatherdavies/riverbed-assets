# Flow Water Current Integration

## Purpose

This integration transfers the browser-validated `current-study.js` water-current behavior into Flow’s shipped web bundle. It is designed to render **clear shallow water over a recognizable, stationary riverbed**, with motion arising only from the live height field and its visible surface response.

## Non-negotiable frame contract

The water simulation is a height-and-velocity ping-pong render-target solver. Every frame must first render `read → write`, swap the targets, and then bind the just-written read texture to the visible water material in the same frame.

```text
simulate(previousReadTexture → writeTarget)
swap(readTarget, writeTarget)
displayMaterial.uHeight = readTarget.texture
drawWater()
```

The active Flow loop retains this order. Its display material receives the simulation texture per frame through `L.uHeight.value = o.texture`, while the solver swaps `rtA` and `rtB` immediately after each simulation pass.

## Transferred solver behavior

The solver carries height in red and velocity in green. It keeps the validated finite-difference propagation and source-of-truth travelling current seed:

```glsl
v += laplacian * 0.32;
v *= 0.994;
h += v;

float ambient = sin(uv.x * 22.0 + uTime * 0.7)
              * cos(uv.y * 19.0 - uDirection * uTime * 0.55);
h += ambient * 0.00035;
```

Flow starts in the **open current** configuration. The retained containment control uses only the reference’s gentle 5% edge absorption; it does not begin with a strong calm-pool edge damping profile.

## Transferred display behavior

The display shader samples a stationary riverbed image and derives its response from the current height texture. It includes the reference’s amplified broad height gradient, a low-amplitude live rolling-wave field travelling visually from top to bottom, small height-phased ripple detail, a small refraction offset, non-scrolling caustic flecks warped by the live height/slope field, and restrained glints.

The final treatment **advects the previous height-and-velocity state downstream** on every ping-pong simulation pass. This carries real solver features—including touch ripples and the ambient current—in one direction, rather than placing a directional animation over an isotropic field. The sparse, nearly horizontal crest family is a low-amplitude reinforcement of that same transport. Its display response uses restrained broad-gradient refraction so the stationary stones remain clear instead of exposing multi-directional solver noise.

The display additionally applies a **vertical presentation overscan**: it samples only the settled central 85% of the same live height texture. The upper and lower 7.5% of the simulation are kept beyond the visible view, so the current enters the screen already formed and leaves below the frame. This crop applies only to height and normal lookups. The riverbed retains original screen coordinates and is never translated or scrolled. Lateral meander and trailing ripple layers are deliberately negligible, because competing bright crest directions make the water’s overall flow ambiguous. The crests are not an animated background layer or a scrolling texture. The display intentionally excludes animated background images, contour diagnostics, independently scrolling caustics, broad cellular patterns, and moving topographic-line treatments.

The default background is the validated natural-riverbed asset at:

```text
/backgrounds/shallow-riverbed-reference.jpg
```

## Maintenance

The repository currently contains the shipped web bundle rather than the original `client/src/water` TypeScript source. The following scripts make the integration repeatable when a fresh matching bundle is available:

| Script | Role |
|---|---|
| `scripts/patch-water-current.js` | Replaces the existing current simulation and presentation shader strings with the validated implementation and adds the required per-frame uniforms. |
| `scripts/install-reference-riverbed.js` | Copies the validated stationary riverbed asset into the web bundle and ensures the default scene uses it. |
| `scripts/patch-rolling-waves.js` | Adds restrained top-to-bottom rolling crests to the existing live height field and its height-derived display response. |
| `scripts/patch-dominant-downward-crests.js` | Strengthens the broad crest direction in the live solver and display response. |
| `scripts/patch-unidirectional-downward-flow.js` | Initial directional cleanup that removes conflicting lateral/trailing crest layers. |
| `scripts/apply-reviewed-advected-flow.js` | Final root correction: advects the live height-and-velocity state downstream and reduces isotropic refraction so the physical flow direction is readable. |
| `scripts/patch-presentation-overscan.js` | Samples the settled interior of the live height field in the display shader, hiding the top-entry and lower-outflow boundary regions without moving the riverbed. |

After reapplying a bundle patch, launch the local Flow web bundle and confirm that the stones remain stationary while top-to-bottom rolling crests, small refractive distortions, fine ripples, and glints visibly evolve. Touch-drag should add a local ripple without suppressing the ambient current.
