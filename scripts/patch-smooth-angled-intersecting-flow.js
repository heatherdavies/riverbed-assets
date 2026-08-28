/*
 * Experimental branch only: smooth, coherent angled transport for the saved
 * Intersecting Flat Waves baseline.
 *
 * The actual height-and-velocity ping-pong state is sampled bilinearly at a
 * very small upstream diagonal offset. This allows the beloved intersecting
 * structures to travel together toward screen lower-right without nearest
 * sampling aliasing, scrolling the riverbed image, or adding a texture layer.
 */
const fs = require('fs');
const path = require('path');

const bundlePath = path.resolve(__dirname, '../assets/web/assets/index-CDavGNLu.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

if (!bundle.includes('FLOW_UNIDIRECTIONAL_DOWNWARD_FLOW')) {
  throw new Error('Expected the Intersecting Flat Waves baseline before applying the smooth angled-flow experiment.');
}
if (bundle.includes('FLOW_SMOOTH_ANGLED_INTERSECTING_EXPERIMENT')) {
  console.log('Smooth Angled Intersecting Flow experiment is already present.');
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

const uniformTarget = String.raw`  uniform sampler2D uPrev;
  uniform vec2 uTexel;
  uniform float uTime;`;
const uniformReplacement = String.raw`  uniform sampler2D uPrev;
  uniform vec2 uTexel;
  uniform vec2 uFlowStep;
  uniform float uTime;`;

const helperTarget = String.raw`  void main() {
    vec2 uv = vUv;`;
const helperReplacement = String.raw`  // Bilinear state reads prevent an angled sub-texel advection step from
  // creating the staircase artifacts that nearest render-target reads would
  // otherwise introduce. This remains the same live height/velocity state.
  vec4 sampleState(vec2 p) {
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
  }

  void main() {
    vec2 uv = vUv;`;

const stateTarget = String.raw`    vec4 current = texture2D(uPrev, uv);
    float h = current.r;
    float v = current.g;

    float leftHeight  = texture2D(uPrev, uv - vec2(uTexel.x, 0.0)).r;
    float rightHeight = texture2D(uPrev, uv + vec2(uTexel.x, 0.0)).r;
    float downHeight  = texture2D(uPrev, uv - vec2(0.0, uTexel.y)).r;
    float upHeight    = texture2D(uPrev, uv + vec2(0.0, uTexel.y)).r;`;
const stateReplacement = String.raw`    // A small upper-left read offset carries real state features toward the
    // lower-right in the next frame. Every surface cue still comes from this
    // live height-and-velocity buffer; the bed itself is never shifted.
    vec2 advectedUv = clamp(
      uv + uFlowStep,
      uTexel * 1.5,
      vec2(1.0) - uTexel * 1.5
    );
    vec4 current = sampleState(advectedUv);
    float h = current.r;
    float v = current.g;

    float leftHeight  = sampleState(advectedUv - vec2(uTexel.x, 0.0)).r;
    float rightHeight = sampleState(advectedUv + vec2(uTexel.x, 0.0)).r;
    float downHeight  = sampleState(advectedUv - vec2(0.0, uTexel.y)).r;
    float upHeight    = sampleState(advectedUv + vec2(0.0, uTexel.y)).r;`;

const defaultsTarget = 'uTexel:{value:new st(1/a,1/l)},uDamping:{value:.9965},uWaveSpeed:{value:.22},uTime:{value:0},uCurrentStrength:{value:.00035}';
const defaultsReplacement = 'uTexel:{value:new st(1/a,1/l)},uDamping:{value:.9965},uWaveSpeed:{value:.22},uFlowStep:{value:new st(0,0)},uTime:{value:0},uCurrentStrength:{value:.00035}';
const frameTarget = 'te.uniforms.uTime.value+=se,te.uniforms.uCurrentStrength.value=.00035';
const frameReplacement = 'te.uniforms.uTime.value+=se,te.uniforms.uFlowStep.value.set(-se*.003,se*.010),te.uniforms.uCurrentStrength.value=.00035';

bundle = replaceOnce(bundle, uniformTarget, uniformReplacement, 'simulation flow-step uniform');
const solverStart = bundle.indexOf('`,LX=`');
const displayStart = bundle.indexOf('`,zX=`');
const helperIndex = bundle.indexOf(helperTarget, solverStart);
if (helperIndex < 0 || helperIndex >= displayStart) {
  throw new Error('Could not locate the simulation-only helper insertion point.');
}
bundle = bundle.slice(0, helperIndex) + helperReplacement + bundle.slice(helperIndex + helperTarget.length);
bundle = replaceOnce(bundle, stateTarget, stateReplacement, 'simulation state sample block');
bundle = replaceOnce(bundle, defaultsTarget, defaultsReplacement, 'simulation flow-step defaults');
bundle = replaceOnce(bundle, frameTarget, frameReplacement, 'per-frame angled flow update');
bundle += '\n/* FLOW_SMOOTH_ANGLED_INTERSECTING_EXPERIMENT */\n';
fs.writeFileSync(bundlePath, bundle);
console.log(`Applied smooth angled live-state transport to ${bundlePath}.`);
