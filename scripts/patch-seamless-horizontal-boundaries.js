/*
 * Experimental branch only: remove left/right simulation boundaries while
 * retaining the hidden top inlet and lower outlet. Horizontal state sampling
 * wraps seamlessly; vertical sampling remains clamped so the current continues
 * to enter from above and leave below. The riverbed texture remains stationary.
 */
const fs = require('fs');
const path = require('path');

const bundlePath = path.resolve(__dirname, '../assets/web/assets/index-CDavGNLu.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

if (!bundle.includes('FLOW_TUNED_VARIED_TOP_INLET')) {
  throw new Error('Expected the tuned vertical inlet experiment before removing horizontal boundaries.');
}
if (bundle.includes('FLOW_SEAMLESS_HORIZONTAL_BOUNDARY_EXPERIMENT')) {
  console.log('Seamless horizontal boundary experiment is already present.');
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

const samplerTarget = String.raw`  vec4 sampleState(vec2 p) {
    vec2 grid = p / uTexel - 0.5;
    vec2 cell = floor(grid);
    vec2 fraction = fract(grid);
    vec2 a = (cell + vec2(0.5, 0.5)) * uTexel;
    vec2 b = (cell + vec2(1.5, 0.5)) * uTexel;
    vec2 c = (cell + vec2(0.5, 1.5)) * uTexel;
    vec2 d = (cell + vec2(1.5, 1.5)) * uTexel;
    vec4 ab = mix(texture2D(uPrev, a), texture2D(uPrev, b), fraction.x);
    vec4 cd = mix(texture2D(uPrev, c), texture2D(uPrev, d), fraction.x);
    return mix(ab, cd, fraction.y);
  }`;

const samplerReplacement = String.raw`  // Only the horizontal axis is periodic. A wave that reaches one side
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

const transportTarget = String.raw`    vec2 advectedUv = clamp(
      uv + uFlowStep,
      uTexel * 1.5,
      vec2(1.0) - uTexel * 1.5
    );`;
const transportReplacement = String.raw`    vec2 advectedUv = vec2(
      fract(uv.x + uFlowStep.x),
      clamp(uv.y + uFlowStep.y, uTexel.y * 1.5, 1.0 - uTexel.y * 1.5)
    );`;

bundle = replaceOnce(bundle, samplerTarget, samplerReplacement, 'bilinear live-state sampler');
bundle = replaceOnce(bundle, transportTarget, transportReplacement, 'horizontal transport boundary');
bundle += '\n/* FLOW_SEAMLESS_HORIZONTAL_BOUNDARY_EXPERIMENT */\n';
fs.writeFileSync(bundlePath, bundle);
console.log(`Applied seamless horizontal boundaries to ${bundlePath}.`);
