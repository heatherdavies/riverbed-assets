/*
 * Experimental branch only: replace periodic left/right wrapping with open,
 * absorbing side exits. A broad sponge buffer removes height and velocity as a
 * wave reaches either side, preventing both reflection and opposite-side
 * re-entry. The top source and bottom outflow remain unchanged.
 */
const fs = require('fs');
const path = require('path');

const bundlePath = path.resolve(__dirname, '../assets/web/assets/index-CDavGNLu.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

if (!bundle.includes('FLOW_SEAMLESS_HORIZONTAL_BOUNDARY_EXPERIMENT')) {
  throw new Error('Expected the seamless-side inlet experiment before opening the horizontal exits.');
}
if (bundle.includes('FLOW_OPEN_HORIZONTAL_EXIT_EXPERIMENT')) {
  console.log('Open horizontal exit experiment is already present.');
  process.exit(0);
}

function replaceOnce(source, target, replacement, label) {
  const first = source.indexOf(target);
  if (first < 0) throw new Error(`Could not locate ${label}.`);
  if (source.indexOf(target, first + target.length) >= 0) {
    throw new Error(`Located ${label} more than once.`);
  }
  return source.slice(0, first) + replacement + source.slice(first + target.length);
}

const samplerTarget = String.raw`  // Only the horizontal axis is periodic. A wave that reaches one side
  // continues at the other, preventing left/right reflection or pinning.
  // The y axis deliberately retains its inlet/outlet behavior.
  vec2 horizontalWrap(vec2 p) {
    return vec2(
      fract(p.x),
      clamp(p.y, uTexel.y * 1.5, 1.0 - uTexel.y * 1.5)
    );
  }
  vec4 sampleState(vec2 p) {
    vec2 wrapped = horizontalWrap(p);
    vec2 grid = wrapped / uTexel - 0.5;
    vec2 cell = floor(grid);
    vec2 fraction = fract(grid);
    vec2 a = horizontalWrap((cell + vec2(0.5, 0.5)) * uTexel);
    vec2 b = horizontalWrap((cell + vec2(1.5, 0.5)) * uTexel);
    vec2 c = horizontalWrap((cell + vec2(0.5, 1.5)) * uTexel);
    vec2 d = horizontalWrap((cell + vec2(1.5, 1.5)) * uTexel);
    vec4 ab = mix(texture2D(uPrev, a), texture2D(uPrev, b), fraction.x);
    vec4 cd = mix(texture2D(uPrev, c), texture2D(uPrev, d), fraction.x);
    return mix(ab, cd, fraction.y);
  }`;

const samplerReplacement = String.raw`  // State samples at the sides clamp only to the nearest valid cell. A
  // broad sponge layer below removes outgoing energy before it reaches this
  // edge, so waves leave rather than reflecting or returning from the other.
  vec2 openBoundaryUv(vec2 p) {
    return vec2(
      clamp(p.x, uTexel.x * 1.5, 1.0 - uTexel.x * 1.5),
      clamp(p.y, uTexel.y * 1.5, 1.0 - uTexel.y * 1.5)
    );
  }
  vec4 sampleState(vec2 p) {
    vec2 openUv = openBoundaryUv(p);
    vec2 grid = openUv / uTexel - 0.5;
    vec2 cell = floor(grid);
    vec2 fraction = fract(grid);
    vec2 a = openBoundaryUv((cell + vec2(0.5, 0.5)) * uTexel);
    vec2 b = openBoundaryUv((cell + vec2(1.5, 0.5)) * uTexel);
    vec2 c = openBoundaryUv((cell + vec2(0.5, 1.5)) * uTexel);
    vec2 d = openBoundaryUv((cell + vec2(1.5, 1.5)) * uTexel);
    vec4 ab = mix(texture2D(uPrev, a), texture2D(uPrev, b), fraction.x);
    vec4 cd = mix(texture2D(uPrev, c), texture2D(uPrev, d), fraction.x);
    return mix(ab, cd, fraction.y);
  }`;

const transportTarget = String.raw`    vec2 advectedUv = vec2(
      fract(uv.x + uFlowStep.x),
      clamp(uv.y + uFlowStep.y, uTexel.y * 1.5, 1.0 - uTexel.y * 1.5)
    );`;
const transportReplacement = String.raw`    vec2 advectedUv = vec2(
      clamp(uv.x + uFlowStep.x, uTexel.x * 1.5, 1.0 - uTexel.x * 1.5),
      clamp(uv.y + uFlowStep.y, uTexel.y * 1.5, 1.0 - uTexel.y * 1.5)
    );`;

const outputTarget = String.raw`    gl_FragColor = vec4(h, v, 0.0, 1.0);`;
const outputReplacement = String.raw`    // Soft open side exits: outgoing surface energy is absorbed over an 11%
    // buffer on either side. This prevents a standing edge or rebound while
    // leaving the central riverbed and vertical current visually untouched.
    float sideExit = smoothstep(0.0, 0.11, uv.x)
                   * smoothstep(0.0, 0.11, 1.0 - uv.x);
    h *= mix(0.74, 1.0, sideExit);
    v *= mix(0.58, 1.0, sideExit);
    gl_FragColor = vec4(h, v, 0.0, 1.0);`;

bundle = replaceOnce(bundle, samplerTarget, samplerReplacement, 'seamless-side sampler');
bundle = replaceOnce(bundle, transportTarget, transportReplacement, 'horizontal wrap transport');
bundle = replaceOnce(bundle, outputTarget, outputReplacement, 'open side-exit damping');
bundle += '\n/* FLOW_OPEN_HORIZONTAL_EXIT_EXPERIMENT */\n';
fs.writeFileSync(bundlePath, bundle);
console.log(`Applied open horizontal exits to ${bundlePath}.`);
