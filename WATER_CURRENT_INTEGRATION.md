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

The display shader samples a stationary riverbed image and derives its response from the current height texture. It includes the reference’s amplified broad height gradient, height-phased fine directional ripples, small refraction offset, non-scrolling caustic flecks warped by the live height/slope field, and restrained glints.

It intentionally excludes animated background images, contour diagnostics, independently scrolling caustics, broad cellular patterns, and moving topographic-line treatments.

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

After reapplying a bundle patch, launch the local Flow web bundle and confirm that the stones remain stationary while small refractive distortions, fine ripples, and glints visibly evolve. Touch-drag should add a local ripple without suppressing the ambient current.
