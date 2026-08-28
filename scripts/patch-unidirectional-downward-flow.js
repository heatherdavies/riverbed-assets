/*
 * Corrects the visually reversed dominant crest layer identified in the user's
 * recording. The patch keeps the water live and height-driven, but makes one
 * sparse crest family travel from screen top to bottom without lateral/trailing
 * layers that could create an opposing-flow read.
 */
const fs = require('fs');
const path = require('path');

const bundlePath = path.resolve(__dirname, '../assets/web/assets/index-CDavGNLu.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

if (!bundle.includes('FLOW_DOMINANT_DOWNWARD_CRESTS')) {
  throw new Error('The dominant-crest refinement is required before applying the unidirectional cleanup.');
}
if (bundle.includes('FLOW_UNIDIRECTIONAL_DOWNWARD_FLOW')) {
  console.log('Unidirectional downward-flow cleanup is already present.');
  process.exit(0);
}

const simulationTarget = String.raw`    // Source-of-truth directional crest field. In Flow's UV orientation, the
    // positive time phase carries each broad leading crest from top to bottom.
    // The small x component merely keeps the live water organic; it cannot
    // compete with or obscure the downward crest direction.
    float downwardPhase = uv.y * 17.5 + uTime * 3.10
                        + sin(uv.x * 2.2 + uTime * 0.14) * 0.15;
    float downwardCrest = sin(downwardPhase + h * 1600.0);
    h += downwardCrest * 0.000090 * mix(1.0, edge, uContained);`;

const simulationReplacement = String.raw`    // One sparse, top-to-bottom crest family is injected into the same live
    // height field. The negative time phase reverses the visually upward drift
    // identified in the review recording; cross-current bend is deliberately
    // negligible so this layer cannot imply a second direction.
    float downwardPhase = uv.y * 12.0 - uTime * 2.35
                        + sin(uv.x * 1.4 - uTime * 0.10) * 0.06;
    float downwardCrest = sin(downwardPhase + h * 850.0);
    h += downwardCrest * 0.000075 * mix(1.0, edge, uContained);`;

const displayTarget = String.raw`    // Downward travelling, nearly horizontal crest faces dominate the water
    // read. The narrow leading crest has only a slight x meander, while small
    // height-coupled detail keeps the bands from becoming graphic stripes.
    float downPhase = uv.y * 17.5 + travel * 3.10
                    + sin(uv.x * 2.2 + travel * 0.14) * 0.15
                    + h * 3400.0;
    float crestWave = sin(downPhase);
    float leadingCrest = pow(max(crestWave, 0.0), 1.65);
    float trailingDetail = sin(uv.y * 56.0 + uv.x * 3.0 + travel * 4.1 + h * 5600.0);
    vec2 fineRipple = vec2(
      cos(downPhase) * 0.008 + trailingDetail * 0.003,
      crestWave * 0.105 + trailingDetail * 0.009
    ) * uReadability;
    vec2 surfaceSlope = broadGradient * 0.55 + fineRipple;`;

const displayReplacement = String.raw`    // The display is driven by one sparse, nearly horizontal crest family.
    // The negative time phase agrees with the corrected solver flow and reads
    // as top-to-bottom on screen; lateral meander and all trailing detail have
    // been removed so no competing crest direction remains.
    float downPhase = uv.y * 12.0 - travel * 2.35
                    + sin(uv.x * 1.4 - travel * 0.10) * 0.06
                    + h * 1250.0;
    float crestWave = sin(downPhase);
    float leadingCrest = pow(max(crestWave, 0.0), 1.65);
    vec2 fineRipple = vec2(
      cos(downPhase) * 0.004,
      crestWave * 0.072
    ) * uReadability;
    vec2 surfaceSlope = broadGradient * 0.30 + fineRipple;`;

function replaceOnce(source, target, replacement, label) {
  const first = source.indexOf(target);
  if (first < 0) throw new Error(`Could not locate ${label}.`);
  if (source.indexOf(target, first + target.length) >= 0) {
    throw new Error(`Located ${label} more than once.`);
  }
  return source.slice(0, first) + replacement + source.slice(first + target.length);
}

bundle = replaceOnce(bundle, simulationTarget, simulationReplacement, 'dominant crest solver block');
bundle = replaceOnce(bundle, displayTarget, displayReplacement, 'dominant crest display block');
bundle += '\n/* FLOW_UNIDIRECTIONAL_DOWNWARD_FLOW */\n';
fs.writeFileSync(bundlePath, bundle);
console.log(`Patched ${bundlePath} with a single unidirectional downward crest field.`);
