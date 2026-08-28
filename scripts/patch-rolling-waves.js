/*
 * Refines the approved live-current bundle with subtle top-to-bottom rolling
 * waves. The waves are injected into the existing height-and-velocity solver
 * and amplified through its height-derived display normal; no image layer,
 * cellular map, or independently scrolling texture is introduced.
 */
const fs = require('fs');
const path = require('path');

const bundlePath = path.resolve(__dirname, '../assets/web/assets/index-CDavGNLu.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

if (!bundle.includes('FLOW_CURRENT_REFERENCE_INTEGRATED')) {
  throw new Error('The validated live-current integration is required before applying rolling waves.');
}
if (bundle.includes('FLOW_TOP_TO_BOTTOM_ROLLING_WAVES')) {
  console.log('Top-to-bottom rolling-wave refinement is already present.');
  process.exit(0);
}

const simulationTarget = String.raw`    h += ambient * uCurrentStrength * mix(1.0, edge, uContained);

    if (uPointerDown > 0.5) {`;
const simulationReplacement = String.raw`    h += ambient * uCurrentStrength * mix(1.0, edge, uContained);

    // Broad, low-amplitude crests are a second live forcing term in the same
    // height field. In Flow's UV orientation, the positive time phase carries
    // the crests visually from the top of the screen down toward the bottom.
    float rollingPhase = uv.y * 28.0 + uTime * 2.45
                       + sin(uv.x * 5.0 + uTime * 0.20) * 0.62;
    float rollingCurrent = sin(rollingPhase + h * 2100.0);
    h += rollingCurrent * 0.000055 * mix(1.0, edge, uContained);

    if (uPointerDown > 0.5) {`;

const presentationTarget = String.raw`    float travel = uDirection * uTime;
    float sideMeander = sin(uv.x * 8.0 + travel * 0.23) * 0.35;
    float ripplePhaseA = uv.x * 30.0 + uv.y * 126.0 - travel * 5.2 + sideMeander + h * 4800.0;
    float ripplePhaseB = uv.x * 54.0 - uv.y * 88.0 - travel * 3.1 + h * 3600.0;
    float ripplePhaseC = (uv.x + uv.y) * 78.0 - travel * 2.2 + h * 2800.0;
    vec2 fineRipple = vec2(
      cos(ripplePhaseA) * 0.040 + cos(ripplePhaseB) * 0.017,
      sin(ripplePhaseB) * 0.034 + sin(ripplePhaseC) * 0.014
    ) * uReadability;`;
const presentationReplacement = String.raw`    float travel = uDirection * uTime;

    // These crests share the live solver's height and time state. The nearly
    // horizontal bands progress top-to-bottom, with modest cross-current
    // meander so they read as rolling shallow-water waves—not a uniform shine.
    float rollPhase = uv.y * 28.0 + travel * 2.45
                    + sin(uv.x * 5.0 + travel * 0.20) * 0.62
                    + h * 4600.0;
    float rollDetail = uv.y * 61.0 + uv.x * 7.0 + travel * 4.60 + h * 6100.0;
    float rollCrest = sin(rollPhase);
    vec2 fineRipple = vec2(
      cos(rollPhase + uv.x * 2.8) * 0.017 + sin(rollDetail) * 0.008,
      rollCrest * 0.066 + sin(rollDetail) * 0.020
    ) * uReadability;`;

function replaceOnce(source, target, replacement, label) {
  const first = source.indexOf(target);
  if (first < 0) throw new Error(`Could not locate ${label}.`);
  if (source.indexOf(target, first + target.length) >= 0) {
    throw new Error(`Located ${label} more than once.`);
  }
  return source.slice(0, first) + replacement + source.slice(first + target.length);
}

bundle = replaceOnce(bundle, simulationTarget, simulationReplacement, 'live simulation injection point');
bundle = replaceOnce(bundle, presentationTarget, presentationReplacement, 'visible ripple response');
bundle += '\n/* FLOW_TOP_TO_BOTTOM_ROLLING_WAVES */\n';
fs.writeFileSync(bundlePath, bundle);
console.log(`Patched ${bundlePath} with live top-to-bottom rolling waves.`);
