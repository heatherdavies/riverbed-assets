/*
 * Experimental branch only: an inlet–transport–outlet current based on the
 * saved Angled Intersecting Flow checkpoint. Waves are seeded just above the
 * visible top edge, carried straight downward by the live height/velocity
 * ping-pong state, and absorbed below the visible bottom edge.
 *
 * The riverbed texture is never translated. Display overscan samples an
 * interior strip of the live state only, so the inlet and outlet boundaries
 * stay out of view rather than being hidden by a scrolling overlay.
 */
const fs = require('fs');
const path = require('path');

const bundlePath = path.resolve(__dirname, '../assets/web/assets/index-CDavGNLu.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

if (!bundle.includes('FLOW_SMOOTH_ANGLED_INTERSECTING_EXPERIMENT')) {
  throw new Error('Expected the saved Angled Intersecting Flow experiment as the baseline.');
}
if (bundle.includes('FLOW_VERTICAL_INLET_OUTLET_EXPERIMENT')) {
  console.log('Vertical Inlet Intersecting Flow experiment is already present.');
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

const transportTarget = 'te.uniforms.uFlowStep.value.set(-se*.003,se*.010)';
const transportReplacement = 'te.uniforms.uFlowStep.value.set(0,se*.018)';

const seedTarget = String.raw`    // Source-of-truth travelling open-current seed. uTime is elapsed seconds.
    float ambient = sin(uv.x * 22.0 + uTime * 0.7)
                  * cos(uv.y * 19.0 - uDirection * uTime * 0.55);
    // Open current is the default. The retained contained option uses only the
    // reference's gentle 5% absorbing boundary.
    float margin = 0.05;
    float ex = smoothstep(0.0, margin, uv.x) * smoothstep(0.0, margin, 1.0 - uv.x);
    float ey = smoothstep(0.0, margin, uv.y) * smoothstep(0.0, margin, 1.0 - uv.y);
    float edge = ex * ey;
    v *= mix(1.0, mix(0.985, 1.0, edge), uContained);
    h *= mix(1.0, mix(0.970, 1.0, edge), uContained);
    h += ambient * uCurrentStrength * mix(1.0, edge, uContained);
    // One sparse, top-to-bottom crest family is injected into the same live
    // height field. The negative time phase reverses the visually upward drift
    // identified in the review recording; cross-current bend is deliberately
    // negligible so this layer cannot imply a second direction.
    float downwardPhase = uv.y * 12.0 - uTime * 2.35
                        + sin(uv.x * 1.4 - uTime * 0.10) * 0.06;
    float downwardCrest = sin(downwardPhase + h * 850.0);
    h += downwardCrest * 0.000075 * mix(1.0, edge, uContained);`;

const seedReplacement = String.raw`    // The current has a real source: two gently varying wave trains are added
    // only in a narrow upper buffer band. Once seeded, each disturbance is
    // transported through the same live field rather than regenerated across
    // the whole visible surface.
    float inlet = smoothstep(0.982, 0.999, uv.y);
    float inletA = sin(uv.x * 20.0 + uTime * 0.76
                     + sin(uv.x * 4.1 - uTime * 0.19) * 0.42);
    float inletB = sin(uv.x * 31.0 - uTime * 0.43 + 1.7);
    float inletWave = inletA * 0.74 + inletB * 0.26;
    float inletImpulse = inletWave * uCurrentStrength * 3.3 * inlet;
    h += inletImpulse;
    v += inletImpulse * 0.20;

    // At the opposite edge, gently absorb state so the current can leave the
    // lower screen instead of reflecting back into the incoming wave train.
    float outlet = 1.0 - smoothstep(0.0, 0.036, uv.y);
    h *= mix(1.0, 0.72, outlet);
    v *= mix(1.0, 0.62, outlet);`;

const displayTarget = String.raw`  void main() {
    vec2 uv = vUv;
    float h = texture2D(uHeight, uv).r;
    float hL = texture2D(uHeight, uv - vec2(uTexel.x, 0.0)).r;
    float hR = texture2D(uHeight, uv + vec2(uTexel.x, 0.0)).r;
    float hD = texture2D(uHeight, uv - vec2(0.0, uTexel.y)).r;
    float hU = texture2D(uHeight, uv + vec2(0.0, uTexel.y)).r;`;

const displayReplacement = String.raw`  void main() {
    vec2 uv = vUv;
    // Show only the settled interior of the same live height field. The top
    // source and bottom absorber remain off-screen; the riverbed below still
    // uses unmodified uv coordinates and never scrolls.
    vec2 simUv = vec2(uv.x, mix(0.036, 0.964, uv.y));
    float h = texture2D(uHeight, simUv).r;
    float hL = texture2D(uHeight, simUv - vec2(uTexel.x, 0.0)).r;
    float hR = texture2D(uHeight, simUv + vec2(uTexel.x, 0.0)).r;
    float hD = texture2D(uHeight, simUv - vec2(0.0, uTexel.y)).r;
    float hU = texture2D(uHeight, simUv + vec2(0.0, uTexel.y)).r;`;

bundle = replaceOnce(bundle, transportTarget, transportReplacement, 'vertical transport update');
const seedStart = bundle.indexOf('    // Source-of-truth travelling open-current seed. uTime is elapsed seconds.');
const seedEnd = bundle.indexOf('    if (uPointerDown > 0.5)', seedStart);
if (seedStart < 0 || seedEnd < 0) {
  throw new Error('Could not locate the bounded global-seed replacement region.');
}
bundle = bundle.slice(0, seedStart) + seedReplacement + bundle.slice(seedEnd);
const displayStart = bundle.indexOf('`,zX=`');
const displayIndex = bundle.indexOf(displayTarget, displayStart);
if (displayIndex < 0) throw new Error('Could not locate the water display sampling block.');
bundle = bundle.slice(0, displayIndex) + displayReplacement + bundle.slice(displayIndex + displayTarget.length);
bundle += '\n/* FLOW_VERTICAL_INLET_OUTLET_EXPERIMENT */\n';
fs.writeFileSync(bundlePath, bundle);
console.log(`Applied vertical inlet–transport–outlet experiment to ${bundlePath}.`);
